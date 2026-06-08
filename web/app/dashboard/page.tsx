// app/dashboard/page.tsx
import { getUserProjects } from "@/features/projects/services/getUserProjects";
import DashboardClient from "./components/DashboardClient";

export default async function DashboardPage() {
  const projects = await getUserProjects();
  return <DashboardClient projects={projects} />;
}
