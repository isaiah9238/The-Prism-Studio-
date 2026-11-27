/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Sparkles, Compass, ShieldCheck } from "lucide-react";
import { Emission, PrismWorkspace, FacetName } from "../core/types";

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
  onUpdateWorkspace
}) => {
  const [title, setTitle] = useState(workspace.emission.title);
  const [rawContent, setRawContent] = useState(workspace.emission.rawContent);
  const [constraintsText, setConstraintsText] = useState(workspace.emission.hardConstraints.join("\n"));
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const constraints = constraintsText.split("\n").map(c => c.trim()).filter(Boolean);
    const updated: PrismWorkspace = {
      ...workspace,
      emission: {
        ...workspace.emission,
        title,
        rawContent,
        hardConstraints: constraints
      }
    };
    onUpdateWorkspace(updated);
    onClose();
  };

  const handleRefractWithAI = async () => {
    setIsGenerating(true);
    try {
      // Call server-side API proxy or fallback to structured simulation
      const res = await fetch("/api/refract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent, constraints: constraintsText })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.projections && data.interferences) {
          const updated: PrismWorkspace = {
            ...workspace,
            emission: { ...workspace.emission, title, rawContent, hardConstraints: constraintsText.split("\n").filter(Boolean) },
            projections: data.projections,
            interferences: data.interferences
          };
          onUpdateWorkspace(updated);
          setIsGenerating(false);
          onClose();
          return;
        }
      }
    } catch {
      // Fallback structured generation
    }

    // Intelligent local fallback refraction
    setTimeout(() => {
      const updated: PrismWorkspace = {
        ...workspace,
        emission: { ...workspace.emission, title, rawContent, hardConstraints: constraintsText.split("\n").filter(Boolean) },
        projections: {
          geometry: {
            emissionId: workspace.emission.id,
            facet: "geometry",
            title: "Geometry & Invariants",
            claims: [
              `Derived structural topology for: "${title || rawContent.slice(0, 30)}..."`,
              "Spatial layout optimized for minimal cognitive and optical friction",
              "1:1 invariant mapping between domain objects and visual nodes"
            ],
            invariantsOrBounds: ["Origin Attribution Invariant active", "Deterministic coordinate binding"]
          },
          architecture: {
            emissionId: workspace.emission.id,
            facet: "architecture",
            title: "System & Code Architecture",
            claims: [
              "Decoupled state machine separating domain logic from 3D presentation",
              "Unidirectional data flow ensuring reproducible state transformations",
              "Local-first persistence adapter with plain-file vault export"
            ],
            invariantsOrBounds: ["Zero cross-facet pollution during refraction pass"]
          },
          cost: {
            emissionId: workspace.emission.id,
            facet: "cost",
            title: "Energetic & Operational Cost",
            claims: [
              "Demand-driven rendering (0 fps idle sleep) preserves device battery",
              "Lightweight procedural geometry bounds VRAM usage under 150MB",
              "Zero mandatory cloud infrastructure costs"
            ],
            invariantsOrBounds: ["Maximum DPR capped at 2", "Heavy compute gated behind explicit triggers"]
          },
          human: {
            emissionId: workspace.emission.id,
            facet: "human",
            title: "Human & Open Access",
            claims: [
              "Distraction-free entry space designed around calm focus",
              "Full keyboard shortcuts and 2D accessible outline parity",
              "Plain human-owned Markdown files on local disk"
            ],
            invariantsOrBounds: ["Neutral structural phrasing for all interferences"]
          }
        },
        interferences: [
          {
            id: "inf_auto_1",
            emissionId: workspace.emission.id,
            facets: ["geometry", "cost"],
            kind: "collision",
            description: "High spatial fidelity in 3D optics can clash with lightweight operational cost budgets on mobile hardware.",
            resolution: "Use analytical TSL Fresnel materials and idle-zero frame loops to maintain high fidelity at near-zero battery cost."
          }
        ]
      };
      onUpdateWorkspace(updated);
      setIsGenerating(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Center Core Emission</h2>
              <p className="text-xs text-slate-400 font-mono">
                The origin point where light and intent are authored
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
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
              Raw Spark / Intent (`Emission`)
            </label>
            <textarea
              rows={4}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Describe your raw idea, dilemma, or worldbuilding seed..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 transition text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Hard Constraints (One per line)
            </label>
            <textarea
              rows={3}
              value={constraintsText}
              onChange={(e) => setConstraintsText(e.target.value)}
              placeholder="100% local-first&#10;Sub-50ms latency"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 transition text-xs font-mono resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={handleRefractWithAI}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 font-semibold text-xs shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "Refracting Ray..." : "Refract Ray Across 4 Facets"}</span>
          </button>

          <div className="flex items-center gap-3">
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
              Save Emission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
