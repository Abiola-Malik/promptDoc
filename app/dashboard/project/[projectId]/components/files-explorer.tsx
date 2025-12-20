"use client";

import { useState } from "react";
import { File, Folder, Search, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FileNode, useFileStore } from "@/stores/FileStore";

interface FileTreeProps {
  nodes: FileNode[];
  level?: number;
}

function FileTree({ nodes, level = 0 }: FileTreeProps) {
  const toggleFolder = useFileStore((state) => state.toggleFolder);
  const openFile = useFileStore((state) => state.openFile);

  return (
    <div className={cn("ml-4", level > 0 && "border-l border-border/50 pl-2")}>
      {nodes.map((node) => (
        <div key={node.path}>
          {node.type === "folder" ? (
            <>
              <button
                onClick={() => toggleFolder(node.path)}
                className="flex items-center gap-2 w-full py-1 text-sm hover:bg-muted/50 rounded-md px-2"
              >
                {node.isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Folder className="w-4 h-4 text-primary" />
                {node.name}
              </button>
              {node.isOpen && node.children && (
                <FileTree nodes={node.children} level={level + 1} />
              )}
            </>
          ) : (
            <button
              onClick={() => openFile(node.path)}
              className="flex items-center gap-2 w-full py-1 text-sm hover:bg-muted/50 rounded-md px-2"
            >
              <File className="w-4 h-4 text-muted-foreground" />
              {node.name}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function FilesExplorer({ projectId }: { projectId: string }) {
  const files = useFileStore((state) => state.files);
  const [search, setSearch] = useState("");
  console.log("Project ID in FilesExplorer:", projectId);

  const filterTree = (nodes: FileNode[], query: string): FileNode[] => {
    return nodes
      .map((node) => {
        if (node.type === "folder" && node.children) {
          const filteredChildren = filterTree(node.children, query);
          if (
            filteredChildren.length > 0 ||
            node.name.toLowerCase().includes(query)
          ) {
            return {
              ...node,
              children: filteredChildren,
              isOpen: filteredChildren.length > 0,
            };
          }
          return null;
        }
        return node.name.toLowerCase().includes(query) ? node : null;
      })
      .filter((node): node is FileNode => node !== null);
  };

  const filteredFiles = search
    ? filterTree(files, search.toLowerCase())
    : files;

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
