"use client";

import { useState } from "react";
import { ProjectHeader } from "./components/project-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatPanel } from "./components/chat-panel";
import { DocsViewer } from "./components/docs-viewer";

// Mock data
const mockProject = {
  id: "1",
  name: "React Dashboard",
  fileCount: 45,
  createdDate: "2024-01-15",
  status: "complete",
};

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="h-full flex flex-col bg-background">
      <ProjectHeader project={mockProject} />

      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <div className="border-b border-border px-6">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="docs">Documentation</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full m-0">
              <ChatPanel projectId={params.projectId} />
            </TabsContent>

            <TabsContent value="docs" className="h-full m-0">
              <DocsViewer projectId={params.projectId} />
            </TabsContent>

            <TabsContent value="files" className="h-full m-0">
              <div className="p-6 text-center text-muted-foreground">
                <p>File explorer coming soon</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
