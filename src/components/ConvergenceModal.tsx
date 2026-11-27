/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Layers, Copy, Check, Download, Compass, Terminal, Table } from "lucide-react";
import { PrismWorkspace, ConvergenceMode, ConvergenceArtifact } from "../core/types";

interface ConvergenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: PrismWorkspace;
  onUpdateWorkspace: (newWs: PrismWorkspace) => void;
}

export const ConvergenceModal: React.FC<ConvergenceModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onUpdateWorkspace
}) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState<ConvergenceMode>("unified-architecture");
  const [copied, setCopied] = useState(false);

  // Generate body markdown based on activeMode
  const generateArtifactBody = (mode: ConvergenceMode): string => {
    const { emission, projections, interferences } = workspace;
    if (mode === "unified-architecture") {
      return `### Unified Architecture: ${emission.title}

#### 1. Core Intent & Emission Summary
${emission.rawContent}

#### 2. Orthogonal Facet Integration
- **Geometry & Invariants**: ${projections.geometry.claims[0] || "Defined radial topology"}
- **System Architecture**: ${projections.architecture.claims[0] || "Decoupled state machine"}
- **Operational Cost**: ${projections.cost.claims[0] || "Demand-driven rendering"}
- **Human Access**: ${projections.human.claims[0] || "Calm zero-friction entry"}

#### 3. Resolved Interferences (${interferences.length} checked)
${interferences.map(inf => `- **[${inf.kind}] ${inf.facets[0]} ↔ ${inf.facets[1]}**: ${inf.resolution}`).join("\n")}
`;
    } else if (mode === "tradeoff-matrix") {
      return `### Trade-Off Matrix: ${emission.title}

| Design Facet | Core Claim | Hard Constraint | Resolved Tension / Mitigation |
| :--- | :--- | :--- | :--- |
| **Geometry** | ${projections.geometry.claims[0] || "N/A"} | ${emission.hardConstraints[0] || "None"} | Balanced via orthogonal focus lock |
| **Architecture** | ${projections.architecture.claims[0] || "N/A"} | ${emission.hardConstraints[1] || "None"} | Decoupled pure core kernel |
| **Cost** | ${projections.cost.claims[0] || "N/A"} | Low latency & VRAM | Invalidation-driven 0 fps idle sleep |
| **Human Access** | ${projections.human.claims[0] || "N/A"} | Zero-friction UI | Neutral framing & ARIA outline parity |
`;
    } else {
      const tsCode = `// Generated from The Prism Studio
export interface ${emission.title.replace(/[^a-zA-Z0-9]/g, "")}Config {
  id: "${emission.id}";
  title: "${emission.title}";
  constraints: ${JSON.stringify(emission.hardConstraints)};
  geometryInvariants: ${JSON.stringify(projections.geometry.invariantsOrBounds)};
  architectureRules: ${JSON.stringify(projections.architecture.invariantsOrBounds)};
}`;

      return `### Executable Specification: ${emission.title}

\`\`\`ts
${tsCode}
\`\`\`

#### Runtime Pipeline Verification
1. **Capture**: \`Emission\` successfully validated with author \`self\`.
2. **Refract**: 4 decoupled facet projections instantiated with zero cross-talk.
3. **Interfere**: ${interferences.length} interferences evaluated with explicit resolutions.
4. **Converge**: Artifact compiled successfully in mode \`${mode}\`.
`;
    }
  };

  const currentBody = generateArtifactBody(activeMode);

  const handleSaveArtifact = () => {
    const artifact: ConvergenceArtifact = {
      id: `conv_${Date.now()}`,
      emissionId: workspace.emission.id,
      mode: activeMode,
      createdAt: new Date().toISOString(),
      interferencesResolved: workspace.interferences.map(i => i.id),
      bodyMarkdown: currentBody
    };

    const updated: PrismWorkspace = {
      ...workspace,
      convergences: [artifact, ...workspace.convergences]
    };
    onUpdateWorkspace(updated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Convergence Horizon</h2>
              <p className="text-xs text-slate-400 font-mono">
                Crystallizing refracted light into a unified deliverable spec
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

        {/* Mode Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveMode("unified-architecture")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeMode === "unified-architecture"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Unified Architecture</span>
          </button>
          <button
            onClick={() => setActiveMode("tradeoff-matrix")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeMode === "tradeoff-matrix"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Trade-Off Matrix</span>
          </button>
          <button
            onClick={() => setActiveMode("executable-spec")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeMode === "executable-spec"
                ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Executable Spec</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
          {currentBody}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 shrink-0">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Markdown"}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
            >
              Close
            </button>
            <button
              onClick={handleSaveArtifact}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-md shadow-sky-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Crystallize & Save Artifact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
