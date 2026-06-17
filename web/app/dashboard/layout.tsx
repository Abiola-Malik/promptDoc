import ProjectSidebar from "./components/ProjectSidebar";

// Layout is a server component — no useState needed.
// Sidebar remains in the DOM on mobile so the client `ProjectSidebar`
// can manage visibility/overlay behavior itself. Previous `hidden md:flex`
// removed the element from the DOM on small screens which prevented
// client-side toggles from working.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-root dark flex h-screen bg-background text-foreground">
      <aside className="w-[220px] shrink-0 flex flex-col border-r border-[#1f1f1f]">
        <ProjectSidebar />
      </aside>
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
