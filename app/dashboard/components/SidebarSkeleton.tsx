export default function SidebarSkeleton() {
  return (
    <div className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="h-8 bg-sidebar-primary/20 rounded w-32 animate-pulse" />
      </div>
      <div className="flex-1 p-4 space-y-3">
        <div className="h-4 bg-sidebar-accent/20 rounded w-24 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-9 bg-sidebar-accent/10 rounded-lg animate-pulse"
          />
        ))}
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <div className="h-10 bg-sidebar-primary/20 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
