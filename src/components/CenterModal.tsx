/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Sparkles, Compass, Cpu, AlertCircle } from "lucide-react";
import { ConvergenceMode, PrismWorkspace } from "../core/types";
import {
  applyPrismResultToWorkspace,
  executePrismSkill,
  PRISM_SKILL_METADATA,
  PrismResult,
} from "../core/prismSkill";

interface CenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: PrismWorkspace;
  onUpdateWorkspace: (newWs: PrismWorkspace) => void;
}

export const CenterModal: React.FC<CenterModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onUpdateWorkspace,
}) => {
  const [title, setTitle] = useState(workspace.emission.title);
  const [rawContent, setRawContent] = useState(workspace.emission.rawContent);
  const [constraintsText, setConstraintsText] = useState(
    workspace.emission.hardConstraints.join("\n")
  );
  const [targetMode, setTargetMode] = useState<ConvergenceMode>(
    workspace.targetConvergenceMode || "unified-architecture"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep modal fields synced whenever workspace changes or modal reopens
  useEffect(() => {
    if (isOpen) {
      setTitle(workspace.emission.title);
      setRawContent(workspace.emission.rawContent);
      setConstraintsText(workspace.emission.hardConstraints.join("\n"));
      setTargetMode(workspace.targetConvergenceMode || "unified-architecture");
      setErrorMessage(null);
    }
  }, [isOpen, workspace]);

  if (!isOpen) return null;

  const parseConstraints = () =>
    constraintsText
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

  const handleSave = () => {
    const constraints = parseConstraints();
    const updated: PrismWorkspace = {
      ...workspace,
      targetConvergenceMode: targetMode,
      skillVersion: PRISM_SKILL_METADATA.version,
      emission: {
        ...workspace.emission,
        title,
        rawContent,
        hardConstraints: constraints,
      },
    };
    onUpdateWorkspace(updated);
    onClose();
  };

  const handleRunInProcessHarness = async () => {
    setErrorMessage(null);
    const constraints = parseConstraints();
    const result = await executePrismSkill({
      incidentInput: rawContent.trim() || title.trim(),
      constraints,
      facets: ["geometry", "system_arch", "energetic_cost", "human_access"],
      targetConvergenceMode: targetMode,
    });

    const updated = applyPrismResultToWorkspace(workspace, result, {
      title,
      rawContent,
      hardConstraints: constraints,
    });
    onUpdateWorkspace(updated);
    onClose();
  };

  const handleRefractWithAI = async () => {
    setErrorMessage(null);
    const constraints = parseConstraints();
    const incidentInput = rawContent.trim() || title.trim();

    if (!incidentInput) {
      setErrorMessage("Please enter an incidentInput / raw spark before refracting.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/refract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentInput,
          constraints,
          facets: ["geometry", "system_arch", "energetic_cost", "human_access"],
          targetConvergenceMode: targetMode,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(
          data.error ||
            "Gemini refraction request failed. You can run the local In-Process Harness instead."
        );
        return;
      }

      if (data.result) {
        const updated = applyPrismResultToWorkspace(
          workspace,
          data.result as PrismResult,
          {
            title,
            rawContent,
            hardConstraints: constraints,
          }
        );
        onUpdateWorkspace(updated);
        onClose();
      } else {
        setErrorMessage("Unexpected response format from /api/refract.");
      }
    } catch {
      setErrorMessage(
        "Unable to reach /api/refract. Use the local In-Process Harness for offline refraction."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Center Core Emission</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                  prism-skill v{PRISM_SKILL_METADATA.version}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Origin point where incidentInput & hard constraints enter the Prism
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="Close center core emission modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Emission Title / Slug
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autonomous Quantum Mesh"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 transition text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Subject / Incident Input (incidentInput)
            </label>
            <textarea
              rows={4}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Describe the target system, architecture, module, or problem statement to refract..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 transition text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Constraints (One per line)
              </label>
              <textarea
                rows={3}
                value={constraintsText}
                onChange={(e) => setConstraintsText(e.target.value)}
                placeholder={"100% local-first\nSub-50ms latency"}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 transition text-xs font-mono resize-none"
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Convergence Mode
                </label>
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      "unified-architecture",
                      "tradeoff-matrix",
                      "executable-spec",
                    ] as ConvergenceMode[]
                  ).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTargetMode(mode)}
                      className={`text-left px-3 py-2 rounded-xl border text-xs font-mono transition ${
                        targetMode === mode
                          ? "bg-sky-500/15 border-sky-500/50 text-sky-300 font-semibold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefractWithAI}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 font-semibold text-xs shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isGenerating
                  ? "Refracting Ray..."
                  : "Refract Ray Across 4 Facets"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleRunInProcessHarness}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition disabled:opacity-50"
              title="Run deterministic in-process executePrismSkill() harness offline"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Run In-Process Harness</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-md shadow-sky-500/20"
            >
              Save Emission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
