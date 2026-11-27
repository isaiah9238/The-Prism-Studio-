/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import {
  X,
  HardDrive,
  Search,
  RefreshCw,
  UploadCloud,
  FileText,
  FolderOpen,
  Trash2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Save,
} from "lucide-react";
import { PrismWorkspace } from "../core/types";
import { vault } from "../vault/opfsVault";
import {
  createDriveFile,
  deleteDriveFile,
  DriveAuthError,
  DriveFileItem,
  findDriveFileByName,
  listDriveFiles,
  readDriveFileContent,
  updateDriveFile,
} from "../vault/googleDriveApi";
import { clearAccessToken, getAccessToken } from "../vault/googleDriveAuth";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  needsAuth: boolean;
  isLoggingIn: boolean;
  authError: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onRequireAuth: () => void;
  workspace: PrismWorkspace;
  onLoadWorkspace: (ws: PrismWorkspace) => void;
  onImportDocumentAsEmission: (title: string, content: string) => void;
}

interface PendingConfirmation {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void>;
}

function slugifyFileName(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || "prism_workspace";
}

function isPrismWorkspacePayload(obj: unknown): obj is PrismWorkspace {
  if (!obj || typeof obj !== "object") return false;
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.emission === "object" &&
    candidate.emission !== null &&
    typeof candidate.projections === "object" &&
    candidate.projections !== null &&
    Array.isArray(candidate.interferences)
  );
}

