"use client";

import { Button } from "@/components/ui/button";

import type { Project } from "@/features/projects/model/project";

interface ProjectHeaderProps {
  project: Project;
}
interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="border-b border-border px-6 py-4 bg-card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary"
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {project.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {/* {project.fileCount} files • Created{" "}
              {new Date(project.createdDate).toLocaleDateString()} */}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            /* TODO: Implement copy/share functionality */
          }}
          aria-label="Copy project link"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5A2.25 2.25 0 008.25 22.5h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-4.5 0V3a2.25 2.25 0 014.5 0v-1.5m0 0h3"
            />
          </svg>
        </Button>{" "}
      </div>
    </div>
  );
}
