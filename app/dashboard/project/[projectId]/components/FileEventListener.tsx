"use client";

import { useFileStore } from "@/stores/FileStore";
import { useEffect } from "react";

export function FileEventListener() {
  useEffect(() => {
    const handleGenerate = (
      e: CustomEvent<{ path: string; content: string; open?: boolean }>
    ) => {
      const { path, content, open = true } = e.detail;

      useFileStore.getState().addFile(path, content);

      if (open) {
        useFileStore.getState().openFile(path);
      }
    };

    window.addEventListener(
      "promptdoc:generate-file",
      handleGenerate as EventListener
    );

    return () => {
      window.removeEventListener(
        "promptdoc:generate-file",
        handleGenerate as EventListener
      );
    };
  }, []);

  // This component renders nothing
  return null;
}