export const DriveModal: React.FC<DriveModalProps> = ({
  isOpen,
  onClose,
  user,
  needsAuth,
  isLoggingIn,
  authError,
  onSignIn,
  onSignOut,
  onRequireAuth,
  workspace,
  onLoadWorkspace,
  onImportDocumentAsEmission,
}) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [onlyPrism, setOnlyPrism] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [pendingConfirm, setPendingConfirm] =
    useState<PendingConfirmation | null>(null);

  const handleDriveError = useCallback(
    (err: unknown) => {
      if (err instanceof DriveAuthError) {
        clearAccessToken();
        onRequireAuth();
        setStatusMessage({
          kind: "error",
          text: "Your Google Drive session expired. Please sign in again.",
        });
      } else {
        setStatusMessage({
          kind: "error",
          text:
            err instanceof Error
              ? err.message
              : "Google Drive request failed.",
        });
      }
    },
    [onRequireAuth]
  );

  const fetchFiles = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      onRequireAuth();
      return;
    }

    setIsLoadingFiles(true);
    try {
      const results = await listDriveFiles(token, {
        searchQuery,
        onlyPrism,
        pageSize: 30,
      });
      setFiles(results);
    } catch (err) {
      handleDriveError(err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [searchQuery, onlyPrism, onRequireAuth, handleDriveError]);

  useEffect(() => {
    if (isOpen && !needsAuth) {
      setStatusMessage(null);
      fetchFiles();
    }
  }, [isOpen, needsAuth, fetchFiles]);

  if (!isOpen) return null;

  const handleSaveWorkspaceToDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      onRequireAuth();
      return;
    }

    const fileName = `${slugifyFileName(workspace.emission.title)}.prism.json`;
    const content = JSON.stringify(workspace, null, 2);

    setIsBusy(true);
    setStatusMessage(null);
    try {
      const existing = await findDriveFileByName(token, fileName);
      if (existing) {
        setIsBusy(false);
        setPendingConfirm({
          title: `Overwrite "${existing.name}" in Google Drive?`,
          description: `A workspace file named "${existing.name}" already exists in your Google Drive. Confirming will overwrite its contents with your current Prism Studio workspace.`,
          confirmLabel: "Confirm Overwrite",
          destructive: false,
          onConfirm: async () => {
            const currentToken = await getAccessToken();
            if (!currentToken) {
              onRequireAuth();
              return;
            }
            await updateDriveFile(currentToken, existing.id, {
              content,
              mimeType: "application/json",
            });
            setStatusMessage({
              kind: "success",
              text: `Updated "${existing.name}" in Google Drive.`,
            });
            await fetchFiles();
          },
        });
        return;
      }

      await createDriveFile(token, {
        name: fileName,
        content,
        mimeType: "application/json",
      });
      setStatusMessage({
        kind: "success",
        text: `Saved "${fileName}" to Google Drive.`,
      });
      await fetchFiles();
    } catch (err) {
      handleDriveError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleExportMarkdownToDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      onRequireAuth();
      return;
    }

    const fileName = `${slugifyFileName(workspace.emission.title)}_prism.md`;
    const content = vault.generateMarkdownExport(workspace);

    setIsBusy(true);
    setStatusMessage(null);
    try {
      const existing = await findDriveFileByName(token, fileName);
      if (existing) {
        setIsBusy(false);
        setPendingConfirm({
          title: `Overwrite "${existing.name}" in Google Drive?`,
          description: `A Markdown export named "${existing.name}" already exists in your Google Drive. Confirming will replace its contents with the latest Prism report.`,
          confirmLabel: "Confirm Overwrite",
          destructive: false,
          onConfirm: async () => {
            const currentToken = await getAccessToken();
            if (!currentToken) {
              onRequireAuth();
              return;
            }
            await updateDriveFile(currentToken, existing.id, {
              content,
              mimeType: "text/markdown",
            });
            setStatusMessage({
              kind: "success",
              text: `Updated "${existing.name}" in Google Drive.`,
            });
            await fetchFiles();
          },
        });
        return;
      }

      await createDriveFile(token, {
        name: fileName,
        content,
        mimeType: "text/markdown",
      });
      setStatusMessage({
        kind: "success",
        text: `Exported "${fileName}" to Google Drive.`,
      });
      await fetchFiles();
    } catch (err) {
      handleDriveError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleOpenDriveFile = async (file: DriveFileItem) => {
    const token = await getAccessToken();
    if (!token) {
      onRequireAuth();
      return;
    }

    if (file.mimeType === "application/vnd.google-apps.folder") {
      setStatusMessage({
        kind: "error",
        text: "Folders cannot be opened as a Prism workspace or Emission.",
      });
      return;
    }

    setIsBusy(true);
    setStatusMessage(null);
    try {
      const content = await readDriveFileContent(token, file);

      if (
        file.name.endsWith(".prism.json") ||
        file.mimeType === "application/json"
      ) {
        try {
          const parsed = JSON.parse(content);
          if (isPrismWorkspacePayload(parsed)) {
            onLoadWorkspace(parsed);
            onClose();
            return;
          }
        } catch {
          // Fall through and import as raw text emission
        }
      }

      const cleanTitle = file.name.replace(/\.(md|txt|json)$/i, "");
      onImportDocumentAsEmission(cleanTitle, content.slice(0, 12000));
      onClose();
    } catch (err) {
      handleDriveError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const requestOverwriteFile = (file: DriveFileItem) => {
    const isJson = file.name.endsWith(".prism.json");
    setPendingConfirm({
      title: `Update "${file.name}" in Google Drive?`,
      description: isJson
        ? `This will overwrite "${file.name}" with your current Prism Studio workspace JSON.`
        : `This will overwrite "${file.name}" with your current Prism Studio Markdown export.`,
      confirmLabel: "Confirm Update",
      destructive: false,
      onConfirm: async () => {
        const token = await getAccessToken();
        if (!token) {
          onRequireAuth();
          return;
        }
        const content = isJson
          ? JSON.stringify(workspace, null, 2)
          : vault.generateMarkdownExport(workspace);
        const mimeType = isJson ? "application/json" : "text/markdown";

        await updateDriveFile(token, file.id, { content, mimeType });
        setStatusMessage({
          kind: "success",
          text: `Updated "${file.name}" in Google Drive.`,
        });
        await fetchFiles();
      },
    });
  };

  const requestDeleteFile = (file: DriveFileItem) => {
    setPendingConfirm({
      title: `Delete "${file.name}" from Google Drive?`,
      description: `Are you sure you want to permanently delete "${file.name}" from your Google Drive? This action cannot be undone.`,
      confirmLabel: "Delete Permanently",
      destructive: true,
      onConfirm: async () => {
        const token = await getAccessToken();
        if (!token) {
          onRequireAuth();
          return;
        }
        await deleteDriveFile(token, file.id);
        setStatusMessage({
          kind: "success",
          text: `Deleted "${file.name}" from Google Drive.`,
        });
        await fetchFiles();
      },
    });
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirm) return;
    const action = pendingConfirm.onConfirm;
    setPendingConfirm(null);
    setIsBusy(true);
    try {
      await action();
    } catch (err) {
      handleDriveError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const formatFileType = (file: DriveFileItem): string => {
    if (file.name.endsWith(".prism.json")) return "Prism Workspace";
    if (file.name.endsWith("_prism.md")) return "Prism Markdown";
    if (file.mimeType === "application/vnd.google-apps.document")
      return "Google Doc";
    if (file.mimeType === "application/vnd.google-apps.folder") return "Folder";
    if (file.mimeType === "application/vnd.google-apps.spreadsheet")
      return "Google Sheet";
    if (file.mimeType === "text/markdown") return "Markdown";
    if (file.mimeType === "application/json") return "JSON";
    if (file.mimeType.startsWith("text/")) return "Text";
    return file.mimeType.split("/").pop() || "File";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Google Drive Vault</h2>
              <p className="text-xs text-slate-400 font-mono">
                Save workspaces, export specs, or import Drive documents into the Prism
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="Close Google Drive modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate */}
        {needsAuth ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 shadow-inner">
              <HardDrive className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-base font-bold text-slate-100">
                Connect Google Drive
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign in with your Google account to browse Drive files, save
                Prism Studio workspaces and Markdown specs, or import Google
                Docs directly as new Emissions.
              </p>
            </div>

            {authError && (
              <div className="max-w-md flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs text-left">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <GoogleSignInButton
              onClick={onSignIn}
              disabled={isLoggingIn}
              label={isLoggingIn ? "Signing in..." : "Sign in with Google"}
            />
          </div>
        ) : (
          <>
            {/* Connected Account & Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Google User"}
                    className="w-8 h-8 rounded-full border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-300">
                    {(user?.displayName || user?.email || "G")[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {user?.displayName || "Google Account"}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveWorkspaceToDrive}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Save Workspace (.prism.json)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportMarkdownToDrive}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-800 transition"
                  title="Sign out of Google Drive"
                  aria-label="Sign out of Google Drive"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Feedback */}
            {statusMessage && (
              <div
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs shrink-0 ${
                  statusMessage.kind === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-200"
                }`}
              >
                {statusMessage.kind === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="flex-1">{statusMessage.text}</span>
              </div>
            )}

            {/* Search & Filter Row */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchFiles()}
                  placeholder="Search your Google Drive files..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOnlyPrism(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    !onlyPrism
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All Files
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyPrism(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    onlyPrism
                      ? "bg-sky-500/20 text-sky-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Prism Files
                </button>
              </div>

              <button
                type="button"
                onClick={fetchFiles}
                disabled={isLoadingFiles}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition disabled:opacity-50"
                title="Refresh Google Drive files"
                aria-label="Refresh Google Drive files"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoadingFiles ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto bg-slate-950/60 border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
              {isLoadingFiles ? (
                <div className="py-12 text-center text-xs text-slate-400 font-mono">
                  Loading Google Drive files...
                </div>
              ) : files.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                  <div>No matching files found in Google Drive.</div>
                  <div className="text-slate-500 font-mono">
                    Save your current workspace above or clear the search filter.
                  </div>
                </div>
              ) : (
                files.map((file) => {
                  const isFolder =
                    file.mimeType === "application/vnd.google-apps.folder";
                  const isPrismFile =
                    file.name.endsWith(".prism.json") ||
                    file.name.endsWith("_prism.md");

                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-900/70 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-100 truncate">
                            {file.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                              isPrismFile
                                ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
                                : "bg-slate-900 border-slate-800 text-slate-400"
                            }`}
                          >
                            {formatFileType(file)}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          {file.modifiedTime
                            ? `Modified ${new Date(file.modifiedTime).toLocaleString()}`
                            : "Google Drive File"}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isFolder && (
                          <button
                            type="button"
                            onClick={() => handleOpenDriveFile(file)}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 text-xs font-medium transition disabled:opacity-50"
                            title={
                              file.name.endsWith(".prism.json")
                                ? "Load Prism Workspace"
                                : "Import document text as Emission"
                            }
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>
                              {file.name.endsWith(".prism.json")
                                ? "Load"
                                : "Import"}
                            </span>
                          </button>
                        )}

                        {isPrismFile && (
                          <button
                            type="button"
                            onClick={() => requestOverwriteFile(file)}
                            disabled={isBusy}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-300 transition disabled:opacity-50"
                            title="Overwrite this Drive file with current workspace"
                            aria-label={`Overwrite ${file.name}`}
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
                            title="Open in Google Drive"
                            aria-label={`Open ${file.name} in Google Drive`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => requestDeleteFile(file)}
                          disabled={isBusy}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 text-slate-400 hover:text-rose-400 transition disabled:opacity-50"
                          title="Delete file from Google Drive"
                          aria-label={`Delete ${file.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Explicit Confirmation Dialog for Mutating / Destructive Operations */}
        {pendingConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-sm">
            <div
              role="alertdialog"
              aria-modal="true"
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    pendingConfirm.destructive
                      ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                      : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100">
                    {pendingConfirm.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {pendingConfirm.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPendingConfirm(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedAction}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    pendingConfirm.destructive
                      ? "bg-rose-600 hover:bg-rose-500 text-white"
                      : "bg-sky-500 hover:bg-sky-400 text-slate-950"
                  }`}
                >
                  {pendingConfirm.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
