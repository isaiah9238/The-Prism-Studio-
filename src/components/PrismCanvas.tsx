/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { PrismStage, StageCallbacks } from "../scene/PrismStage";
import { FacetName, PrismWorkspace } from "../core/types";

interface PrismCanvasProps {
  workspace: PrismWorkspace;
  selectedTarget: "core" | FacetName | string;
  onSelectNode: (target: "core" | FacetName | string) => void;
  onSelectInterference: (interferenceId: string) => void;
}

export const PrismCanvas: React.FC<PrismCanvasProps> = ({
  workspace,
  selectedTarget,
  onSelectNode,
  onSelectInterference
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<PrismStage | null>(null);

  const callbacksRef = useRef<StageCallbacks>({
    onSelectNode,
    onSelectInterference
  });

  useEffect(() => {
    callbacksRef.current = { onSelectNode, onSelectInterference };
  }, [onSelectNode, onSelectInterference]);

  useEffect(() => {
    if (!containerRef.current) return;
    const stage = new PrismStage({
      onSelectNode: (t) => callbacksRef.current.onSelectNode(t),
      onSelectInterference: (id) => callbacksRef.current.onSelectInterference(id)
    });
    stage.mount(containerRef.current);
    stage.updateWorkspace(workspace);
    stageRef.current = stage;

    return () => {
      stage.destroy();
      stageRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.updateWorkspace(workspace);
    }
  }, [workspace]);

  useEffect(() => {
    if (stageRef.current) {
      if (selectedTarget === "core" || selectedTarget === "geometry" || selectedTarget === "architecture" || selectedTarget === "cost" || selectedTarget === "human") {
        stageRef.current.focusOnTarget(selectedTarget);
      }
    }
  }, [selectedTarget]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      {/* HUD Watermark & Controls reminder */}
      <div className="absolute bottom-6 left-6 pointer-events-none select-none z-10 flex flex-col gap-1 text-xs text-slate-400 font-mono bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-2xl">
        <div className="text-sky-400 font-semibold mb-0.5">THE PRISM STUDIO (3D)</div>
        <div>• Click Center Core (0) or Facets (1-4) to focus</div>
        <div>• Click Interference Nodes (I) to inspect tensions</div>
        <div>• Toggle 2D Outline (Cmd+Shift+V)</div>
      </div>
    </div>
  );
};
