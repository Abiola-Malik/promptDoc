import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Project } from "@/features/projects/model/project";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // const formattedDate = new Date(project.updatedDate).toLocaleDateString(
  //   "en-US",
  //   {
  //     month: "short",
  //     day: "numeric",
  //     year: "numeric",
  //   }
  // );

  return (
    <Link href={`/dashboard/${project.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>
                {/* {project.fileCount} files • Updated {formattedDate} */}
              </CardDescription>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-primary"
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
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {/* Created {new Date(project.createdDate).toLocaleDateString()} */}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Complete
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
