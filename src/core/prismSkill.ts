/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CanonicalFacetKey,
  ConvergenceMode,
  FacetName,
  Interference,
  PrismWorkspace,
} from "./types";

export const PRISM_SKILL_METADATA = {
  name: "prism-skill",
  title: "Prism Multi-Facet System Refraction & Synthesis Engine",
  version: "1.0.0",
  category: "orchestration",
  securityClearance: "public",
  isExecutable: true,
  runtime: "in_process",
  thermodynamicFootprint: "low",
  requiresHumanReview: false,
  tags: [
    "system-refraction",
    "multi-facet-analysis",
    "trade-off-matrix",
    "architecture",
    "convergence",
  ],
} as const;

export const CANONICAL_FACETS: ReadonlyArray<{
  canonicalKey: CanonicalFacetKey;
  workspaceKey: FacetName;
  title: string;
  lensDescription: string;
}> = [
  {
    canonicalKey: "geometry",
    workspaceKey: "geometry",
    title: "Geometry & Invariants",
    lensDescription:
      "Spatial layout, coordinate topologies, data models, shape invariants, schema boundaries, and mathematical symmetries.",
  },
  {
    canonicalKey: "system_arch",
    workspaceKey: "architecture",
    title: "System & Code Architecture",
    lensDescription:
      "Module boundaries, runtime execution targets, dependency acyclicity, state flow, data contracts, and fault containment.",
  },
  {
    canonicalKey: "energetic_cost",
    workspaceKey: "cost",
    title: "Energetic & Operational Cost",
    lensDescription:
      "Computational complexity (O(N) footprints), RAM/VRAM allocations, network/disk I/O latency, local-first runtime feasibility, and cloud unit costs.",
  },
  {
    canonicalKey: "human_access",
    workspaceKey: "human",
    title: "Human & Open Access",
    lensDescription:
      "Ergonomic developer experience (DX), interface friction, ownership sovereignty, auditable inspectability, and cognitive load.",
  },
];

export interface PrismParams {
  incidentInput: string;
  constraints?: string[];
  facets?: Array<CanonicalFacetKey | string>;
  targetConvergenceMode?: ConvergenceMode;
}

export interface FacetRefraction {
  facetName: string;
  invariants: string[];
  findings: string[];
  tensions: string[];
}

export interface PrismInterferenceReport {
  reinforcements: Array<{ facets: string[]; synergy: string }>;
  collisions: Array<{
    facets: string[];
    conflict: string;
    resolutionStrategy: string;
  }>;
}

export interface PrismResult {
  incidentInput: string;
  convergenceMode: ConvergenceMode;
  refractions: FacetRefraction[];
  interferenceReport: PrismInterferenceReport;
  convergedOutput: Record<string, unknown>;
  timestamp: string;
}

export function toCanonicalFacetKey(facet: FacetName | string): CanonicalFacetKey {
  switch (facet.toLowerCase()) {
    case "geometry":
      return "geometry";
    case "architecture":
    case "system_arch":
    case "system":
      return "system_arch";
    case "cost":
    case "energetic_cost":
    case "energetic":
      return "energetic_cost";
    case "human":
    case "human_access":
      return "human_access";
    default:
      return "geometry";
  }
}

export function toWorkspaceFacetKey(facet: CanonicalFacetKey | string): FacetName {
  switch (facet.toLowerCase()) {
    case "geometry":
      return "geometry";
    case "system_arch":
    case "architecture":
    case "system":
      return "architecture";
    case "energetic_cost":
    case "cost":
    case "energetic":
      return "cost";
    case "human_access":
    case "human":
      return "human";
    default:
      return "geometry";
  }
}

/**
 * In-process deterministic execution harness matching /prism-skill.md v1.0.0.
 * Zero network calls, low thermodynamic footprint.
 */
