/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FacetName = "geometry" | "architecture" | "cost" | "human";

export type CanonicalFacetKey =
  | "geometry"
  | "system_arch"
  | "energetic_cost"
  | "human_access";

export type ConvergenceMode =
  | "unified-architecture"
  | "tradeoff-matrix"
  | "executable-spec";

export interface Emission {
  id: string;
  createdAt: string;
  author: "self";
  title: string;
  rawContent: string;
  hardConstraints: string[];
}

export interface FacetProjection {
  emissionId: string;
  facet: FacetName;
  canonicalKey?: CanonicalFacetKey;
  title: string;
  claims: string[];
  invariantsOrBounds: string[];
  tensions?: string[];
}

export interface Interference {
  id: string;
  emissionId: string;
  facets: [FacetName, FacetName];
  kind: "collision" | "reinforcement";
  description: string;
  resolution: string;
}

export interface ConvergenceArtifact {
  id: string;
  emissionId: string;
  mode: ConvergenceMode;
  createdAt: string;
  interferencesResolved: string[];
  bodyMarkdown: string;
}

export interface PrismWorkspace {
  emission: Emission;
  projections: Record<FacetName, FacetProjection>;
  interferences: Interference[];
  convergences: ConvergenceArtifact[];
  targetConvergenceMode?: ConvergenceMode;
  skillVersion?: string;
}

export interface PresetProject {
  id: string;
  title: string;
  summary: string;
  emission: {
    title: string;
    rawContent: string;
    hardConstraints: string[];
  };
  projections: Record<
    FacetName,
    {
      title: string;
      claims: string[];
      invariantsOrBounds: string[];
      tensions?: string[];
    }
  >;
  interferences: Array<{
    facets: [FacetName, FacetName];
    kind: "collision" | "reinforcement";
    description: string;
    resolution: string;
  }>;
}
