"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Project } from "@/features/projects/model/project";

export function ProjectHeader({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false);
  const isProcessing = project.status === "indexing";
  const progress = project.processingProgress || 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border-b border-[#1a1a1a] px-5 py-3 flex items-center justify-between gap-4 shrink-0">
      {/* left: name + meta */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[13px] font-medium text-[#ededed] truncate">
          {project.name}
        </span>

        {project.framework && (
          <span className="text-[10px] text-[#555] border border-[#222] rounded px-1.5 py-0.5 shrink-0">
            {project.framework}
          </span>
        )}

        <span className="text-[11px] text-[#3f3f3f] truncate hidden sm:inline">
          {project.fileCount} files · {project.chunksCount || 0} chunks
        </span>

        {isProcessing && (
          <span className="flex items-center gap-1.5 text-[11px] text-[#f59e0b] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
            {progress}%
          </span>
        )}
      </div>

      {/* right: actions */}
      <button
        onClick={handleCopy}
        aria-label={copied ? "Link copied to clipboard" : "Copy project link"}
        className="flex items-center gap-1.5 text-[11px] text-[#555] hover:text-[#999]
                   transition-colors shrink-0"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        <span aria-live="polite">{copied ? "Copied" : "Share"}</span>
      </button>
    </div>
  );
}
