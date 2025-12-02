export function FilesExplorer() {
  return (
    <div className="p-8">
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7h18M3 12h18M3 17h18"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">File Explorer</h3>
        <p className="text-muted-foreground">
          Browse and search files coming soon
        </p>{" "}
      </div>
    </div>
  );
}
