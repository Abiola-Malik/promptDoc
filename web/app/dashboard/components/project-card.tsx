import Link from "next/link";
import type { Project } from "@/features/projects/model/project";

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS = {
  ready: { dot: "bg-[#3ecf8e]", label: "Ready" },
  indexing: { dot: "bg-[#f59e0b]", label: "Indexing" },
  failed: { dot: "bg-[#ef4444]", label: "Failed" },
  default: { dot: "bg-[#3f3f3f]", label: "Unknown" },
} as const;

export function ProjectCard({ project }: { project: Project }) {
  const status =
    STATUS[project.status as keyof typeof STATUS] ?? STATUS.default;

  return (
    <Link
      href={`/dashboard/project/${project.$id}`}
      className="group block rounded-md border border-[#1f1f1f] bg-[#0f0f0f] p-4
                 hover:border-[#2f2f2f] hover:bg-[#111] transition-colors duration-150"
    >
      {/* name row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-sm font-medium text-[#ededed] truncate leading-snug">
          {project.name}
        </span>
        {/* status dot */}
        <span className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className="text-[11px] text-[#555]">{status.label}</span>
        </span>
      </div>

      {/* meta row */}
      <div className="flex items-center gap-3 text-[11px] text-[#444]">
        {project.language && <span>{project.language}</span>}
        {project.filesCount != null && <span>{project.filesCount} files</span>}
        {project.chunksCount != null && (
          <span>{project.chunksCount} chunks</span>
        )}
      </div>

      {/* footer */}
      <div className="mt-3 pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
        <span className="text-[11px] text-[#3f3f3f]">
          {timeAgo(project.$updatedAt)}
        </span>
        <span className="text-[11px] text-[#2a2a2a] group-hover:text-[#555] transition-colors">
          Open →
        </span>
      </div>
    </Link>
  );
}
