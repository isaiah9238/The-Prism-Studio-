/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Download, Upload, ListTree, Cpu, Layers, ShieldCheck, Compass } from "lucide-react";
import { PRESET_PROJECTS } from "../core/presets";

interface HeaderProps {
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenCenter: () => void;
  onOpenConvergence: () => void;
  onToggleOutline: () => void;
  onExportMarkdown: () => void;
  onImportJSON: () => void;
  isOutlineOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPresetId,
  onSelectPreset,
  onOpenCenter,
  onOpenConvergence,
  onToggleOutline,
  onExportMarkdown,
  onImportJSON,
  isOutlineOpen
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 text-slate-100 shadow-2xl">
      {/* Brand & Preset Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenCenter}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-rose-500 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-sm bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
              THE PRISM STUDIO
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wide font-mono">
              Where light is created & reflected
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-2 hidden md:block" />

        {/* Preset Selector */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" /> Subject:
          </span>
          {PRESET_PROJECTS.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                currentPresetId === p.id
                  ? "bg-sky-500 text-slate-950 font-semibold shadow-md shadow-sky-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCenter}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-slate-700 transition shadow-lg"
          title="Emit New Spark"
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Emit Spark</span>
        </button>

        <button
          onClick={onOpenConvergence}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 shadow-lg shadow-sky-500/25 transition"
          title="Converge Artifact"
        >
          <Layers className="w-4 h-4 text-slate-950" />
          <span>Converge Spec</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        <button
          onClick={onToggleOutline}
          className={`p-2.5 rounded-xl border transition ${
            isOutlineOpen
              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800"
          }`}
          title="Toggle 2D Accessible Outline View (Cmd+Shift+V)"
        >
          <ListTree className="w-4 h-4" />
        </button>

        <button
          onClick={onExportMarkdown}
          className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:bg-slate-800 transition"
          title="Export Markdown Vault"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
