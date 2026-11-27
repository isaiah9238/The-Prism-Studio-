/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, GitCommit, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { PrismWorkspace, Interference } from "../core/types";

interface InterferencePanelProps {
  activeInterferenceId: string | null;
  onClose: () => void;
  workspace: PrismWorkspace;
  onUpdateWorkspace: (newWs: PrismWorkspace) => void;
}

export const InterferencePanel: React.FC<InterferencePanelProps> = ({
  activeInterferenceId,
  onClose,
  workspace,
  onUpdateWorkspace
}) => {
  if (!activeInterferenceId) return null;

  const interference = workspace.interferences.find(i => i.id === activeInterferenceId);
  if (!interference) return null;

  const [resolution, setResolution] = useState(interference.resolution);

  const handleSave = () => {
    const updatedInterferences = workspace.interferences.map(inf => {
      if (inf.id === interference.id) {
        return { ...inf, resolution };
      }
      return inf;
    });

    const updated: PrismWorkspace = {
      ...workspace,
      interferences: updatedInterferences
    };
    onUpdateWorkspace(updated);
    onClose();
  };

  const isCollision = interference.kind === "collision";

  return (
    <div className="absolute right-6 top-24 bottom-6 w-full max-w-md z-40 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-6 animate-slide-in overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isCollision ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" : "bg-sky-500/10 border border-sky-500/20 text-sky-400"}`}>
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase tracking-wider ${isCollision ? "bg-rose-500/20 text-rose-300" : "bg-sky-500/20 text-sky-300"}`}>
                {interference.kind}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {interference.facets[0]} ↔ {interference.facets[1]}
              </span>
            </div>
            <h2 className="text-base font-bold mt-0.5">Interference Junction</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description / Tension */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Structural Tension / Synergy
        </label>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
          {interference.description}
        </div>
      </div>

      {/* Resolution Authoring */}
      <div className="flex flex-col gap-2 flex-1">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Engineered Resolution / Synthesis
        </label>
        <textarea
          rows={5}
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Describe how this tension is resolved or how this synergy is leveraged..."
          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition leading-relaxed resize-none flex-1"
        />
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
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-md shadow-sky-500/20 flex items-center gap-2"
        >
          <span>Save Resolution</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
