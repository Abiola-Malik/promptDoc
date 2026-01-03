// app/dashboard/project/[projectId]/page.tsx
"use client";

import React, { useEffect } from "react";
import { ProjectHeader } from "./components/project-header";
import { ChatPanel } from "./components/chat-panel";
import { DocsViewer } from "./components/docs-viewer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle } from "lucide-react";
import { FilesExplorer } from "./components/files-explorer";
import { useProject } from "@/hooks/useProjects";
import { useTabsStore } from "@/stores/TabStore";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const awaitedParams = React.use(params);
  const { project, isLoading, error } = useProject(awaitedParams.projectId);
  const { activeTab, setActiveTab } = useTabsStore();

  // Auto-switch to chat if docs aren't ready yet
  useEffect(() => {
    if (project?.status === "processing") {
      setActiveTab("chat");
    }
  }, [project?.status, setActiveTab]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">
            Loading your project...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-semibold">Project not found</h2>
          <p className="text-muted-foreground">
            {(error && typeof error === "object" && "message" in error
              ? (error as Error).message
              : String(error)) ||
              "This project may have been deleted or the link is invalid."}
          </p>
        </div>
      </div>
    );
  }
  const isProcessing = project.status === "processing";
  const processingProgress = project.processingProgress || 0;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <ProjectHeader project={project} />

      {/* Processing Banner */}
      {isProcessing && (
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-medium text-primary">
                  Your project is being processed...
                </p>
                <p className="text-sm text-muted-foreground">
                  This usually takes 10–60 seconds depending on size
                </p>
              </div>
            </div>
            <div className="w-64">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary">
                  {processingProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          {/* Tab List */}
          <div className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="max-w-7xl mx-auto px-6">
              <TabsList className="bg-transparent h-14">
                <TabsTrigger
                  value="chat"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="docs"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6"
                  disabled={isProcessing}
                >
                  Documentation
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6"
                >
                  Files ({project.fileCount ?? 0})
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Content - Keep all mounted with CSS hide/show */}
          <div className="flex-1 flex overflow-hidden bg-muted/20 relative">
            <div
              className={
                activeTab === "chat" ? "h-full flex-1" : "hidden h-full flex-1"
              }
            >
              <ChatPanel projectId={awaitedParams.projectId} />
            </div>

            <div
              className={
                activeTab === "docs" ? "h-full flex-1" : "hidden h-full flex-1"
              }
            >
              {isProcessing ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                    <p className="text-lg font-medium">
                      Generating documentation...
                    </p>
                    <p className="text-muted-foreground">
                      Hang tight — your AI docs are being crafted
                    </p>
                  </div>
                </div>
              ) : (
                <DocsViewer />
              )}
            </div>

            <div
              className={
                activeTab === "files" ? "h-full flex-1" : "hidden h-full flex-1"
              }
            >
              <FilesExplorer projectId={awaitedParams.projectId} />
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
