// app/dashboard/components/ProjectSidebar.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Project } from "@/features/projects/model/project";

interface ProjectSidebarProps {
  onUploadClick: () => void;
  onNavigate: () => void;
}

export default function ProjectSidebar({
  onUploadClick,
  onNavigate,
}: ProjectSidebarProps) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/projects");

        if (!mountedRef.current) return;

        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();

        if (!mountedRef.current) return;

        setProjects(data);
        setError(null);
      } catch (error) {
        if (!mountedRef.current) return;

        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
        console.error("Failed to fetch projects:", error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isActive = (projectId: string) =>
    pathname.startsWith(`/dashboard/project/${projectId}`);

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
            PD
          </div>
          PromptDoc
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-accent-foreground mb-3">
          Projects
        </p>
        <nav className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-sidebar-foreground/60" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-sidebar-foreground/60">
              No projects yet
            </p>
          ) : (
            projects.map((p) => (
              <Link
                key={p.$id}
                href={`/dashboard/project/${p.$id}`}
                onClick={onNavigate}
                aria-current={isActive(p.$id) ? "page" : undefined}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(p.$id)
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4"
                    />
                  </svg>
                  {p.name}
                  {p.status === "processing" && (
                    <Loader2
                      className="w-3 h-3 animate-spin ml-auto"
                      aria-label="Processing"
                    />
                  )}
                </span>
              </Link>
            ))
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <Button onClick={onUploadClick} className="w-full">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Project
        </Button>
      </div>
    </div>
  );
}
