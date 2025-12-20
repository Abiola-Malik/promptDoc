"use client";

import React, { useState, useEffect } from "react";
import { ProjectHeader } from "./components/project-header";
import { ChatPanel } from "./components/chat-panel";
import { DocsViewer } from "./components/docs-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle } from "lucide-react";
import { FilesExplorer } from "./components/files-explorer";
import { useProject } from "@/hooks/useProjects";
import { FileSyncProvider } from "./components/FileSyncProvider";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const awaitedParams = React.use(params);
  const { project, isLoading, error } = useProject(awaitedParams.projectId);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    if (project?.status === "processing") {
      setActiveTab("chat");
    }
  }, [project?.status]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
          <div>
            <h2 className="text-2xl font-semibold">Loading project...</h2>
            <p className="text-muted-foreground mt-2">
              This won&apos;t take long
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto" />
          <div>
            <h2 className="text-3xl font-bold">Project not found</h2>
            <p className="text-muted-foreground mt-3">
              {error ||
                "The project may have been deleted or the link is invalid."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = project.status === "processing";

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <ProjectHeader project={project} />

      {/* Processing Banner */}
      {isProcessing && (
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium text-primary">
                Processing your project...
              </p>
              <p className="text-sm text-muted-foreground">
                Embedding code and generating context — usually takes 10–60
                seconds
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="border-b border-border bg-background/95 backdrop-blur">
            <div className="max-w-7xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 h-14 rounded-none bg-transparent">
                <TabsTrigger
                  value="chat"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="docs"
                  disabled={isProcessing}
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Documentation
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Files ({project.fileCount})
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-muted/5">
            <TabsContent value="chat" className="h-full m-0">
              <ChatPanel projectId={awaitedParams.projectId} />
            </TabsContent>

            <TabsContent value="docs" className="h-full m-0">
              {isProcessing ? (
                <div className="h-full flex items-center justify-center bg-background/50">
                  <div className="text-center space-y-6">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <p className="text-xl font-medium">
                      Crafting your documentation...
                    </p>
                  </div>
                </div>
              ) : (
                <DocsViewer projectId={awaitedParams.projectId} />
              )}
            </TabsContent>

            <TabsContent value="files" className="h-full m-0">
              <FileSyncProvider>
                <FilesExplorer projectId={awaitedParams.projectId} />
              </FileSyncProvider>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
