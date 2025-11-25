"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  //   userId: string; // Add userId prop
}

type UploadState = "idle" | "uploading" | "processing" | "complete" | "error";

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".zip")) {
        setSelectedFile(file);
      } else {
        setError("Please upload a ZIP file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".zip")) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please upload a ZIP file");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    if (!userQuery.trim()) {
      setError("Please enter what documentation you need");
      return;
    }

    setState("uploading");
    setError(null);
    setProgress(0);

    // Start progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 3;
      });
    }, 800);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("query", userQuery);

      // Call API route instead of server action
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await response.json();

      clearInterval(progressInterval);

      if (response.ok && uploadResult.success) {
        setProgress(100);
        setState("complete");
        setResult(uploadResult);
      } else {
        setState("error");
        setError(uploadResult.error || `Upload failed: ${response.statusText}`);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setState("error");
      setError(err instanceof Error ? err.message : "Network error occurred");
      console.error("Upload error:", err);
    }
  };

  const resetModal = () => {
    setState("idle");
    setProgress(0);
    setSelectedFile(null);
    setUserQuery("");
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const getStepStatus = (stepIndex: number) => {
    if (state === "error") return "error";
    if (state === "idle") return "pending";

    const progressThresholds = [0, 30, 60, 100];
    if (progress >= progressThresholds[stepIndex]) {
      return state === "complete" && stepIndex === 3 ? "complete" : "active";
    }
    return "pending";
  };

  const steps = [
    { label: "Extracting files", threshold: 0 },
    { label: "Chunking code", threshold: 30 },
    { label: "Generating embeddings", threshold: 60 },
    { label: "Creating documentation", threshold: 90 },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload New Project</DialogTitle>
          <DialogDescription>
            {state === "idle"
              ? "Choose how you want to add your project"
              : state === "complete"
              ? "Your documentation is ready!"
              : state === "error"
              ? "Upload failed"
              : result?.cached
              ? "Using cached project data"
              : "Processing your code..."}
          </DialogDescription>
        </DialogHeader>

        {state === "idle" ? (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload ZIP</TabsTrigger>
              <TabsTrigger value="github" disabled>
                GitHub
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              {/* Query Input */}
              <div className="space-y-2">
                <Label htmlFor="query" className="text-sm font-medium">
                  What documentation do you need?
                </Label>
                <Input
                  id="query"
                  placeholder="e.g., API documentation for authentication system"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              {/* File Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }
                `}
              >
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"
                  />
                </svg>

                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Drag and drop your ZIP file here
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      or click to browse
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("file-input")?.click()
                      }
                    >
                      Browse Files
                    </Button>
                  </>
                )}

                <input
                  id="file-input"
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !userQuery.trim()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Generate Documentation
              </Button>
            </TabsContent>

            <TabsContent value="github" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  GitHub Repository URL
                </Label>
                <Input
                  placeholder="https://github.com/username/repo"
                  className="bg-card border-border"
                  disabled
                />
              </div>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6 py-4">
            {/* Progress Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const status = getStepStatus(index);

                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${
                          status === "active" || status === "complete"
                            ? "bg-primary text-primary-foreground"
                            : status === "error"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {status === "active" ? (
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : status === "complete" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : status === "error" ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cached Project Notice */}
            {result?.cached && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <p className="text-sm text-primary font-medium">
                  Using cached data - instant response!
                </p>
              </div>
            )}

            {/* Error Display */}
            {state === "error" && error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">
                    Upload Failed
                  </p>
                  <p className="text-xs text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {state !== "complete" && state !== "error" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats Display */}
            {result?.stats && state === "complete" && (
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {result.stats.filesProcessed}
                  </p>
                  <p className="text-xs text-muted-foreground">Files</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {result.stats.chunksCreated}
                  </p>
                  <p className="text-xs text-muted-foreground">Chunks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {result.stats.embeddingsStored}
                  </p>
                  <p className="text-xs text-muted-foreground">Embeddings</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {state === "complete" && (
              <div className="space-y-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => {
                    // Navigate to project or view documentation
                    window.location.href = `/projects/${result.projectId}`;
                  }}
                >
                  View Documentation
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </div>
            )}

            {state === "error" && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetModal}
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