export async function executePrismSkill(params: PrismParams): Promise<PrismResult> {
  const activeFacets: CanonicalFacetKey[] =
    params.facets && params.facets.length > 0
      ? params.facets.map((f) => toCanonicalFacetKey(f))
      : ["geometry", "system_arch", "energetic_cost", "human_access"];

  const mode: ConvergenceMode =
    params.targetConvergenceMode || "unified-architecture";

  const subject = params.incidentInput.trim() || "Untitled System";
  const subjectSnippet =
    subject.length > 72 ? `${subject.slice(0, 72)}...` : subject;
  const hardConstraints = (params.constraints || [])
    .map((c) => c.trim())
    .filter(Boolean);

  const lensTemplates: Record<CanonicalFacetKey, Omit<FacetRefraction, "facetName">> = {
    geometry: {
      invariants: [
        "Preserve strict boundary integrity and shape invariants for geometry",
        "Origin Attribution: every spatial node maps 1:1 to a persisted domain entity",
      ],
      findings: [
        `Decomposed coordinate topology and schema boundaries for: "${subjectSnippet}"`,
        hardConstraints[0]
          ? `Geometric boundary anchored to constraint: ${hardConstraints[0]}`
          : "Isolated structural topology without premature cross-facet blending",
      ],
      tensions: [
        "High-density spatial models can exceed baseline memory allocations on constrained devices",
      ],
    },
    system_arch: {
      invariants: [
        "Preserve acyclic module boundaries and deterministic state transitions for system_arch",
        "Fault containment between pure domain kernel, vault adapter, and presentation viewport",
      ],
      findings: [
        `Mapped runtime boundaries and unidirectional data contracts for: "${subjectSnippet}"`,
        hardConstraints[1]
          ? `Architecture enforces boundary condition: ${hardConstraints[1]}`
          : "Modular pipeline supports swappable adapters without altering core invariants",
      ],
      tensions: [
        "Strict interface decoupling introduces adapter boilerplate across storage and runtime layers",
      ],
    },
    energetic_cost: {
      invariants: [
        "Maintain low thermodynamic footprint via O(N) bounds and demand-driven execution",
        "Zero unrequested background compute or hidden network egress",
      ],
      findings: [
        `Evaluated compute, RAM/VRAM, and I/O latency envelope for: "${subjectSnippet}"`,
        hardConstraints[2]
          ? `Operational budget constrained by: ${hardConstraints[2]}`
          : "Local-first in-process execution eliminates mandatory cloud unit costs",
      ],
      tensions: [
        "Real-time visual or semantic richness competes directly with strict memory and battery caps",
      ],
    },
    human_access: {
      invariants: [
        "Preserve human ownership sovereignty, auditable inspectability, and low cognitive load",
        "Maintain keyboard-first and 2D outline parity with zero skewed text trapping",
      ],
      findings: [
        `Audited ergonomic developer experience (DX) and access friction for: "${subjectSnippet}"`,
        hardConstraints[3]
          ? `Human ergonomics bounded by: ${hardConstraints[3]}`
          : "Plain-file local persistence keeps all work inspectable outside the tool",
      ],
      tensions: [
        "Surfacing strict multi-facet constraints can slow down initial creative momentum if forced upfront",
      ],
    },
  };

  const refractions: FacetRefraction[] = activeFacets.map((facet) => ({
    facetName: facet,
    ...lensTemplates[facet],
  }));

  const interferenceReport: PrismInterferenceReport = {
    reinforcements: [
      {
        facets: ["system_arch", "human_access"],
        synergy:
          "Modular pipeline architecture enables hot-swappable adapters, auditable state inspection, and intuitive developer tooling.",
      },
      {
        facets: ["energetic_cost", "human_access"],
        synergy:
          "Local-first in-process execution eliminates network roundtrip latency while directly reinforcing human data ownership.",
      },
    ],
    collisions: [
      {
        facets: ["geometry", "energetic_cost"],
        conflict:
          "High-density spatial models and optical detail threaten baseline RAM/VRAM and power budgets.",
        resolutionStrategy:
          "Implement progressive mesh decimation, demand-driven rendering (0 fps idle sleep), and bounded spatial views.",
      },
      {
        facets: ["geometry", "human_access"],
        conflict:
          "Multi-dimensional spatial structures can increase cognitive load and impede direct text reading.",
        resolutionStrategy:
          "Lock active editing planes orthogonally to the viewport and maintain 1:1 2D outline parity.",
      },
    ],
  };

  return {
    incidentInput: subject,
    convergenceMode: mode,
    refractions,
    interferenceReport,
    convergedOutput: {
      mode,
      skillVersion: PRISM_SKILL_METADATA.version,
      summary: `Converged analysis of "${subjectSnippet}" under mode ${mode}`,
      resolvedConstraintsCount: hardConstraints.length,
      constraints: hardConstraints,
      activeFacets,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Converts a live PrismWorkspace into the canonical PrismResult contract from /prism-skill.md.
 */
export function workspaceToPrismResult(
  workspace: PrismWorkspace,
  mode?: ConvergenceMode
): PrismResult {
  const convergenceMode =
    mode || workspace.targetConvergenceMode || "unified-architecture";

  const refractions: FacetRefraction[] = CANONICAL_FACETS.map(
    ({ canonicalKey, workspaceKey }) => {
      const proj = workspace.projections[workspaceKey];
      return {
        facetName: canonicalKey,
        invariants: proj?.invariantsOrBounds || [],
        findings: proj?.claims || [],
        tensions: proj?.tensions || [],
      };
    }
  );

  const reinforcements = workspace.interferences
    .filter((inf) => inf.kind === "reinforcement")
    .map((inf) => ({
      facets: inf.facets.map((f) => toCanonicalFacetKey(f)),
      synergy: inf.resolution
        ? `${inf.description} (${inf.resolution})`
        : inf.description,
    }));

  const collisions = workspace.interferences
    .filter((inf) => inf.kind === "collision")
    .map((inf) => ({
      facets: inf.facets.map((f) => toCanonicalFacetKey(f)),
      conflict: inf.description,
      resolutionStrategy: inf.resolution,
    }));

  return {
    incidentInput: workspace.emission.rawContent,
    convergenceMode,
    refractions,
    interferenceReport: {
      reinforcements,
      collisions,
    },
    convergedOutput: {
      mode: convergenceMode,
      title: workspace.emission.title,
      skillVersion: workspace.skillVersion || PRISM_SKILL_METADATA.version,
      summary: `Converged analysis of ${workspace.emission.title || "Emission"} under mode ${convergenceMode}`,
      resolvedConstraintsCount: workspace.emission.hardConstraints.length,
      unresolvedCollisionsCount: collisions.filter(
        (c) => !c.resolutionStrategy.trim()
      ).length,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Applies a canonical PrismResult (from either in-process executePrismSkill or Gemini /api/refract)
 * back onto a PrismWorkspace while preserving the emission metadata.
 */
export function applyPrismResultToWorkspace(
  workspace: PrismWorkspace,
  result: PrismResult,
  emissionOverrides?: {
    title?: string;
    rawContent?: string;
    hardConstraints?: string[];
  }
): PrismWorkspace {
  const emissionId = workspace.emission.id;
  const updatedProjections = { ...workspace.projections };

  for (const refraction of result.refractions) {
    const wsKey = toWorkspaceFacetKey(refraction.facetName);
    const canonicalKey = toCanonicalFacetKey(refraction.facetName);
    const facetMeta = CANONICAL_FACETS.find((f) => f.workspaceKey === wsKey);

    updatedProjections[wsKey] = {
      emissionId,
      facet: wsKey,
      canonicalKey,
      title: facetMeta?.title || updatedProjections[wsKey]?.title || wsKey,
      claims: refraction.findings || [],
      invariantsOrBounds: refraction.invariants || [],
      tensions: refraction.tensions || [],
    };
  }

  const now = Date.now();
  const interferences: Interference[] = [];

  (result.interferenceReport?.collisions || []).forEach((col, idx) => {
    const f1 = toWorkspaceFacetKey(col.facets?.[0] || "geometry");
    const f2 = toWorkspaceFacetKey(col.facets?.[1] || "energetic_cost");
    interferences.push({
      id: `inf_col_${now}_${idx}`,
      emissionId,
      facets: [f1, f2],
      kind: "collision",
      description: col.conflict,
      resolution: col.resolutionStrategy,
    });
  });

  (result.interferenceReport?.reinforcements || []).forEach((reinf, idx) => {
    const f1 = toWorkspaceFacetKey(reinf.facets?.[0] || "system_arch");
    const f2 = toWorkspaceFacetKey(reinf.facets?.[1] || "human_access");
    interferences.push({
      id: `inf_reinf_${now}_${idx}`,
      emissionId,
      facets: [f1, f2],
      kind: "reinforcement",
      description: reinf.synergy,
      resolution: "Amplify constructive reinforcement across both facets.",
    });
  });

  return {
    ...workspace,
    skillVersion: PRISM_SKILL_METADATA.version,
    targetConvergenceMode: result.convergenceMode,
    emission: {
      ...workspace.emission,
      title: emissionOverrides?.title ?? workspace.emission.title,
      rawContent: emissionOverrides?.rawContent ?? result.incidentInput,
      hardConstraints:
        emissionOverrides?.hardConstraints ?? workspace.emission.hardConstraints,
    },
    projections: updatedProjections,
    interferences:
      interferences.length > 0 ? interferences : workspace.interferences,
  };
}
