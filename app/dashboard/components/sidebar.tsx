"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onUploadClick: () => void;
  onNavigate: () => void;
}

// Mock projects - replace with actual API calls
const mockProjects = [
  { id: "1", name: "React Dashboard" },
  { id: "2", name: "Next.js API" },
  { id: "3", name: "ML Pipeline" },
];

export default function Sidebar({ onUploadClick, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [projects] = useState(mockProjects);

  const isProjectActive = (projectId: string) => {
    return (
      pathname === `/dashboard/${projectId}` ||
      pathname.startsWith(`/dashboard/${projectId}/`)
    );
  };
  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
            PD
          </div>
          PromptDoc
        </h1>
      </div>

      {/* Projects list */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <p className="text-xs font-semibold text-sidebar-accent-foreground uppercase tracking-wide mb-3">
            Projects
          </p>
          <nav className="space-y-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${project.id}`}
                onClick={onNavigate}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${
                    isProjectActive(project.id)
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
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
                  {project.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* New Project button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={onUploadClick}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
        >
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
