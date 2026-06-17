"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/components/ui/dialog";
import { Input } from "@/lib/components/ui/input";
import type { GithubRepo } from "@/features/github/models/github";

type Step = "repos" | "confirm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRepoSelected: (repo: GithubRepo, fileCount: number) => void;
};

export default function GithubPickerModal({
  open,
  onOpenChange,
  onRepoSelected,
}: Props) {
  const [step, setStep] = useState<Step>("repos");
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [filtered, setFiltered] = useState<GithubRepo[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<GithubRepo | null>(null);
  const [fileCount, setFileCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setFetchError(null);
    fetch("/api/github/repos")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load repositories.");
        return r.json();
      })
      .then((data) => {
        setRepos(data.repos ?? []);
        setFiltered(data.repos ?? []);
      })
      .catch(() => setFetchError("Failed to load repositories."))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    setFiltered(
      repos.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    );
  }, [search, repos]);

  async function handleSelectRepo(repo: GithubRepo) {
    setSelected(repo);
    setTreeLoading(true);
    try {
      const res = await fetch(
        `/api/github/tree?repo=${encodeURIComponent(repo.full_name)}`,
      );
      const data = await res.json();
      setFileCount(data.tree?.length ?? 0);
      setStep("confirm");
    } catch {
      setFetchError("Failed to fetch file tree.");
    } finally {
      setTreeLoading(false);
    }
  }

  function handleConfirm() {
    if (!selected || fileCount === null) return;
    onRepoSelected(selected, fileCount);
    onOpenChange(false);
    setStep("repos");
    setSelected(null);
    setSearch("");
  }

  function handleClose(o: boolean) {
    if (!o) {
      setStep("repos");
      setSearch("");
      setSelected(null);
      setFetchError(null);
    }
    onOpenChange(o);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#0f0f0f] border-[#1f1f1f] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-[#1a1a1a]">
          <DialogTitle className="text-sm font-medium text-[#ededed]">
            {step === "repos" ? "Select a repository" : "Confirm import"}
          </DialogTitle>
        </DialogHeader>

        {step === "repos" && (
          <div className="p-4 space-y-3">
            {/* search */}
            <Input
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs bg-[#141414] border-[#1f1f1f] text-[#ededed]
                         placeholder:text-[#3f3f3f] focus-visible:ring-0
                         focus-visible:border-[#333]"
              autoFocus
            />

            {/* error */}
            {fetchError && (
              <p className="text-xs text-red-400 px-1">{fetchError}</p>
            )}

            {/* list */}
            <div className="max-h-72 overflow-y-auto space-y-0.5 -mx-1 px-1">
              {loading ? (
                <div className="space-y-1.5 py-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 rounded bg-[#141414] animate-pulse"
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-xs text-[#444] text-center py-8">
                  No repositories found
                </p>
              ) : (
                filtered.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handleSelectRepo(repo)}
                    disabled={treeLoading}
                    className="w-full text-left px-3 py-2.5 rounded-md
                               hover:bg-[#141414] transition-colors duration-100
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] text-[#ccc] truncate">
                        {repo.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {repo.private && (
                          <span
                            className="text-[10px] text-[#555] border border-[#2a2a2a]
                                           rounded px-1.5 py-0.5"
                          >
                            private
                          </span>
                        )}
                        {repo.language && (
                          <span className="text-[10px] text-[#444]">
                            {repo.language}
                          </span>
                        )}
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-[11px] text-[#3f3f3f] mt-0.5 truncate">
                        {repo.description}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {step === "confirm" && selected && (
          <div className="p-4 space-y-4">
            {/* repo summary */}
            <div className="rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-3 space-y-1">
              <p className="text-[13px] text-[#ededed] font-medium">
                {selected.full_name}
              </p>
              <p className="text-[11px] text-[#555]">
                {fileCount} code files detected
              </p>
              {fileCount !== null && fileCount > 300 && (
                <p className="text-[11px] text-[#f59e0b]">
                  Large repo — indexing may take a few minutes.
                </p>
              )}
            </div>

            {/* actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("repos")}
                className="text-[12px] text-[#555] hover:text-[#999]
                           transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirm}
                className="h-8 px-4 rounded-md bg-[#ededed] text-[#0a0a0a]
                           text-[12px] font-medium hover:bg-white
                           transition-colors duration-100"
              >
                Index repository
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
