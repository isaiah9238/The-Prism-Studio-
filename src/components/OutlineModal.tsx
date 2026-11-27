/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, ListTree, Compass } from "lucide-react";
import { PrismWorkspace } from "../core/types";
import { CANONICAL_FACETS, toCanonicalFacetKey } from "../core/prismSkill";

interface OutlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: PrismWorkspace;
}

export const OutlineModal: React.FC<OutlineModalProps> = ({
  isOpen,
  onClose,
  workspace,
}) => {
  if (!isOpen) return null;

  const { emission, projections, interferences } = workspace;

  return (
    <div className="absolute left-6 top-24 bottom-6 w-full max-w-md z-40 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ListTree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Accessible 2D Outline</h2>
            <p className="text-[11px] text-slate-400 font-mono">
              100% State Parity • prism-skill v{workspace.skillVersion || "1.0.0"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          aria-label="Close 2D outline view"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tree Content */}
      <div className="flex flex-col gap-6 font-mono text-xs">
        {/* Emission Node */}
        <div className="flex flex-col gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Compass className="w-4 h-4 shrink-0" />
            <span>INCIDENT INPUT: {emission.title}</span>
          </div>
          <p className="text-slate-300 font-sans leading-relaxed">
            {emission.rawContent}
          </p>
          <div className="mt-2 text-[10px] text-slate-500">
            Constraints: {emission.hardConstraints.join(" • ") || "None"}
          </div>
        </div>

        {/* Projections */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Orthogonal Facets (4)
          </span>

          {CANONICAL_FACETS.map(({ workspaceKey, canonicalKey, title }) => {
            const proj = projections[workspaceKey];
            if (!proj) return null;
            return (
              <div
                key={workspaceKey}
                className="flex flex-col gap-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold uppercase text-sky-300">
                    {proj.title || title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {canonicalKey}
                  </span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1 font-sans">
                  {proj.claims.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                {proj.invariantsOrBounds.length > 0 && (
                  <div className="mt-1 text-[10px] text-amber-400/90 font-mono">
                    Invariants: {proj.invariantsOrBounds.join(" | ")}
                  </div>
                )}
                {proj.tensions && proj.tensions.length > 0 && (
                  <div className="text-[10px] text-rose-300/90 font-mono">
                    Tensions: {proj.tensions.join(" | ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Interferences */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Interference Lattice ({interferences.length})
          </span>

          {interferences.map((inf) => (
            <div
              key={inf.id}
              className="flex flex-col gap-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${
                    inf.kind === "collision"
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-sky-500/20 text-sky-300"
                  }`}
                >
                  {inf.kind}
                </span>
                <span className="text-slate-400">
                  {toCanonicalFacetKey(inf.facets[0])} ↔{" "}
                  {toCanonicalFacetKey(inf.facets[1])}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                {inf.description}
              </p>
              <p className="text-[11px] text-emerald-400 font-sans font-medium">
                {inf.kind === "collision" ? "Resolution: " : "Synergy Strategy: "}
                {inf.resolution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
