/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  X,
  GitCommit,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PrismWorkspace } from "../core/types";
import { toCanonicalFacetKey } from "../core/prismSkill";

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
  onUpdateWorkspace,
}) => {
  const interference = activeInterferenceId
    ? workspace.interferences.find((i) => i.id === activeInterferenceId)
    : undefined;

  const [description, setDescription] = useState(
    interference?.description || ""
  );
  const [resolution, setResolution] = useState(interference?.resolution || "");

  useEffect(() => {
    if (interference) {
      setDescription(interference.description);
      setResolution(interference.resolution);
    }
  }, [interference]);

  if (!activeInterferenceId || !interference) return null;

  const handleSave = () => {
    const updatedInterferences = workspace.interferences.map((inf) => {
      if (inf.id === interference.id) {
        return { ...inf, description, resolution };
      }
      return inf;
    });

    const updated: PrismWorkspace = {
      ...workspace,
      interferences: updatedInterferences,
    };
    onUpdateWorkspace(updated);
    onClose();
  };

  const isCollision = interference.kind === "collision";
  const canonicalPair = interference.facets.map((f) => toCanonicalFacetKey(f));

  return (
    <div className="absolute right-6 top-24 bottom-6 w-full max-w-md z-40 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl ${
              isCollision
                ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                : "bg-sky-500/10 border border-sky-500/20 text-sky-400"
            }`}
          >
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  isCollision
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-sky-500/20 text-sky-300"
                }`}
              >
                {isCollision
                  ? "Destructive Collision"
                  : "Constructive Reinforcement"}
              </span>
            </div>
            <h2 className="text-sm font-mono text-slate-300 mt-1">
              {canonicalPair[0]} ↔ {canonicalPair[1]}
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          aria-label="Close interference panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Conflict or Synergy */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          {isCollision ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Conflict
              Mechanism
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Synergy
              Mechanism
            </>
          )}
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-sky-500 transition resize-none"
        />
      </div>

      {/* Arbitration & Resolution Strategy */}
      <div className="flex flex-col gap-2 flex-1">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{" "}
          {isCollision ? "Resolution Strategy" : "Amplification Strategy"}
        </label>
        <textarea
          rows={5}
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Articulate the architectural mechanism that resolves the collision or leverages the synergy..."
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
          <span>Save Arbitration</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
