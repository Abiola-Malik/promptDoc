"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectCard } from "./project-card";
import GithubPickerModal from "./github-picker-modal";
import { UploadModal } from "./upload-modal";
import { Button } from "@/lib/components/ui/button";
import { Upload, Github } from "lucide-react";
import type { GithubRepo } from "@/features/github/models/github";
import type { Project } from "@/features/projects/model/project";

export default function DashboardClient({ projects }: { projects: Project[] }) {
  const [zipOpen, setZipOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const router = useRouter();

  async function handleRepoSelected(repo: GithubRepo, _fileCount: number) {
    // intentionally reference `_fileCount` to satisfy linter for unused param
    void _fileCount;

    setImportError(null);
    setImporting(true);
    try {
      const tokenRes = await fetch("/api/github/token");
      if (!tokenRes.ok) {
        setImportError("GitHub authentication failed. Please sign in again.");
        return;
      }
      const { token } = await tokenRes.json();
      if (!token) {
        setImportError("No GitHub token available. Reconnect your account.");
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
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setImportError(data?.error || data?.detail || "Import failed.");
        return;
      }

      router.push(`/dashboard/project/${data.projectId}`);
    } catch {
      setImportError("An unexpected error occurred.");
    } finally {
      setImporting(false);
    }
  }

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setZipOpen(true)}
        className="h-8 text-xs border-[#1f1f1f] bg-transparent hover:bg-[#141414] text-[#999]"
      >
        <Upload className="w-3 h-3 mr-1.5" />
        Upload ZIP
      </Button>
      <Button
        size="sm"
        onClick={() => setGithubOpen(true)}
        disabled={importing}
        className="h-8 text-xs bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#ededed] border-0"
      >
        <Github className="w-3 h-3 mr-1.5" />
        {importing ? "Importing..." : "Import from GitHub"}
      </Button>
    </div>
  );

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      {/* error banner */}
      {importError && (
        <div className="mb-6 px-3 py-2 rounded-md bg-red-950/40 border border-red-900/50 text-red-400 text-xs">
          {importError}
          <button
            onClick={() => setImportError(null)}
            className="ml-3 underline underline-offset-2 opacity-70 hover:opacity-100"
          >
            dismiss
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        /* ── empty state ── */
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-sm text-[#555]">No projects yet</p>
          <p className="text-xs text-[#444] text-center max-w-xs">
            Upload a ZIP or import a GitHub repository to index your codebase.
          </p>
          {actions}
        </div>
      ) : (
        /* ── project list ── */
        <>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-[#555] uppercase tracking-widest">
              Projects · {projects.length}
            </span>
            {actions}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
