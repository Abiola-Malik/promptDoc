"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Project } from "@/features/projects/model/project";

// ProjectSidebar is self-contained — it fetches its own project list.
// Props removed entirely: onUploadClick and onNavigate are gone.
// New project action lives in DashboardClient where the modals are.
// This sidebar is navigation only.
export default function ProjectSidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (mounted.current) setProjects(data);
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
        if (mounted.current) setFetchError(String(err ?? "Unknown error"));
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* wordmark */}
      <div className="px-4 h-12 flex items-center border-b border-[#1f1f1f] shrink-0">
        <Link
          href="/"
          className="text-[13px] font-semibold text-[#ededed] tracking-tight"
        >
          PromptDoc
        </Link>
      </div>

      {/* project list */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <p className="px-2 mb-2 text-[10px] uppercase tracking-widest text-[#333]">
          Projects
        </p>

        {loading ? (
          <div className="px-2 py-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 rounded bg-[#141414] animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="px-2 py-4 text-sm text-red-400">
            Failed to load projects: {fetchError}
          </div>
        ) : projects.length === 0 ? (
          <p className="px-2 text-[12px] text-[#3f3f3f]">No projects</p>
        ) : (
          <nav className="space-y-0.5">
            {projects.map((p) => {
              const active = pathname.startsWith(`/dashboard/project/${p.$id}`);
              return (
                <Link
                  key={p.$id}
                  href={`/dashboard/project/${p.$id}`}
                  className={`
                    flex items-center gap-2 px-2 py-1.5 rounded text-[13px]
                    transition-colors duration-100 truncate
                    ${
                      active
                        ? "bg-[#1a1a1a] text-[#ededed]"
                        : "text-[#666] hover:text-[#999] hover:bg-[#141414]"
                    }
                  `}
                >
                  {/* status dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      p.status === "ready"
                        ? "bg-[#3ecf8e]"
                        : p.status === "indexing"
                          ? "bg-[#f59e0b]"
                          : p.status === "error"
                            ? "bg-[#ef4444]"
                            : "bg-[#333]"
                    }`}
                  />
                  <span className="truncate">{p.name}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* bottom nav */}
      <div className="shrink-0 border-t border-[#1f1f1f] py-2 px-2">
        <Link
          href="/dashboard"
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded text-[12px]
            transition-colors duration-100
            ${
              pathname === "/dashboard"
                ? "bg-[#1a1a1a] text-[#ededed]"
                : "text-[#444] hover:text-[#666] hover:bg-[#141414]"
            }
          `}
        >
          All projects
        </Link>
      </div>
    </div>
  );
}
