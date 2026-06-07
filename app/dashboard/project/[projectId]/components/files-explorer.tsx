// app/dashboard/project/[projectId]/components/files-explorer.tsx
"use client";

import { useState } from "react";
import {
  File,
  Folder,
  Search,
  ChevronRight,
  ChevronDown,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getProjectFiles } from "@/lib/actions/file.actions";
import { useDocsStore } from "@/stores/DocStore";
import { useTabsStore } from "@/stores/TabStore";

interface FileNode {
  path: string;
  name: string;
  type: "file" | "folder";
  fileId?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

interface FileTreeProps {
  nodes: FileNode[];
  level?: number;
}

function FileTree({ nodes, level = 0 }: FileTreeProps) {
  const { loadDocContent } = useDocsStore();
  const { setActiveTab } = useTabsStore();

  const handlePreview = async (node: FileNode) => {
    if (node.type !== "file" || !node.fileId) return;

    try {
      await loadDocContent(node.fileId, node.path, node.name);
      setActiveTab("docs");
    } catch (error) {
      console.error("Failed to load document:", error);
      // Consider showing a toast notification to the user
    }
  };
  return (
    <div className={cn("ml-4", level > 0 && "border-l border-border/50 pl-2")}>
      {nodes.map((node) => (
        <div key={node.path}>
          {node.type === "folder" ? (
            <>
              <div className="flex items-center gap-2 w-full py-1 text-sm hover:bg-muted/50 rounded-md px-2">
                {node.isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Folder className="w-4 h-4 text-primary" />
                {node.name}
              </div>
              {node.isOpen && node.children && (
                <FileTree nodes={node.children} level={level + 1} />
              )}
            </>
          ) : (
            <div className="group flex items-center justify-between w-full py-1 px-2 hover:bg-muted/50 rounded-md">
              <button
                onClick={() => handlePreview(node)}
                className="flex items-center gap-2 text-sm flex-1 text-left truncate"
                title={node.name}
              >
                <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{node.name}</span>
              </button>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => handlePreview(node)}
                  title="Preview in Docs"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  asChild
                  title="Download"
                >
                  <a href={`/api/files/${node.fileId}/download`} download>
                    <Download className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function FilesExplorer({ projectId }: { projectId: string }) {
  const [search, setSearch] = useState("");

  const { data: rawFiles = [], isLoading } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: () => getProjectFiles(projectId),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const buildFileTree = (
    files: Array<{ path: string; fileId: string }>
  ): FileNode[] => {
    const root: FileNode[] = [];

    files.forEach((file) => {
      const parts = file.path.split("/").filter(Boolean);
      let current = root;

      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current.push({
            path: file.path,
            name: part,
            type: "file",
            fileId: file.fileId,
          });
        } else {
          let folder = current.find(
            (n) => n.name === part && n.type === "folder"
          );
          if (!folder) {
            folder = {
              path: "/" + parts.slice(0, i + 1).join("/"),
              name: part,
              type: "folder",
              children: [],
              isOpen: true,
            };
            current.push(folder);
          }
          current = folder.children!;
        }
      });
    });

    return root;
  };

  const filterTree = (nodes: FileNode[], query: string): FileNode[] => {
    return nodes
      .map((node) => {
        if (node.type === "folder" && node.children) {
          const filteredChildren = filterTree(node.children, query);
          if (
            filteredChildren.length > 0 ||
            node.name.toLowerCase().includes(query)
          ) {
            return { ...node, children: filteredChildren, isOpen: true };
          }
          return null;
        }
        return node.name.toLowerCase().includes(query) ? node : null;
      })
      .filter(Boolean) as FileNode[];
  };

  const treeFiles = buildFileTree(rawFiles);
  const filteredFiles = search
    ? filterTree(treeFiles, search.toLowerCase())
    : treeFiles;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl pl-10"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
            <Folder className="w-12 h-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {search ? "No files found" : "No files yet"}
            </p>
          </div>
        ) : (
          <FileTree nodes={filteredFiles} />
        )}
      </div>
    </div>
  );
}
