/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { PrismCanvas } from "./components/PrismCanvas";
import { CenterModal } from "./components/CenterModal";
import { FacetPanel } from "./components/FacetPanel";
import { InterferencePanel } from "./components/InterferencePanel";
import { ConvergenceModal } from "./components/ConvergenceModal";
import { OutlineModal } from "./components/OutlineModal";
import { PRESET_PROJECTS } from "./core/presets";
import { PrismWorkspace, FacetName } from "./core/types";
import { vault } from "./vault/opfsVault";

export default function App() {
  const [currentPresetId, setCurrentPresetId] = useState<string>("luminous-self");
  const [workspace, setWorkspace] = useState<PrismWorkspace>(() => {
    const preset = PRESET_PROJECTS[0];
    return {
      emission: {
        id: preset.id,
        createdAt: new Date().toISOString(),
        author: "self",
        title: preset.emission.title,
        rawContent: preset.emission.rawContent,
        hardConstraints: preset.emission.hardConstraints
      },
      projections: {
        geometry: {
          emissionId: preset.id,
          facet: "geometry",
          title: preset.projections.geometry.title,
          claims: preset.projections.geometry.claims,
          invariantsOrBounds: preset.projections.geometry.invariantsOrBounds
        },
        architecture: {
          emissionId: preset.id,
          facet: "architecture",
          title: preset.projections.architecture.title,
          claims: preset.projections.architecture.claims,
          invariantsOrBounds: preset.projections.architecture.invariantsOrBounds
        },
        cost: {
          emissionId: preset.id,
          facet: "cost",
          title: preset.projections.cost.title,
          claims: preset.projections.cost.claims,
          invariantsOrBounds: preset.projections.cost.invariantsOrBounds
        },
        human: {
          emissionId: preset.id,
          facet: "human",
          title: preset.projections.human.title,
          claims: preset.projections.human.claims,
          invariantsOrBounds: preset.projections.human.invariantsOrBounds
        }
      },
      interferences: preset.interferences.map((inf, idx) => ({
        id: `inf_${idx}_${Date.now()}`,
        emissionId: preset.id,
        facets: inf.facets,
        kind: inf.kind,
        description: inf.description,
        resolution: inf.resolution
      })),
      convergences: []
    };
  });

  const [selectedTarget, setSelectedTarget] = useState<"core" | FacetName | string>("core");
  const [activeFacet, setActiveFacet] = useState<FacetName | null>(null);
  const [activeInterferenceId, setActiveInterferenceId] = useState<string | null>(null);

  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [isConvergenceOpen, setIsConvergenceOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);

  // Initialize vault on mount
  useEffect(() => {
    vault.init().catch(console.warn);
  }, []);

  // Save workspace changes
  const handleUpdateWorkspace = useCallback((newWs: PrismWorkspace) => {
    setWorkspace(newWs);
    vault.saveWorkspace(newWs).catch(console.warn);
  }, []);

  // Switch preset project
  const handleSelectPreset = (presetId: string) => {
    setCurrentPresetId(presetId);
    const preset = PRESET_PROJECTS.find(p => p.id === presetId) || PRESET_PROJECTS[0];
    const newWs: PrismWorkspace = {
      emission: {
        id: preset.id,
        createdAt: new Date().toISOString(),
        author: "self",
        title: preset.emission.title,
        rawContent: preset.emission.rawContent,
        hardConstraints: preset.emission.hardConstraints
      },
      projections: {
        geometry: {
          emissionId: preset.id,
          facet: "geometry",
          title: preset.projections.geometry.title,
          claims: preset.projections.geometry.claims,
          invariantsOrBounds: preset.projections.geometry.invariantsOrBounds
        },
        architecture: {
          emissionId: preset.id,
          facet: "architecture",
          title: preset.projections.architecture.title,
          claims: preset.projections.architecture.claims,
          invariantsOrBounds: preset.projections.architecture.invariantsOrBounds
        },
        cost: {
          emissionId: preset.id,
          facet: "cost",
          title: preset.projections.cost.title,
          claims: preset.projections.cost.claims,
          invariantsOrBounds: preset.projections.cost.invariantsOrBounds
        },
        human: {
          emissionId: preset.id,
          facet: "human",
          title: preset.projections.human.title,
          claims: preset.projections.human.claims,
          invariantsOrBounds: preset.projections.human.invariantsOrBounds
        }
      },
      interferences: preset.interferences.map((inf, idx) => ({
        id: `inf_${idx}_${Date.now()}`,
        emissionId: preset.id,
        facets: inf.facets,
        kind: inf.kind,
        description: inf.description,
        resolution: inf.resolution
      })),
      convergences: []
    };
    setWorkspace(newWs);
    setSelectedTarget("core");
    setActiveFacet(null);
    setActiveInterferenceId(null);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+V for outline
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setIsOutlineOpen(prev => !prev);
        return;
      }

      // Ignore if typing in input/textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === "0") {
        setSelectedTarget("core");
        setActiveFacet(null);
        setActiveInterferenceId(null);
      } else if (e.key === "1") {
        setSelectedTarget("geometry");
        setActiveFacet("geometry");
        setActiveInterferenceId(null);
      } else if (e.key === "2") {
        setSelectedTarget("architecture");
        setActiveFacet("architecture");
        setActiveInterferenceId(null);
      } else if (e.key === "3") {
        setSelectedTarget("cost");
        setActiveFacet("cost");
        setActiveInterferenceId(null);
      } else if (e.key === "4") {
        setSelectedTarget("human");
        setActiveFacet("human");
        setActiveInterferenceId(null);
      } else if (e.key.toLowerCase() === "c") {
        setIsConvergenceOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectNode = (target: "core" | FacetName | string) => {
    setSelectedTarget(target);
    if (target === "core") {
      setIsCenterOpen(true);
      setActiveFacet(null);
      setActiveInterferenceId(null);
    } else if (target === "geometry" || target === "architecture" || target === "cost" || target === "human") {
      setActiveFacet(target);
      setActiveInterferenceId(null);
    }
  };

  const handleSelectInterference = (interferenceId: string) => {
    setActiveInterferenceId(interferenceId);
    setActiveFacet(null);
  };

  const handleExportMarkdown = () => {
    const md = vault.generateMarkdownExport(workspace);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workspace.emission.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_prism.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Header Navigation */}
      <Header
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenCenter={() => setIsCenterOpen(true)}
        onOpenConvergence={() => setIsConvergenceOpen(true)}
        onToggleOutline={() => setIsOutlineOpen(prev => !prev)}
        onExportMarkdown={handleExportMarkdown}
        onImportJSON={() => {}}
        isOutlineOpen={isOutlineOpen}
      />

      {/* 3D WebGL Viewport */}
      <main className="absolute inset-0 pt-20">
        <PrismCanvas
          workspace={workspace}
          selectedTarget={selectedTarget}
          onSelectNode={handleSelectNode}
          onSelectInterference={handleSelectInterference}
        />
      </main>

      {/* Floating Side Panels & Modals */}
      <CenterModal
        isOpen={isCenterOpen}
        onClose={() => setIsCenterOpen(false)}
        workspace={workspace}
        onUpdateWorkspace={handleUpdateWorkspace}
      />

      <FacetPanel
        activeFacet={activeFacet}
        onClose={() => setActiveFacet(null)}
        workspace={workspace}
        onUpdateWorkspace={handleUpdateWorkspace}
      />

      <InterferencePanel
        activeInterferenceId={activeInterferenceId}
        onClose={() => setActiveInterferenceId(null)}
        workspace={workspace}
        onUpdateWorkspace={handleUpdateWorkspace}
      />

      <ConvergenceModal
        isOpen={isConvergenceOpen}
        onClose={() => setIsConvergenceOpen(false)}
        workspace={workspace}
        onUpdateWorkspace={handleUpdateWorkspace}
      />

      <OutlineModal
        isOpen={isOutlineOpen}
        onClose={() => setIsOutlineOpen(false)}
        workspace={workspace}
      />
    </div>
  );
}
