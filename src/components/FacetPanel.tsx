/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Layers, ShieldAlert, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { FacetName, PrismWorkspace, FacetProjection } from "../core/types";

interface FacetPanelProps {
  activeFacet: FacetName | null;
  onClose: () => void;
  workspace: PrismWorkspace;
  onUpdateWorkspace: (newWs: PrismWorkspace) => void;
}

export const FacetPanel: React.FC<FacetPanelProps> = ({
  activeFacet,
  onClose,
  workspace,
  onUpdateWorkspace
}) => {
  if (!activeFacet) return null;

  const projection: FacetProjection = workspace.projections[activeFacet] || {
    emissionId: workspace.emission.id,
    facet: activeFacet,
    title: activeFacet.toUpperCase(),
    claims: [],
    invariantsOrBounds: []
  };

  const [claims, setClaims] = useState<string[]>(projection.claims);
  const [invariants, setInvariants] = useState<string[]>(projection.invariantsOrBounds);
  const [newClaim, setNewClaim] = useState("");
  const [newInvariant, setNewInvariant] = useState("");

  const facetColors: Record<FacetName, { border: string; text: string; bg: string }> = {
    geometry: { border: "border-sky-500/30", text: "text-sky-400", bg: "bg-sky-500/10" },
    architecture: { border: "border-indigo-500/30", text: "text-indigo-400", bg: "bg-indigo-500/10" },
    cost: { border: "border-rose-500/30", text: "text-rose-400", bg: "bg-rose-500/10" },
    human: { border: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10" }
  };

  const currentTheme = facetColors[activeFacet];

  const handleSave = () => {
    const updated: PrismWorkspace = {
      ...workspace,
      projections: {
        ...workspace.projections,
        [activeFacet]: {
          ...projection,
          claims,
          invariantsOrBounds: invariants
        }
      }
    };
    onUpdateWorkspace(updated);
    onClose();
  };

  const addClaim = () => {
    if (!newClaim.trim()) return;
    setClaims([...claims, newClaim.trim()]);
    setNewClaim("");
  };

  const removeClaim = (idx: number) => {
    setClaims(claims.filter((_, i) => i !== idx));
  };

  const addInvariant = () => {
    if (!newInvariant.trim()) return;
    setInvariants([...invariants, newInvariant.trim()]);
    setNewInvariant("");
  };

  const removeInvariant = (idx: number) => {
    setInvariants(invariants.filter((_, i) => i !== idx));
  };

  return (
    <div className="absolute right-6 top-24 bottom-6 w-full max-w-md z-40 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-6 animate-slide-in overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${currentTheme.bg} border ${currentTheme.border} ${currentTheme.text}`}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold capitalize">{activeFacet} Facet</h2>
            <p className="text-[11px] text-slate-400 font-mono">Isolated Refraction Lens</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Claims Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Isolated Claims & Observations
          </label>
          <span className="text-[10px] text-slate-500 font-mono">{claims.length} items</span>
        </div>

        <div className="flex flex-col gap-2">
          {claims.map((claim, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs group">
              <span className="text-slate-500 font-mono select-none">0{idx + 1}.</span>
              <p className="flex-1 text-slate-300 leading-relaxed">{claim}</p>
              <button
                onClick={() => removeClaim(idx)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={newClaim}
            onChange={(e) => setNewClaim(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addClaim()}
            placeholder="Add new claim or observation..."
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition"
          />
          <button
            onClick={addClaim}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invariants & Bounds */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Core Invariants & Bounds
          </label>
          <span className="text-[10px] text-slate-500 font-mono">{invariants.length} rules</span>
        </div>

        <div className="flex flex-col gap-2">
          {invariants.map((inv, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs group">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <p className="flex-1 text-slate-300 leading-relaxed">{inv}</p>
              <button
                onClick={() => removeInvariant(idx)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={newInvariant}
            onChange={(e) => setNewInvariant(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addInvariant()}
            placeholder="Add invariant rule..."
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition"
          />
          <button
            onClick={addInvariant}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-md shadow-sky-500/20"
        >
          Apply Facet Updates
        </button>
      </div>
    </div>
  );
};
