import { create } from "zustand";

export interface FileNode {
  path: string;
  name: string;
  type: "file" | "folder";
  content?: string; // For files
  children?: FileNode[]; // For folders
  isOpen?: boolean; // For folder expand/collapse
}

interface FileStore {
  files: FileNode[]; // Root level
  addFile: (path: string, content: string) => void;
  revokeFileUrl: (url: string) => void;
  openFile: (path: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  toggleFolder: (path: string) => void;
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [
    { path: "/docs", name: "docs", type: "folder", children: [], isOpen: true },
  ],
  addFile: (path, content) => {
    // store url instead of raw content for files

    const url = URL.createObjectURL(
      new Blob([content], { type: "text/markdown" })
    );

    const parts = path.split("/").filter((part) => part);
    set((state) => ({
      files: addToTree(state.files, parts, url),
    }));
  },
  revokeFileUrl: (url) => {
    URL.revokeObjectURL(url);
  },
  openFile: (path) => {
    // function to open file in the documentation tab.
  },
  deleteFile: (path) => {
    const deleteFromTree = (
      nodes: FileNode[],
      targetPath: string
    ): FileNode[] => {
      findAndRevoke(nodes, targetPath);
      function findAndRevoke(nodes: FileNode[], targetPath: string) {
        for (const node of nodes) {
          if (
            node.path === targetPath &&
            node.type === "file" &&
            node.content
          ) {
            URL.revokeObjectURL(node.content);
            return;
          }
          if (node.type === "folder" && node.children) {
            findAndRevoke(node.children, targetPath);
          }
        }
      }
      return nodes
        .filter((node) => node.path !== targetPath)
        .map((node) => {
          if (node.type === "folder" && node.children) {
            return {
              ...node,
              children: deleteFromTree(node.children, targetPath),
            };
          }
          return node;
        });
    };

    set((state) => ({
      files: deleteFromTree(state.files, path),
    }));
  },
  renameFile: (oldPath, newPath) => {
    const renameInTree = (
      nodes: FileNode[],
      oldP: string,
      newP: string
    ): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === oldP) {
          return {
            ...node,
            path: newP,
            name: newP.split("/").pop() || node.name,
          };
        }
        if (node.type === "folder" && node.children) {
          return {
            ...node,
            children: renameInTree(node.children, oldP, newP),
          };
        }
        return node;
      });
    };
    set((state) => ({
      files: renameInTree(state.files, oldPath, newPath),
    }));
  },
  toggleFolder: (path: string) => {
    const toggleInTree = (
      nodes: FileNode[],
      targetPath: string
    ): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === targetPath && node.type === "folder") {
          return {
            ...node,
            isOpen: !node.isOpen,
          };
        }
        if (node.type === "folder" && node.children) {
          return {
            ...node,
            children: toggleInTree(node.children, targetPath),
          };
        }
        return node;
      });
    };

    set((state) => ({
      files: toggleInTree(state.files, path),
    }));
  },
}));

// Helper to add to tree recursively
function addToTree(
  nodes: FileNode[],
  parts: string[],
  content: string,
  currentPath = ""
): FileNode[] {
  if (parts.length === 1) {
    const fullPath = currentPath
      ? `${currentPath}/${parts[0]}`
      : `/${parts[0]}`;
    return [
      ...nodes,
      { path: fullPath, name: parts[0], type: "file", content },
    ];
  }

  const folderName = parts[0];
  const folderPath = currentPath
    ? `${currentPath}/${folderName}`
    : `/${folderName}`;

  const folderIndex = nodes.findIndex(
    (n) => n.name === folderName && n.type === "folder"
  );

  if (folderIndex === -1) {
    // Create new folder
    const newFolder: FileNode = {
      path: folderPath,
      name: folderName,
      type: "folder",
      children: addToTree([], parts.slice(1), content, folderPath),
      isOpen: true,
    };
    return [...nodes, newFolder];
  }

  // Update existing folder
  return nodes.map((node, index) =>
    index === folderIndex
      ? {
          ...node,
          children: addToTree(
            node.children || [],
            parts.slice(1),
            content,
            folderPath
          ),
        }
      : node
  );
}
