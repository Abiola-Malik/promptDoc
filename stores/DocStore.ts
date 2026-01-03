import { create } from "zustand";

interface Doc {
  fileId: string;
  path: string;
  title: string;
  content: string;
  size?: number;
}

interface DocsState {
  currentDoc: Doc | null;
  setCurrentDoc: (doc: Doc | null) => void;
  loadDocContent: (
    fileId: string,
    path: string,
    title: string
  ) => Promise<void>;
}

let currentRequestId = 0;

export const useDocsStore = create<DocsState>((set, get) => ({
  currentDoc: null,
  setCurrentDoc: (doc) => set({ currentDoc: doc }),
  loadDocContent: async (fileId, path, title) => {
    // Avoid refetch if already loaded
    if (get().currentDoc?.fileId === fileId) return;

    const requestId = ++currentRequestId;

    try {
      const res = await fetch(`/api/files/${fileId}`);
      if (!res.ok) throw new Error("Failed to load file");
      const content = await res.text();

      // Only update if this is still the latest request
      if (requestId !== currentRequestId) return;

      set({
        currentDoc: {
          fileId,
          path,
          title,
          content,
        },
      });
    } catch (error) {
      console.error("Failed to load doc content:", error);
      // Only clear if this is still the latest request
      if (requestId === currentRequestId) {
        set({ currentDoc: null });
      }
    }
  },
}));
