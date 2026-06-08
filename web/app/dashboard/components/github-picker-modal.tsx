"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { GithubRepo } from "@/features/github/models/github";

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

  // fetch repos on open
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((data) => {
        setRepos(data.repos ?? []);
        setFiltered(data.repos ?? []);
      })
      .catch((err) => {
        console.error("Error fetching repos:", err);
        // TODO: show error state in UI
      })
      .finally(() => setLoading(false));
  }, [open]);

  // filter on search
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
    } finally {
      setTreeLoading(false);
    }
  }

  function handleConfirm() {
    if (!selected || fileCount === null) return;
    onRepoSelected(selected, fileCount);
    onOpenChange(false);
    // reset
    setStep("repos");
    setSelected(null);
    setSearch("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "repos"
              ? "Select a GitHub repository"
              : "Confirm repository"}
          </DialogTitle>
        </DialogHeader>

        {step === "repos" && (
          <div className="space-y-3">
            <Input
              placeholder="Search repos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Loading repos...
              </p>
            ) : (
              <ScrollArea className="h-72">
                {filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No repositories found.
                  </p>
                )}
                <div className="space-y-1">
                  {filtered.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleSelectRepo(repo)}
                      disabled={treeLoading}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{repo.name}</span>
                        <div className="flex gap-2">
                          {repo.private && (
                            <Badge variant="outline">private</Badge>
                          )}
                          {repo.language && (
                            <Badge variant="secondary">{repo.language}</Badge>
                          )}
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {repo.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {step === "confirm" && selected && (
          <div className="space-y-4">
            <div className="rounded-md border p-4 space-y-2">
              <p className="font-medium">{selected.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {fileCount} code files detected
              </p>
              {fileCount && fileCount > 300 && (
                <p className="text-xs text-amber-600">
                  Large repo — indexing may take a few minutes.
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep("repos")}>
                Back
              </Button>
              <Button onClick={handleConfirm}>Index this repo</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
