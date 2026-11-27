/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  X,
  Layers,
  Copy,
  Check,
  Download,
  Compass,
  Terminal,
  Table,
  Braces,
  AlertTriangle,
} from "lucide-react";
import {
  PrismWorkspace,
  ConvergenceMode,
  ConvergenceArtifact,
} from "../core/types";
import {
  PRISM_SKILL_METADATA,
  toCanonicalFacetKey,
  workspaceToPrismResult,
} from "../core/prismSkill";

interface ConvergenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: PrismWorkspace;
  onUpdateWorkspace: (newWs: PrismWorkspace) => void;
}

type ModalTab = ConvergenceMode | "prism-result-json";

export const ConvergenceModal: React.FC<ConvergenceModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onUpdateWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>(
    workspace.targetConvergenceMode || "unified-architecture"
  );
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(workspace.targetConvergenceMode || "unified-architecture");
      setCopied(false);
      setSavedToast(false);
    }
  }, [isOpen, workspace.targetConvergenceMode]);

  if (!isOpen) return null;

  const resolvedMode: ConvergenceMode =
    activeTab === "prism-result-json"
      ? workspace.targetConvergenceMode || "unified-architecture"
      : activeTab;

  const unresolvedCollisions = workspace.interferences.filter(
    (inf) => inf.kind === "collision" && !inf.resolution.trim()
  );

  const generateArtifactBody = (tab: ModalTab): string => {
    if (tab === "prism-result-json") {
      return JSON.stringify(
        workspaceToPrismResult(workspace, resolvedMode),
        null,
        2
      );
    }

    const { emission, projections, interferences } = workspace;
    const collisions = interferences.filter((i) => i.kind === "collision");
    const reinforcements = interferences.filter(
      (i) => i.kind === "reinforcement"
    );

    if (tab === "unified-architecture") {
      return `### Unified Architecture: ${emission.title}
> Generated via \`prism-skill\` v${PRISM_SKILL_METADATA.version} (\`runtime: ${PRISM_SKILL_METADATA.runtime}\`)

#### 1. Incident Input & Constraints
${emission.rawContent}

${emission.hardConstraints.map((c) => `- [x] ${c}`).join("\n") || "- No hard constraints specified"}

#### 2. Orthogonal Facet Synthesis
- **geometry**: ${projections.geometry.claims[0] || "Defined radial topology"}
- **system_arch**: ${projections.architecture.claims[0] || "Decoupled state machine"}
- **energetic_cost**: ${projections.cost.claims[0] || "Demand-driven rendering"}
- **human_access**: ${projections.human.claims[0] || "Calm zero-friction entry"}

#### 3. Cross-Facet Interference Arbitration
**Destructive Collisions (${collisions.length})**
${
  collisions
    .map(
      (inf) =>
        `- **${toCanonicalFacetKey(inf.facets[0])} ↔ ${toCanonicalFacetKey(inf.facets[1])}**: ${inf.description}\n  - *Resolution Strategy*: ${inf.resolution || "UNRESOLVED"}`
    )
    .join("\n") || "- None"
}

**Constructive Reinforcements (${reinforcements.length})**
${
  reinforcements
    .map(
      (inf) =>
        `- **${toCanonicalFacetKey(inf.facets[0])} ↔ ${toCanonicalFacetKey(inf.facets[1])}**: ${inf.description}`
    )
    .join("\n") || "- None"
}`;
    } else if (tab === "tradeoff-matrix") {
      return `### Trade-Off Matrix: ${emission.title}

| Canonical Lens | Primary Finding | Primary Tension | Constraint / Invariant |
| :--- | :--- | :--- | :--- |
| **geometry** | ${projections.geometry.claims[0] || "N/A"} | ${projections.geometry.tensions?.[0] || "None noted"} | ${projections.geometry.invariantsOrBounds[0] || "None"} |
| **system_arch** | ${projections.architecture.claims[0] || "N/A"} | ${projections.architecture.tensions?.[0] || "None noted"} | ${projections.architecture.invariantsOrBounds[0] || "None"} |
| **energetic_cost** | ${projections.cost.claims[0] || "N/A"} | ${projections.cost.tensions?.[0] || "None noted"} | ${projections.cost.invariantsOrBounds[0] || "None"} |
| **human_access** | ${projections.human.claims[0] || "N/A"} | ${projections.human.tensions?.[0] || "None noted"} | ${projections.human.invariantsOrBounds[0] || "None"} |

#### Collision Resolutions
${
  collisions
    .map(
      (c) =>
        `- **${toCanonicalFacetKey(c.facets[0])} ↔ ${toCanonicalFacetKey(c.facets[1])}**: ${c.resolution || "Pending resolution"}`
    )
    .join("\n") || "- All clear"
}`;
    } else {
      const safeName =
        emission.title.replace(/[^a-zA-Z0-9]/g, "") || "PrismSystem";
      const prismResult = workspaceToPrismResult(workspace, "executable-spec");
      const tsCode = `// Generated via prism-skill v${PRISM_SKILL_METADATA.version}
export interface ${safeName}Spec {
  incidentInput: string;
  convergenceMode: "executable-spec";
  constraints: string[];
  facets: ["geometry", "system_arch", "energetic_cost", "human_access"];
  invariants: {
    geometry: string[];
    system_arch: string[];
    energetic_cost: string[];
    human_access: string[];
  };
}

export const spec: ${safeName}Spec = ${JSON.stringify(
        {
          incidentInput: emission.rawContent,
          convergenceMode: "executable-spec",
          constraints: emission.hardConstraints,
          facets: ["geometry", "system_arch", "energetic_cost", "human_access"],
          invariants: {
            geometry: projections.geometry.invariantsOrBounds,
            system_arch: projections.architecture.invariantsOrBounds,
            energetic_cost: projections.cost.invariantsOrBounds,
            human_access: projections.human.invariantsOrBounds,
          },
        },
        null,
        2
      )};`;

      return `### Executable Specification: ${emission.title}

\`\`\`ts
${tsCode}
\`\`\`

#### Harness Verification Summary
1. **Capture**: \`incidentInput\` anchored with ${emission.hardConstraints.length} constraint(s).
2. **Refract**: ${prismResult.refractions.length} isolated facets (\`geometry\`, \`system_arch\`, \`energetic_cost\`, \`human_access\`).
3. **Interfere**: ${prismResult.interferenceReport.collisions.length} collision(s) and ${prismResult.interferenceReport.reinforcements.length} reinforcement(s) mapped.
4. **Converge**: Mode \`executable-spec\` crystallized at \`${prismResult.timestamp}\`.`;
    }
  };

  const currentBody = generateArtifactBody(activeTab);

  const handleSaveArtifact = () => {
    const artifact: ConvergenceArtifact = {
      id: `conv_${Date.now()}`,
      emissionId: workspace.emission.id,
      mode: resolvedMode,
      createdAt: new Date().toISOString(),
      interferencesResolved: workspace.interferences
        .filter((i) => i.resolution.trim().length > 0)
        .map((i) => i.id),
      bodyMarkdown: currentBody,
    };

    const updated: PrismWorkspace = {
      ...workspace,
      targetConvergenceMode: resolvedMode,
      convergences: [artifact, ...workspace.convergences],
    };
    onUpdateWorkspace(updated);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Convergence Horizon</h2>
              <p className="text-xs text-slate-400 font-mono">
                prism-skill v{PRISM_SKILL_METADATA.version} • Structured Convergence Output
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="Close convergence modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unresolved collision guard notice */}
        {unresolvedCollisions.length > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {unresolvedCollisions.length} destructive collision(s) still need
              a resolution strategy before final sign-off.
            </span>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("unified-architecture")}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "unified-architecture"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Unified Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab("tradeoff-matrix")}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "tradeoff-matrix"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Trade-Off Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("executable-spec")}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "executable-spec"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Executable Spec</span>
          </button>
          <button
            onClick={() => setActiveTab("prism-result-json")}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "prism-result-json"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Braces className="w-4 h-4" />
            <span>PrismResult JSON</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
          {currentBody}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 shrink-0">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>
              {copied
                ? "Copied to Clipboard!"
                : activeTab === "prism-result-json"
                ? "Copy PrismResult JSON"
                : "Copy Markdown"}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
            >
              Close
            </button>
            <button
              onClick={handleSaveArtifact}
              disabled={unresolvedCollisions.length > 0}
              title={
                unresolvedCollisions.length > 0
                  ? "Resolve all destructive collisions first"
                  : "Save crystallized artifact to local vault"
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-md shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savedToast ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {savedToast ? "Artifact Crystallized!" : "Crystallize & Save Artifact"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
