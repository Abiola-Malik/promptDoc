// app/dashboard/components/DashboardClient.tsx
"use client";
import { useState } from "react";
import { ProjectCard } from "./project-card";
import GithubPickerModal from "./github-picker-modal";
import { Button } from "@/lib/components/ui/button";
import { Upload, Github } from "lucide-react";
import { GithubRepo } from "@/features/github/models/github";
import { UploadModal } from "./upload-modal";
import { useRouter } from "next/navigation";

export default function DashboardClient({ projects }: { projects: any[] }) {
  const [zipOpen, setZipOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const router = useRouter();

  async function handleRepoSelected(repo: GithubRepo, fileCount: number) {
    try {
      // get github token from session
      const tokenRes = await fetch("/api/github/token");
      if (!tokenRes.ok) {
        const txt = await tokenRes.text().catch(() => "");
        console.error("Failed to fetch GitHub token:", txt || tokenRes.status);
        alert("Failed to authenticate GitHub access. Please sign in again.");
        return;
      }

      const tokenJson = await tokenRes.json().catch(() => ({}));
      const token = tokenJson?.token;
      if (!token) {
        console.error("No GitHub token returned", tokenJson);
        alert("No GitHub token available. Please connect your GitHub account.");
        return;
      }

      const formData = new FormData();
      formData.append("source", "github");
      formData.append("name", repo.name);
      formData.append("repo", repo.full_name);
      formData.append("branch", repo.default_branch || "main");
      formData.append("token", token);

      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // try JSON then fall back to text
        let errMsg = "Ingest request failed";
        try {
          const parsed = await res.json();
          errMsg = parsed?.error || parsed?.detail || JSON.stringify(parsed);
        } catch {
          errMsg = (await res.text().catch(() => "")) || errMsg;
        }
        console.error("Ingest failed:", errMsg);
        alert(`Failed to start import: ${errMsg}`);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data.success) {
        router.push(`/dashboard/project/${data.projectId}`);
      } else {
        const msg = data?.message || data?.error || "Unknown error";
        console.error("Ingest did not succeed:", data);
        alert(`Import failed: ${msg}`);
      }
    } catch (err) {
      console.error("Error during repo import:", err);
      alert("An unexpected error occurred while importing the repository.");
    }
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
