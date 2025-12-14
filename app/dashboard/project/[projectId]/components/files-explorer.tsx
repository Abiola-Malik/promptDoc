"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FileCode,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
}

const mockFiles: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "app",
        type: "folder",
        children: [
          { name: "page.tsx", type: "file", language: "tsx" },
          { name: "layout.tsx", type: "file", language: "tsx" },
          {
            name: "dashboard",
            type: "folder",
            children: [
              { name: "page.tsx", type: "file", language: "tsx" },
              {
                name: "components",
                type: "folder",
                children: [
                  { name: "project-header.tsx", type: "file", language: "tsx" },
                  { name: "chat-panel.tsx", type: "file", language: "tsx" },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "components",
        type: "folder",
        children: [
          {
            name: "ui",
            type: "folder",
            children: [
              { name: "button.tsx", type: "file", language: "tsx" },
              { name: "textarea.tsx", type: "file", language: "tsx" },
            ],
          },
          { name: "chat-panel.tsx", type: "file", language: "tsx" },
          { name: "docs-viewer.tsx", type: "file", language: "tsx" },
        ],
      },
      {
        name: "lib",
        type: "folder",
        children: [
          { name: "gemini.ts", type: "file", language: "ts" },
          { name: "pinecone.ts", type: "file", language: "ts" },
          { name: "appwrite.ts", type: "file", language: "ts" },
        ],
      },
      {
        name: "hooks",
        type: "folder",
        children: [
          { name: "useChat.ts", type: "file", language: "ts" },
          { name: "useProject.ts", type: "file", language: "ts" },
        ],
      },
    ],
  },
  { name: "package.json", type: "file", language: "json" },
  { name: "tailwind.config.ts", type: "file", language: "ts" },
  { name: "next.config.mjs", type: "file", language: "js" },
];

function FileTree({ nodes, depth = 0 }: { nodes: FileNode[]; depth?: number }) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["src", "src/app", "src/components"])
  );

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  };

  return (
    <div className={depth > 0 ? "ml-4" : ""}>
      {nodes.map((node) => {
        const key = `${depth}-${node.name}`;
        const isExpanded = expanded.has(key);

        return (
          <div key={key}>
            <div
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer select-none"
              onClick={() => node.type === "folder" && toggle(key)}
            >
              {node.type === "folder" ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )
              ) : (
                <div className="w-4" />
              )}
              {node.type === "folder" ? (
                <Folder className="w-4 h-4 text-primary/80" />
              ) : (
                <FileCode className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">
                {node.name}
              </span>
              {node.language && (
                <span className="ml-auto text-xs text-muted-foreground font-mono">
                  {node.language}
                </span>
              )}
            </div>

            {node.type === "folder" && isExpanded && node.children && (
              <div className="border-l border-border/50 ml-2 pl-4">
                <FileTree nodes={node.children} depth={depth + 1} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FilesExplorer({ projectId }: { projectId: string }) {
  const [search, setSearch] = useState("");

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Files</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-border"
            />
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {search ? (
            <p className="text-center text-muted-foreground py-8">
              Search coming soon
            </p>
          ) : (
            <FileTree nodes={mockFiles} />
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>24 files</span>
          <span>8 folders</span>
          <span>TypeScript • React</span>
        </div>
      </div>
    </div>
  );
}
