/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrismWorkspace } from "../core/types";

export class OPFSVault {
  private isSupported(): boolean {
    return typeof window !== "undefined" && !!navigator.storage && !!navigator.storage.getDirectory;
  }

  async init(): Promise<void> {
    if (this.isSupported()) {
      try {
        const root = await navigator.storage.getDirectory();
        await root.getDirectoryHandle("prism_workspaces", { create: true });
      } catch (e) {
        console.warn("OPFS init warning:", e);
      }
    }
  }

  async saveWorkspace(workspace: PrismWorkspace): Promise<void> {
    const key = `prism_workspace_${workspace.emission.id}`;
    const data = JSON.stringify(workspace, null, 2);

    // Try OPFS first
    if (this.isSupported()) {
      try {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle("prism_workspaces", { create: true });
        const handle = await dir.getFileHandle(`${workspace.emission.id}.json`, { create: true });
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
      } catch (e) {
        console.warn("OPFS write failed, falling back to localStorage:", e);
        localStorage.setItem(key, data);
      }
    } else {
      localStorage.setItem(key, data);
    }

    // Also update index list
    this.indexEmission(workspace);
  }

  async loadWorkspace(emissionId: string): Promise<PrismWorkspace | null> {
    const key = `prism_workspace_${emissionId}`;
    if (this.isSupported()) {
      try {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle("prism_workspaces", { create: true });
        const handle = await dir.getFileHandle(`${emissionId}.json`);
        const file = await handle.getFile();
        const text = await file.text();
        return JSON.parse(text) as PrismWorkspace;
      } catch {
        // Fallback to localStorage
        const local = localStorage.getItem(key);
        if (local) return JSON.parse(local) as PrismWorkspace;
      }
    } else {
      const local = localStorage.getItem(key);
      if (local) return JSON.parse(local) as PrismWorkspace;
    }
    return null;
  }

  async listEmissions(): Promise<Array<{ id: string; title: string; createdAt: string; preview: string }>> {
    const list: Array<{ id: string; title: string; createdAt: string; preview: string }> = [];
    
    // Check localStorage index
    const indexStr = localStorage.getItem("prism_emissions_index");
    if (indexStr) {
      try {
        return JSON.parse(indexStr);
      } catch {
        // ignore
      }
    }

    if (this.isSupported()) {
      try {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle("prism_workspaces", { create: true });
        for await (const [name, handle] of dir.entries() as any) {
          if (name.endsWith(".json") && handle.kind === "file") {
            const file = await handle.getFile();
            const text = await file.text();
            const ws = JSON.parse(text) as PrismWorkspace;
            list.push({
              id: ws.emission.id,
              title: ws.emission.title || ws.emission.rawContent.slice(0, 40),
              createdAt: ws.emission.createdAt,
              preview: ws.emission.rawContent.slice(0, 80)
            });
          }
        }
      } catch (e) {
        console.warn("OPFS listing warning:", e);
      }
    }

    return list;
  }

  private indexEmission(workspace: PrismWorkspace) {
    try {
      const existing = localStorage.getItem("prism_emissions_index");
      let list: Array<{ id: string; title: string; createdAt: string; preview: string }> = existing ? JSON.parse(existing) : [];
      list = list.filter(item => item.id !== workspace.emission.id);
      list.unshift({
        id: workspace.emission.id,
        title: workspace.emission.title || workspace.emission.rawContent.slice(0, 40),
        createdAt: workspace.emission.createdAt,
        preview: workspace.emission.rawContent.slice(0, 80)
      });
      localStorage.setItem("prism_emissions_index", JSON.stringify(list));
    } catch (e) {
      console.warn("Index update warning:", e);
    }
  }

  generateMarkdownExport(workspace: PrismWorkspace): string {
    const { emission, projections, interferences, convergences } = workspace;
    const renderFacet = (
      label: string,
      canonicalKey: string,
      proj: PrismWorkspace["projections"][keyof PrismWorkspace["projections"]]
    ) => {
      const findings = proj.claims.map((c) => `- ${c}`).join("\n") || "- None";
      const invariants =
        proj.invariantsOrBounds.map((i) => `> ${i}`).join("\n") || "> None";
      const tensions =
        proj.tensions && proj.tensions.length > 0
          ? `\n**Tensions**:\n${proj.tensions.map((t) => `- ${t}`).join("\n")}`
          : "";

      return `### ${label} (\`${canonicalKey}\`)\n**Findings**:\n${findings}\n\n**Invariants**:\n${invariants}${tensions}`;
    };

    const collisions = interferences.filter((i) => i.kind === "collision");
    const reinforcements = interferences.filter(
      (i) => i.kind === "reinforcement"
    );

    const md = `# The Prism Studio: ${emission.title || "Emission"}

> **Created**: ${new Date(emission.createdAt).toLocaleString()}  
> **Author**: ${emission.author}  
> **Skill**: \`prism-skill\` v${workspace.skillVersion || "1.0.0"}  
> **Target Convergence Mode**: \`${workspace.targetConvergenceMode || "unified-architecture"}\`

## 1. Incident Input (Raw Emission)
${emission.rawContent}

### Hard Constraints
${emission.hardConstraints.map((c) => `- [x] ${c}`).join("\n") || "- None"}

## 2. Refractions Across Orthogonal Facets

${renderFacet("Geometry & Invariants", "geometry", projections.geometry)}

${renderFacet("System & Code Architecture", "system_arch", projections.architecture)}

${renderFacet("Energetic & Operational Cost", "energetic_cost", projections.cost)}

${renderFacet("Human & Open Access", "human_access", projections.human)}

## 3. Cross-Facet Interference Report

### Destructive Collisions (${collisions.length})
${
  collisions
    .map(
      (inf) =>
        `#### ${inf.facets[0]} ↔ ${inf.facets[1]}\n- **Conflict**: ${inf.description}\n- **Resolution Strategy**: ${inf.resolution}`
    )
    .join("\n\n") || "None recorded."
}

### Constructive Reinforcements (${reinforcements.length})
${
  reinforcements
    .map(
      (inf) =>
        `#### ${inf.facets[0]} ↔ ${inf.facets[1]}\n- **Synergy**: ${inf.description}\n- **Amplification**: ${inf.resolution}`
    )
    .join("\n\n") || "None recorded."
}

## 4. Converged Artifacts
${
  convergences
    .map(
      (conv) =>
        `### Mode: ${conv.mode} (${new Date(conv.createdAt).toLocaleString()})\n${conv.bodyMarkdown}`
    )
    .join("\n---\n") || "No crystallized artifacts yet."
}
`;
    return md;
  }
}

export const vault = new OPFSVault();
