import { ProjectCard } from "./components/project-card";
import { getUserProjects } from "@/features/projects/services/getUserProjects";

export default async function DashboardPage() {
  const projects = await getUserProjects();
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {projects.length === 0 ? (
        // Empty state
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
          <h2 className="text-2xl font-semibold text-foreground">
            No projects yet
          </h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Create your first project by uploading a ZIP file or connecting a
            GitHub repository to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your Projects
            </h1>
            <p className="text-muted-foreground">
              Upload and manage your code projects
            </p>
          </div>

          {/* Projects grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.$id} project={project} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
