/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import { Header } from "./components/Header";
import { PrismCanvas } from "./components/PrismCanvas";
import { CenterModal } from "./components/CenterModal";
import { FacetPanel } from "./components/FacetPanel";
import { InterferencePanel } from "./components/InterferencePanel";
import { ConvergenceModal } from "./components/ConvergenceModal";
import { OutlineModal } from "./components/OutlineModal";
import { DriveModal } from "./components/DriveModal";
import { PRESET_PROJECTS } from "./core/presets";
import { PRISM_SKILL_METADATA } from "./core/prismSkill";
import { PrismWorkspace, FacetName, PresetProject } from "./core/types";
import { vault } from "./vault/opfsVault";
import { googleSignIn, initAuth, logout } from "./vault/googleDriveAuth";

function buildWorkspaceFromPreset(preset: PresetProject): PrismWorkspace {
  return {
    skillVersion: PRISM_SKILL_METADATA.version,
    targetConvergenceMode: "unified-architecture",
    emission: {
      id: preset.id,
      createdAt: new Date().toISOString(),
      author: "self",
      title: preset.emission.title,
      rawContent: preset.emission.rawContent,
      hardConstraints: preset.emission.hardConstraints,
    },
    projections: {
      geometry: {
        emissionId: preset.id,
        facet: "geometry",
        canonicalKey: "geometry",
        title: preset.projections.geometry.title,
        claims: preset.projections.geometry.claims,
        invariantsOrBounds: preset.projections.geometry.invariantsOrBounds,
        tensions: preset.projections.geometry.tensions || [],
      },
      architecture: {
        emissionId: preset.id,
        facet: "architecture",
        canonicalKey: "system_arch",
        title: preset.projections.architecture.title,
        claims: preset.projections.architecture.claims,
        invariantsOrBounds: preset.projections.architecture.invariantsOrBounds,
        tensions: preset.projections.architecture.tensions || [],
      },
      cost: {
        emissionId: preset.id,
        facet: "cost",
        canonicalKey: "energetic_cost",
        title: preset.projections.cost.title,
        claims: preset.projections.cost.claims,
        invariantsOrBounds: preset.projections.cost.invariantsOrBounds,
        tensions: preset.projections.cost.tensions || [],
      },
      human: {
        emissionId: preset.id,
        facet: "human",
        canonicalKey: "human_access",
        title: preset.projections.human.title,
        claims: preset.projections.human.claims,
        invariantsOrBounds: preset.projections.human.invariantsOrBounds,
        tensions: preset.projections.human.tensions || [],
      },
    },
    interferences: preset.interferences.map((inf, idx) => ({
      id: `inf_${idx}_${Date.now()}`,
      emissionId: preset.id,
      facets: inf.facets,
      kind: inf.kind,
      description: inf.description,
      resolution: inf.resolution,
    })),
    convergences: [],
  };
}

export default function App() {
  const [currentPresetId, setCurrentPresetId] =
    useState<string>("luminous-self");
  const [workspace, setWorkspace] = useState<PrismWorkspace>(() =>
    buildWorkspaceFromPreset(PRESET_PROJECTS[0])
  );

  const [selectedTarget, setSelectedTarget] = useState<
    "core" | FacetName | string
  >("core");
  const [activeFacet, setActiveFacet] = useState<FacetName | null>(null);
  const [activeInterferenceId, setActiveInterferenceId] = useState<
    string | null
  >(null);

  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [isConvergenceOpen, setIsConvergenceOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);

  // Google Drive Auth state (access token is kept strictly in-memory inside googleDriveAuth.ts)
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize OPFS vault & Firebase Auth listener on mount
  useEffect(() => {
    vault.init().catch(console.warn);

    const unsubscribe = initAuth(
      (user) => {
        setDriveUser(user);
        setNeedsAuth(false);
        setAuthError(null);
      },
      () => {
        setDriveUser(null);
        setNeedsAuth(true);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      setDriveUser(result.user);
      setNeedsAuth(false);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again."
      );
      setNeedsAuth(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logout();
    setDriveUser(null);
    setNeedsAuth(true);
  };

  // Save workspace changes
  const handleUpdateWorkspace = useCallback((newWs: PrismWorkspace) => {
    setWorkspace(newWs);
    vault.saveWorkspace(newWs).catch(console.warn);
  }, []);

  // Load workspace from Google Drive
  const handleLoadWorkspaceFromDrive = useCallback((loaded: PrismWorkspace) => {
    setWorkspace(loaded);
    setCurrentPresetId("");
    setSelectedTarget("core");
    setActiveFacet(null);
    setActiveInterferenceId(null);
    vault.saveWorkspace(loaded).catch(console.warn);
  }, []);

  // Import a Drive document (Google Doc, Markdown, Text) as a new Emission
  const handleImportDocumentAsEmission = useCallback(
    (docTitle: string, docContent: string) => {
      const updated: PrismWorkspace = {
        ...workspace,
        emission: {
          ...workspace.emission,
          id: `drive_${Date.now()}`,
          createdAt: new Date().toISOString(),
          title: docTitle,
          rawContent: docContent,
        },
      };
      setWorkspace(updated);
      setCurrentPresetId("");
      setIsCenterOpen(true);
      vault.saveWorkspace(updated).catch(console.warn);
    },
    [workspace]
  );

  // Switch preset project
  const handleSelectPreset = (presetId: string) => {
    setCurrentPresetId(presetId);
    const preset =
      PRESET_PROJECTS.find((p) => p.id === presetId) || PRESET_PROJECTS[0];
    setWorkspace(buildWorkspaceFromPreset(preset));
    setSelectedTarget("core");
    setActiveFacet(null);
    setActiveInterferenceId(null);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Shift+V for outline
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "v"
      ) {
        e.preventDefault();
        setIsOutlineOpen((prev) => !prev);
        return;
      }

      // Ignore if typing in input/textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

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
      } else if (e.key.toLowerCase() === "i") {
        const list = workspace.interferences;
        if (list.length === 0) return;
        const currentIndex = activeInterferenceId
          ? list.findIndex((inf) => inf.id === activeInterferenceId)
          : -1;
        const next = list[(currentIndex + 1) % list.length];
        setActiveFacet(null);
        setActiveInterferenceId(next.id);
      } else if (e.key.toLowerCase() === "c") {
        setIsConvergenceOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [workspace.interferences, activeInterferenceId]);

  const handleSelectNode = (target: "core" | FacetName | string) => {
    setSelectedTarget(target);
    if (target === "core") {
      setIsCenterOpen(true);
      setActiveFacet(null);
      setActiveInterferenceId(null);
    } else if (
      target === "geometry" ||
      target === "architecture" ||
      target === "cost" ||
      target === "human"
    ) {
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
        onOpenDrive={() => setIsDriveOpen(true)}
        onToggleOutline={() => setIsOutlineOpen((prev) => !prev)}
        onExportMarkdown={handleExportMarkdown}
        isOutlineOpen={isOutlineOpen}
        isDriveConnected={!needsAuth && Boolean(driveUser)}
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

      <DriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        user={driveUser}
        needsAuth={needsAuth}
        isLoggingIn={isLoggingIn}
        authError={authError}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
        onRequireAuth={() => setNeedsAuth(true)}
        workspace={workspace}
        onLoadWorkspace={handleLoadWorkspaceFromDrive}
        onImportDocumentAsEmission={handleImportDocumentAsEmission}
      />
    </div>
  );
}
