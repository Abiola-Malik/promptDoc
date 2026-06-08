"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Project } from "@/features/projects/model/project";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const [copied, setCopied] = useState(false);

  const isProcessing = project.status === "processing";
  const progress = project.processingProgress || 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const frameworkBadge = project.framework ? (
    <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
      {project.framework}
    </span>
  ) : null;

  return (
    <div className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Name + Meta */}
          <div className="flex items-center gap-5 min-w-0">
            {/* Icon + Status Ring */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4"
                  />
                </svg>
              </div>

              {/* Processing Ring */}
              {isProcessing && (
                <div className="absolute -inset-1 rounded-2xl">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="30"
                      stroke="hsl(var(--border))"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="30"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 30 * (1 - progress / 100)
                      }`}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {progress}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Name + Details */}
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground truncate max-w-md">
                  {project.name}
                </h1>
                {frameworkBadge}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{project.fileCount} files</span>
                <span>•</span>
                <span>{project.chunksCount || 0} chunks indexed</span>
                <span>•</span>
                <span>
                  Updated {new Date(project.$updatedAt).toLocaleDateString()}
                </span>
                {isProcessing && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Processing...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Share
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy project link</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
