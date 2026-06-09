// app/dashboard/components/DashboardClient.tsx
"use client";
import { useState } from "react";
import { ProjectCard } from "./project-card";
import GithubPickerModal from "./github-picker-modal";
import { Button } from "@/lib/components/ui/button";
import { Upload, Github } from "lucide-react";
import { GithubRepo } from "@/features/github/models/github";
import { UploadModal } from "./upload-modal";

export default function DashboardClient({ projects }: { projects: any[] }) {
  const [zipOpen, setZipOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);

  function handleRepoSelected(repo: GithubRepo, fileCount: number) {
    // TODO Phase 4: wire to /api/ingest once chunk-service is built
    console.log("repo selected", repo.full_name, fileCount, "files");
  }

  const ActionButtons = (
    <div className="flex gap-3">
      <Button onClick={() => setZipOpen(true)} variant="outline">
        <Upload className="w-4 h-4 mr-2" />
        Upload ZIP
      </Button>
      <Button onClick={() => setGithubOpen(true)}>
        <Github className="w-4 h-4 mr-2" />
        Import from GitHub
      </Button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <svg
            className="w-16 h-16 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4m0 0v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7"
            />
          </svg>
          <h2 className="text-2xl font-semibold">No projects yet</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Upload a ZIP file or import directly from a GitHub repository to get
            started.
          </p>
          {ActionButtons}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
              <p className="text-muted-foreground">
                Upload and manage your code projects
              </p>
            </div>
            {ActionButtons}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.$id} project={project} />
            ))}
          </div>
        </>
      )}

      <UploadModal open={zipOpen} onOpenChange={setZipOpen} />
      <GithubPickerModal
        open={githubOpen}
        onOpenChange={setGithubOpen}
        onRepoSelected={handleRepoSelected}
      />
    </div>
  );
}
