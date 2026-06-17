"use client";

import React, { useState, useCallback, JSX, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/components/ui/dialog";
import { Input } from "@/lib/components/ui/input";
import { Checkbox } from "@/lib/components/ui/checkbox";
import {
  CheckCircle2,
  Upload,
  FileCode2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FileNode {
  name: string;
  path: string;
  size?: number;
  children?: FileNode[];
  checked: boolean;
  indeterminate?: boolean;
}

type UploadState =
  | "idle"
  | "analyzing"
  | "ready"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

export function UploadModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const [state, setState] = useState<UploadState>("idle");
  const [projectName, setProjectName] = useState("");
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [totalFiles, setTotalFiles] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState(0);
  const [estimatedChunks, setEstimatedChunks] = useState(0);
  const [includeTests, setIncludeTests] = useState(false);
  const [includeDotfiles, setIncludeDotfiles] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current !== null) clearInterval(pollRef.current);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  const reset = () => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState("idle");
    setFileTree(null);
    setProjectName("");
    setZipFile(null);
    setTotalFiles(0);
    setSelectedFiles(0);
    setEstimatedChunks(0);
    setProgress(0);
    setError(null);
  };

  const updateCounts = (root: FileNode) => {
    let total = 0,
      selected = 0;
    const traverse = (node: FileNode) => {
      if (!node.children) {
        total++;
        if (node.checked) selected++;
        return;
      }
      node.children.forEach(traverse);
    };
    root.children?.forEach(traverse);
    setTotalFiles(total);
    setSelectedFiles(selected);
    setEstimatedChunks(Math.round(selected * 2.8));
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !file.name.endsWith(".zip")) {
        setError("Please upload a .zip file");
        return;
      }
      setZipFile(file);
      setError(null);
      setState("analyzing");
      setProjectName(file.name.replace(".zip", ""));

      try {
        const zip = await JSZip.loadAsync(file);
        const root: FileNode = {
          name: "",
          path: "",
          checked: true,
          children: [],
        };
        const files: string[] = [];
        zip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) files.push(relativePath);
        });

        for (const filePath of files) {
          const parts = filePath.split("/");
          let current = root;
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;
            const fullPath = parts.slice(0, i + 1).join("/");
            let node = current.children?.find((c) => c.name === part);
            if (!node) {
              node = {
                name: part,
                path: fullPath,
                checked: true,
                children: isLast ? undefined : [],
              };
              current.children = current.children || [];
              current.children.push(node);
            }
            if (!isLast) current = node;
          }
        }

        const applyDefaults = (node: FileNode): boolean => {
          if (!node.children) {
            const lower = node.path.toLowerCase();
            node.checked = !(
              lower.includes("node_modules") ||
              lower.includes(".git") ||
              lower.includes("dist") ||
              lower.includes(".next") ||
              lower.includes("build") ||
              lower.endsWith(".log") ||
              lower.includes("package-lock.json") ||
              lower.includes("yarn.lock") ||
              lower.includes("pnpm-lock.yaml") ||
              lower.includes(".DS_Store") ||
              lower.includes("public/") ||
              (!includeTests &&
                (lower.includes("__tests__") ||
                  lower.includes(".test.") ||
                  lower.includes(".spec."))) ||
              (!includeDotfiles && node.name.startsWith("."))
            );
            return node.checked;
          }
          node.indeterminate = false;
          const allChecked = node.children.every(applyDefaults);
          const someChecked = node.children.some(
            (c) => c.checked || c.indeterminate,
          );
          node.checked = allChecked;
          node.indeterminate = !allChecked && someChecked;
          return node.checked;
        };

        root.children?.forEach(applyDefaults);
        updateCounts(root);
        setFileTree({ ...root, name: file.name });
        setState("ready");
      } catch {
        setError("Failed to read ZIP file");
        setState("idle");
      }
    },
    [includeTests, includeDotfiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/zip": [".zip"] },
    multiple: false,
  });

  const toggleNode = (node: FileNode, checked: boolean) => {
    node.checked = checked;
    node.indeterminate = false;
    if (node.children)
      node.children.forEach((child) => toggleNode(child, checked));
    if (fileTree) {
      updateCounts(fileTree);
      setFileTree({ ...fileTree });
    }
  };

  const renderTree = (node: FileNode, depth = 0): JSX.Element => {
    if (!node.children) {
      return (
        <div key={node.path} className="flex items-center gap-2 py-0.5 pl-6">
          <Checkbox
            checked={node.checked}
            className="w-3 h-3"
            onCheckedChange={(c) => {
              node.checked = c as boolean;
              if (fileTree) {
                updateCounts(fileTree);
                setFileTree({ ...fileTree });
              }
            }}
          />
          <FileCode2 className="w-3 h-3 text-[#333] shrink-0" />
          <span className="text-[11px] text-[#666] truncate">{node.name}</span>
        </div>
      );
    }
    return (
      <div key={node.path} className={depth > 0 ? "ml-3" : ""}>
        <div className="flex items-center gap-2 py-0.5 hover:bg-[#141414] rounded px-1 -mx-1">
          <Checkbox
            checked={node.checked}
            className="w-3 h-3"
            onCheckedChange={(c) => toggleNode(node, c as boolean)}
          />
          {(node.children?.length ?? 0) > 0 ? (
            node.checked || node.indeterminate ? (
              <ChevronDown className="w-3 h-3 text-[#444]" />
            ) : (
              <ChevronRight className="w-3 h-3 text-[#444]" />
            )
          ) : (
            <FolderOpen className="w-3 h-3 text-[#444]" />
          )}
          <span className="text-[11px] text-[#888]">{node.name || "root"}</span>
        </div>
        {(node.checked || node.indeterminate) &&
          node.children?.map((child) => renderTree(child, depth + 1))}
      </div>
    );
  };

  const handleUpload = async () => {
    if (!zipFile) {
      setError("No ZIP file selected");
      return;
    }
    setState("uploading");
    setProgress(10);

    const getSelectedPaths = (node: FileNode): string[] => {
      if (!node.children) return node.checked ? [node.path] : [];
      return node.children.flatMap(getSelectedPaths);
    };

    const formData = new FormData();
    formData.append("file", zipFile);
    formData.append("name", projectName);
    formData.append("includeTests", String(includeTests));
    formData.append("includeDotfiles", String(includeDotfiles));
    formData.append(
      "selectedFiles",
      JSON.stringify(getSelectedPaths(fileTree!)),
    );

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errJSON = await res.json().catch(() => ({}));
        throw new Error(errJSON.error || "Upload failed");
      }
      const data = await res.json();
      setProgress(20);
      setState("processing");

      if (data.jobId) {
        let consecutiveFailures = 0;
        pollRef.current = window.setInterval(async () => {
          try {
            const statusRes = await fetch(
              `/api/ingest/status?jobId=${data.jobId}`,
            );
            if (!statusRes.ok) {
              if (++consecutiveFailures >= 5) {
                clearInterval(pollRef.current!);
                pollRef.current = null;
                setError("Processing error. Please try again.");
                setState("error");
              }
              return;
            }
            consecutiveFailures = 0;
            const status = await statusRes.json();
            setProgress(20 + Math.round((status.progress_pct ?? 0) * 0.75));
            if (status.status === "complete" || status.status === "partial") {
              clearInterval(pollRef.current!);
              pollRef.current = null;
              setProgress(100);
              setState("complete");
              if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
              }
              timeoutRef.current = window.setTimeout(() => {
                router.push(`/dashboard/project/${data.projectId}`);
                onOpenChange(false);
                timeoutRef.current = null;
              }, 600);
            }
            if (status.status === "failed") {
              clearInterval(pollRef.current!);
              pollRef.current = null;
              setError("Processing failed. Please try again.");
              setState("error");
            }
          } catch {
            if (++consecutiveFailures >= 5) {
              clearInterval(pollRef.current!);
              pollRef.current = null;
              setError("Network error while polling. Please try again.");
              setState("error");
            }
          }
        }, 2000);
      } else {
        setProgress(100);
        setState("complete");
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          router.push(`/dashboard/project/${data.projectId}`);
          onOpenChange(false);
          timeoutRef.current = null;
        }, 600);
      }
    } catch {
      setError("Upload failed. Please try again.");
      setState("idle");
    }
  };

  const stateLabel: Record<UploadState, string> = {
    idle: "Upload your codebase as a ZIP file",
    analyzing: "Reading ZIP...",
    ready: `${selectedFiles} of ${totalFiles} files · ~${estimatedChunks} chunks`,
    uploading: "Uploading...",
    processing: "Indexing codebase...",
    complete: "Done",
    error: "Something went wrong",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent
        className="sm:max-w-xl bg-[#0f0f0f] border-[#1f1f1f] p-0 gap-0
                                 max-h-[85vh] overflow-hidden flex flex-col"
      >
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-[#1a1a1a] shrink-0">
          <DialogTitle className="text-sm font-medium text-[#ededed]">
            New project
          </DialogTitle>
          <p className="text-[11px] text-[#444] mt-0.5">{stateLabel[state]}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* ── drop zone ── */}
          {(state === "idle" || state === "analyzing") && (
            <div
              {...getRootProps()}
              className={`m-4 border border-dashed rounded-md px-8 py-12 text-center
                         cursor-pointer transition-colors duration-150
                         ${
                           isDragActive
                             ? "border-[#3ecf8e] bg-[#3ecf8e]/5"
                             : "border-[#1f1f1f] hover:border-[#2a2a2a]"
                         }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-6 h-6 mx-auto mb-3 text-[#333]" />
              <p className="text-[13px] text-[#666]">
                {isDragActive ? "Drop ZIP here" : "Drag & drop a ZIP file"}
              </p>
              <p className="text-[11px] text-[#3f3f3f] mt-1">
                or click to browse
              </p>
            </div>
          )}

          {/* ── ready: name + options + tree ── */}
          {state === "ready" && (
            <div className="p-4 space-y-4">
              {/* project name */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#555] uppercase tracking-widest">
                  Project name
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-project"
                  className="h-8 text-[13px] bg-[#141414] border-[#1f1f1f]
                             text-[#ededed] placeholder:text-[#333]
                             focus-visible:ring-0 focus-visible:border-[#333]"
                />
              </div>

              {/* options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeTests}
                    className="w-3.5 h-3.5"
                    onCheckedChange={(c) => setIncludeTests(c as boolean)}
                  />
                  <span className="text-[12px] text-[#666]">Include tests</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeDotfiles}
                    className="w-3.5 h-3.5"
                    onCheckedChange={(c) => setIncludeDotfiles(c as boolean)}
                  />
                  <span className="text-[12px] text-[#666]">
                    Include dotfiles
                  </span>
                </label>
              </div>

              {/* file tree */}
              <div
                className="border border-[#1a1a1a] rounded-md bg-[#0a0a0a]
                              max-h-64 overflow-y-auto p-3"
              >
                {fileTree && renderTree(fileTree)}
              </div>

              {/* action */}
              <div
                className="flex items-center justify-between pt-2
                              border-t border-[#1a1a1a]"
              >
                <span className="text-[11px] text-[#3f3f3f]">
                  {estimatedChunks} estimated chunks
                </span>
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles === 0}
                  className="h-8 px-4 rounded-md bg-[#ededed] text-[#0a0a0a]
                             text-[12px] font-medium hover:bg-white
                             transition-colors disabled:opacity-30
                             disabled:cursor-not-allowed"
                >
                  Index project
                </button>
              </div>
            </div>
          )}

          {/* ── uploading / processing ── */}
          {(state === "uploading" || state === "processing") && (
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#555]">
                    {state === "uploading"
                      ? "Uploading..."
                      : "Indexing chunks..."}
                  </span>
                  <span className="text-[12px] text-[#444]">{progress}%</span>
                </div>
                {/* progress bar */}
                <div className="h-0.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3ecf8e] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#333] text-center">
                {state === "processing"
                  ? "Embedding chunks into vector store — this may take a minute."
                  : "Sending your codebase to the indexing pipeline."}
              </p>
            </div>
          )}

          {/* ── complete ── */}
          {state === "complete" && (
            <div className="p-8 flex flex-col items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-[#3ecf8e]" />
              <p className="text-[13px] text-[#ededed]">Project indexed</p>
              <p className="text-[11px] text-[#444]">Redirecting...</p>
            </div>
          )}
        </div>

        {/* ── error ── */}
        {error && (
          <div
            className="shrink-0 px-4 py-3 border-t border-[#1a1a1a]
                          bg-red-950/20 text-red-400 text-[12px] flex
                          items-center justify-between"
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-[11px] underline underline-offset-2
                         opacity-60 hover:opacity-100"
            >
              dismiss
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
