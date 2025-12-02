import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Project } from "@/features/projects/model/project";
import { Loader2, AlertCircle } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isProcessing = project.status === "processing";
  const hasError = project.status === "error";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link href={`/dashboard/project/${project.$id}`}>
      <Card
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300
          hover:shadow-xl hover:-translate-y-1 hover:border-primary/50
          ${isProcessing ? "ring-2 ring-primary/20" : ""}
          ${hasError ? "ring-2 ring-destructive/20" : ""}
        `}
      >
        {/* Live Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <div>
                <p className="font-medium text-foreground">Processing...</p>
                <p className="text-sm text-muted-foreground">
                  {project.processingProgress || 0}% complete
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute top-3 right-3 z-20">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{project.name}</CardTitle>
              <CardDescription className="mt-1">
                {project.fileCount ?? 0} files •{" "}
                {project.framework ? `${project.framework} • ` : ""}
                Updated {formatDate(project.$updatedAt)}
              </CardDescription>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
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
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Created {formatDate(project.$createdAt)}
            </span>

            {/* Status Badge */}
            <span
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                ${
                  isProcessing
                    ? "bg-primary/10 text-primary"
                    : hasError
                    ? "bg-destructive/10 text-destructive"
                    : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                }
              `}
            >
              {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
              {hasError && <AlertCircle className="w-3 h-3" />}
              {!isProcessing && !hasError && (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
              {isProcessing ? "Processing" : hasError ? "Failed" : "Ready"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
