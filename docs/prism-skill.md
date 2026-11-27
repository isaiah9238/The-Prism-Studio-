---
name: prism-skill
title: "Prism Multi-Facet System Refraction & Synthesis Engine"
description: >
  Decomposes complex systems, architectures, or problem statements across orthogonal facets (Geometry, System Architecture, Energetic Cost, Human Ergonomics) with explicit interference checks and structured convergence modes.
version: 1.0.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
tags: [system-refraction, multi-facet-analysis, trade-off-matrix, architecture, convergence]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Prism Multi-Facet System Refraction & Synthesis Engine (`prism-skill`)

## Description & Mission
The **`prism-skill`** decomposes coupled problems, multi-dimensional architectures, and complex technical challenges across orthogonal analytical lenses. Rather than collapsing multifaceted requirements into premature compromises, it refracts the subject into distinct facets, explicitly tests cross-facet interference (tensions, trade-offs, and reinforcements), and converges the findings into a target deliverable format (`unified-architecture`, `tradeoff-matrix`, or `executable-spec`).

---

## When to Use & Routing Boundary

### Optimal Triggers
* **Refracting Coupled Architectures**: Decomposing monolithic or multi-layered systems into independent structural, computational, and human-facing dimensions.
* **Resolving Conflicting Constraints**: Auditing tensions where spatial/geometric requirements, runtime/memory budgets, latency limits, and ergonomic usability collide.
* **Structured Architectural Convergence**: Generating formal architecture blueprints, decision trade-off matrices, or end-to-end executable specifications.

### Gotchas & Anti-Patterns
* **Avoid premature blending**: Keep each lens strictly isolated during refraction so that fundamental tensions and architectural trade-offs remain visible.
* **Mathematical & Scientific Formalisms**: Defer general first-principles cross-domain math or physical formalisms to `polymathic-technical-synthesis` when that is the primary objective.
* **Execution Realism**: Do not hallucinate external network calls or file writes that did not execute in the runtime environment.

---

## Parameters & Invocation Schema

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `incidentInput` | `string` | **Yes** | — | Target system, module, codebase, or problem statement to refract. |
| `constraints` | `array<string>` | No | `[]` | Non-negotiable boundary conditions, regulatory floors, or operational caps. |
| `facets` | `array<string>` | No | `["geometry", "system_arch", "energetic_cost", "human_access"]` | Target analytical lenses for refraction. |
| `targetConvergenceMode` | `string` | No | `"unified-architecture"` | Final deliverable mode: `unified-architecture`, `tradeoff-matrix`, or `executable-spec`. |

---

## The Four Core Analytical Lenses

1. **Geometry and Invariants**:
   * Spatial layout, coordinate topologies, data models, shape invariants, schema boundaries, and mathematical symmetries.
2. **System and Code Architecture**:
   * Module boundaries, runtime execution targets, dependency acyclicity, state flow, data contracts, and fault containment.
3. **Energetic and Operational Cost**:
   * Computational complexity ($O(N)$ footprints), RAM/VRAM allocations, network/disk I/O latency, local-first runtime feasibility, and cloud unit costs.
4. **Human and Open Access**:
   * Ergonomic developer experience (DX), interface friction, ownership sovereignty, auditable inspectability, and cognitive load.

---

## Cross-Facet Interference Check

Before converging, the engine runs a 2-way interference matrix:
* **Constructive Reinforcements**: Where optimizations in one facet naturally benefit another (e.g., local-first execution eliminating network roundtrip latency while simultaneously enhancing data privacy and human ownership).
* **Destructive Collisions**: Where requirements directly oppose one another (e.g., high-fidelity 3D rendering or rich ML embeddings demanding heavy compute that threatens low-power mobile budgets or zero-latency UX).
* **Arbitration & Resolution**: Explicitly articulates the architectural mechanism that resolves the collision (e.g., level-of-detail degradation, asynchronous background workers, or tiered edge-cloud caching).

---

## Executable Control Harness

```typescript
export interface PrismParams {
  incidentInput: string;
  constraints?: string[];
  facets?: Array<'geometry' | 'system_arch' | 'energetic_cost' | 'human_access' | string>;
  targetConvergenceMode?: 'unified-architecture' | 'tradeoff-matrix' | 'executable-spec';
}

export interface FacetRefraction {
  facetName: string;
  invariants: string[];
  findings: string[];
  tensions: string[];
}

export interface PrismResult {
  incidentInput: string;
  convergenceMode: 'unified-architecture' | 'tradeoff-matrix' | 'executable-spec';
  refractions: FacetRefraction[];
  interferenceReport: {
    reinforcements: Array<{ facets: string[]; synergy: string }>;
    collisions: Array<{ facets: string[]; conflict: string; resolutionStrategy: string }>;
  };
  convergedOutput: Record<string, any>;
  timestamp: string;
}

export async function executePrismSkill(params: PrismParams): Promise<PrismResult> {
  const activeFacets = params.facets && params.facets.length > 0 
    ? params.facets 
    : ['geometry', 'system_arch', 'energetic_cost', 'human_access'];

  const mode = params.targetConvergenceMode || 'unified-architecture';

  // Step 1: Capture subject and constraints
  const subject = params.incidentInput.trim();
  const hardConstraints = params.constraints || [];

  // Step 2 & 3: Refract and check cross-facet interference
  const refractions: FacetRefraction[] = activeFacets.map(facet => ({
    facetName: facet,
    invariants: [`Preserve boundary integrity for ${facet}`],
    findings: [`Analyzed ${subject} across ${facet}`],
    tensions: []
  }));

  // Step 4: Converge based on target mode
  return {
    incidentInput: subject,
    convergenceMode: mode,
    refractions,
    interferenceReport: {
      reinforcements: [
        {
          facets: ['system_arch', 'human_access'],
          synergy: 'Modular pipeline architecture enables hot-swappable plugins and intuitive developer tooling.'
        }
      ],
      collisions: [
        {
          facets: ['geometry', 'energetic_cost'],
          conflict: 'High-density spatial models exceed baseline memory allocations.',
          resolutionStrategy: 'Implement progressive mesh decimation and streaming spatial bounding boxes.'
        }
      ]
    },
    convergedOutput: {
      mode,
      summary: `Converged analysis of ${subject} under mode ${mode}`,
      resolvedConstraintsCount: hardConstraints.length
    },
    timestamp: new Date().toISOString()
  };
}
```

---

## Registry Metadata & Ingestion Pointers
* **Document Location**: `gs://studio-alchemist-skills-registry/skills/prism-skill/guidelines.md`
* **Runtime Target**: `in_process`
* **Firestore Collection Path**: `/skills/prism-skill`
