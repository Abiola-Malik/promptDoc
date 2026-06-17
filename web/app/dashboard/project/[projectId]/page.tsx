"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { ProjectHeader } from "./components/project-header";
import { useProject } from "@/hooks/useProjects";
import { useTabsStore } from "@/stores/TabStore";

const ChatPanel = dynamic(
  () => import("./components/chat-panel").then((m) => m.ChatPanel),
  { ssr: false, loading: () => <TabLoading /> },
);
const DocsViewer = dynamic(
  () => import("./components/docs-viewer").then((m) => m.DocsViewer),
  { ssr: false, loading: () => <TabLoading /> },
);
const FilesExplorer = dynamic(
  () => import("./components/files-explorer").then((m) => m.FilesExplorer),
  { ssr: false, loading: () => <TabLoading /> },
);

function TabLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-4 h-4 rounded-full border-2 border-[#222] border-t-[#555] animate-spin" />
    </div>
  );
}

const TABS = [
  { id: "chat", label: "Chat" },
  { id: "docs", label: "Documentation" },
  { id: "files", label: "Files" },
] as const;

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = React.use(params);
  const { project, isLoading, error } = useProject(projectId);
  const { activeTab, setActiveTab } = useTabsStore();
  const [visited, setVisited] = useState<Set<string>>(new Set(["chat"]));

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setVisited((prev) => new Set(prev).add(tab));
  }

  useEffect(() => {
    if (project?.status === "indexing") setActiveTab("chat");
  }, [project?.status, setActiveTab]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-5 h-5 rounded-full border-2 border-[#222] border-t-[#555] animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-1">
          <p className="text-[13px] text-[#ededed]">Project not found</p>
          <p className="text-[12px] text-[#444]">
            {error
              ? typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof (error as { message?: unknown }).message === "string"
                ? (error as { message: string }).message
                : String(error)
              : "This project may have been deleted."}
          </p>
        </div>
      </div>
    );
  }

  const isProcessing = project.status === "indexing";
  const progress = project.processingProgress || 0;

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      <ProjectHeader project={project} />

      {/* processing banner — thin, no card, no icon */}
      {isProcessing && (
        <div className="px-5 py-2 border-b border-[#1a1a1a] flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-[#666]">
            Indexing your codebase — this can take a minute
          </span>
          <div className="flex-1 h-0.5 bg-[#1a1a1a] rounded-full overflow-hidden max-w-xs">
            <div
              className="h-full bg-[#f59e0b] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] text-[#444]">{progress}%</span>
        </div>
      )}

      {/* tabs */}
      <div className="border-b border-[#1a1a1a] px-5 shrink-0">
        <div className="flex gap-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              disabled={tab.id === "docs" && isProcessing}
              className={`
                h-9 text-[12px] border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? "border-[#ededed] text-[#ededed]"
                    : "border-transparent text-[#555] hover:text-[#888]"
                }
                disabled:opacity-30 disabled:cursor-not-allowed
              `}
            >
              {tab.label}
              {tab.id === "files" && project.fileCount != null && (
                <span className="ml-1 text-[#3f3f3f]">{project.fileCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* tab content */}
      <div className="flex-1 overflow-hidden relative">
        {visited.has("chat") && (
          <div className={activeTab === "chat" ? "absolute inset-0" : "hidden"}>
            <Suspense fallback={<TabLoading />}>
              <ChatPanel projectId={projectId} />
            </Suspense>
          </div>
        )}

        {visited.has("docs") && (
          <div className={activeTab === "docs" ? "absolute inset-0" : "hidden"}>
            <Suspense fallback={<TabLoading />}>
              {isProcessing ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-[12px] text-[#444]">
                    Documentation will appear once indexing completes
                  </p>
                </div>
              ) : (
                <DocsViewer />
              )}
            </Suspense>
          </div>
        )}

        {visited.has("files") && (
          <div
            className={activeTab === "files" ? "absolute inset-0" : "hidden"}
          >
            <Suspense fallback={<TabLoading />}>
              <FilesExplorer projectId={projectId} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
