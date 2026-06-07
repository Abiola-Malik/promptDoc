"use client";

import React, { useState, useCallback, JSX } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  FolderOpen,
  FileCode2,
  ChevronRight,
  ChevronDown,
  Loader2,
  Sparkles,
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

  const reset = () => {
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

  /**
   * Build file-tree from ZIP
   */
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

        // Build tree structure
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

        // Smart defaults
        const toggleNode = (node: FileNode): boolean => {
          if (!node.children) {
            const lower = node.path.toLowerCase();
            const shouldExclude =
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
              (!includeDotfiles && node.name.startsWith("."));

            node.checked = !shouldExclude;
            return node.checked;
          }

          node.indeterminate = false;
          const allChecked = node.children!.every(toggleNode);
          const someChecked = node.children!.some(
            (c) => c.checked || c.indeterminate
          );
          node.checked = allChecked;
          node.indeterminate = !allChecked && someChecked;
          return node.checked;
        };

        root.children?.forEach(toggleNode);
        updateCounts(root);
        setFileTree({ ...root, name: file.name });
        setState("ready");
      } catch (err) {
        console.error(err);
        setError("Failed to read ZIP file");
        setState("idle");
      }
    },
    [includeTests, includeDotfiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/zip": [".zip"] },
    multiple: false,
  });

  const updateCounts = (root: FileNode) => {
    let total = 0;
    let selected = 0;

    const traverse = (node: FileNode) => {
      if (!node.children) {
        total++;
        if (node.checked) selected++;
        return;
      }
      node.children!.forEach(traverse);
    };

    root.children?.forEach(traverse);

    setTotalFiles(total);
    setSelectedFiles(selected);
    setEstimatedChunks(Math.round(selected * 2.8));
  };

  const toggleNode = (node: FileNode, checked: boolean) => {
    node.checked = checked;
    node.indeterminate = false;
    if (node.children) {
      node.children.forEach((child) => toggleNode(child, checked));
    }
    if (fileTree) {
      updateCounts(fileTree);
      setFileTree({ ...fileTree });
    }
  };

  const renderTree = (node: FileNode, depth = 0): JSX.Element => {
    if (!node.children) {
      return (
        <div key={node.path} className="flex items-center gap-2 py-1 pl-8">
          <Checkbox
            checked={node.checked}
            onCheckedChange={(checked) => {
              node.checked = checked as boolean;
              if (fileTree) {
                updateCounts(fileTree);
                setFileTree({ ...fileTree });
              }
            }}
          />
          <FileCode2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{node.name}</span>
        </div>
      );
    }

    return (
      <div key={node.path} className={depth > 0 ? "ml-4" : ""}>
        <div className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded-md px-2 -ml-2">
          <Checkbox
            checked={node.checked}
            onCheckedChange={(checked) => toggleNode(node, checked as boolean)}
          />
          {(node.children?.length ?? 0) > 0 ? (
            node.checked || node.indeterminate ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <FolderOpen className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm font-medium text-foreground">
            {node.name || "root"}
          </span>
        </div>
        {(node.checked || node.indeterminate) &&
          node.children &&
          node.children.map((child) => renderTree(child, depth + 1))}
      </div>
    );
  };

  /**
   * REAL UPLOAD FLOW (SmartUpload)
   */
  const handleUpload = async () => {
    if (!zipFile) {
      setError("No ZIP file selected");
      return;
    }

    setState("uploading");
    setProgress(10);
    const getSelectedPaths = (node: FileNode): string[] => {
      if (!node.children) {
        return node.checked ? [node.path] : [];
      }
      let paths: string[] = [];
      node.children.forEach((child) => {
        paths = paths.concat(getSelectedPaths(child));
      });
      return paths;
    };
    const formData = new FormData();
    formData.append("file", zipFile);
    formData.append("name", projectName);
    formData.append("includeTests", String(includeTests));
    formData.append("includeDotfiles", String(includeDotfiles));
    formData.append(
      "selectedFiles",
      JSON.stringify(getSelectedPaths(fileTree!))
    );

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJSON = await res.json();
        throw new Error(errJSON.error || "Upload failed");
      }

      const data = await res.json();

      setProgress(90);
      setState("processing");

      // Redirect to project page
      setTimeout(() => {
        setProgress(100);
        setState("complete");

        setTimeout(() => {
          router.push(`/dashboard/project/${data.projectId}`);
          onOpenChange(false);
        }, 800);
      }, 1200);
    } catch (err: unknown) {
      if (!(err instanceof Error)) return;
      if (err.message.includes("Unauthorized")) {
        setError("Session expired. Please log in again.");
      } else {
        setError(err.message);
      }
      console.error(err);
      setError(err.message);
      setState("error");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Project</DialogTitle>
          <DialogDescription>
            {state === "idle" && "Upload your codebase as a ZIP file"}
            {state === "analyzing" && "Analyzing your project..."}
            {state === "ready" &&
              `${selectedFiles} of ${totalFiles} files selected (~${estimatedChunks} chunks)`}
            {state === "uploading" && "Uploading..."}
            {state === "processing" && "Processing your project..."}
            {state === "complete" && "Your project is ready!"}
            {state === "error" && "Something went wrong"}
          </DialogDescription>
        </DialogHeader>

        {/** Idle + analyzing */}
        {state === "idle" || state === "analyzing" ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium text-foreground">
              {isDragActive
                ? "Drop your ZIP here"
                : "Drag & drop your project ZIP"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              or click to browse
            </p>
            <Button className="mt-6" size="lg">
              Choose ZIP File
            </Button>
          </div>
        ) : null}

        {/** Preview + ready */}
        {state === "ready" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome App"
                className="text-lg"
              />
            </div>

            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={includeTests}
                  onCheckedChange={(c) => setIncludeTests(c as boolean)}
                />
                <span>Include tests</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={includeDotfiles}
                  onCheckedChange={(c) => setIncludeDotfiles(c as boolean)}
                />
                <span>Include dotfiles</span>
              </label>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30 max-h-96 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">Smart file selection</span>
              </div>
              {fileTree && renderTree(fileTree)}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Estimated:{" "}
                <span className="font-medium text-foreground">
                  {estimatedChunks}
                </span>{" "}
                code chunks
              </div>
              <Button
                size="lg"
                onClick={handleUpload}
                disabled={selectedFiles === 0}
              >
                <Upload className="w-4 h-4 mr-2" />
                Process Project
              </Button>
            </div>
          </div>
        )}

        {/** Uploading / Processing */}
        {(state === "uploading" || state === "processing") && (
          <div className="space-y-8 py-8">
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
              <p className="text-lg font-medium mt-4">
                {state === "uploading"
                  ? "Uploading your code..."
                  : "Processing your codebase..."}
              </p>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        {/** Complete */}
        {state === "complete" && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Project ready!</h3>
              <p className="text-muted-foreground mt-2">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
