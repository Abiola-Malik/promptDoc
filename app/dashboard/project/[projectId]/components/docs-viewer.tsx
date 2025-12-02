"use client";

interface DocsViewerProps {
  projectId: string;
}

export function DocsViewer({ projectId }: DocsViewerProps) {
  const sampleMarkdown = `# React Dashboard Documentation

## Overview
This is a comprehensive dashboard application built with React and TypeScript.

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## Components

### Header
The main header component with navigation.

### Sidebar
Navigation sidebar with project links.

### Dashboard
Main content area for displaying data.

## API Endpoints

- \`GET /api/projects\` - Fetch all projects
- \`POST /api/projects\` - Create new project
- \`GET /api/projects/:id\` - Get project details

## Best Practices

1. Use TypeScript for type safety
2. Follow component composition patterns
3. Keep components small and focused
4. Use custom hooks for logic reuse
`;

  return (
    <div className="h-full overflow-auto p-6 md:p-8 max-w-4xl">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {sampleMarkdown.split("\n").map((line, index) => {
          if (line.startsWith("# ")) {
            return (
              <h1
                key={index}
                className="text-3xl font-bold text-foreground mt-6 mb-4"
              >
                {line.replace("# ", "")}
              </h1>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h2
                key={index}
                className="text-2xl font-bold text-foreground mt-4 mb-3"
              >
                {line.replace("## ", "")}
              </h2>
            );
          }
          if (line.startsWith("- ")) {
            return (
              <ul key={index} className="list-disc ml-6 my-2">
                <li key={index} className="text-foreground ml-4 my-1">
                  {line.replace("- ", "")}
                </li>
              </ul>
            );
          }
          if (line.startsWith("```")) {
            return null;
          }
          if (line.trim() === "") {
            return <div key={index} className="h-2" />;
          }
          return (
            <p key={index} className="text-foreground/90 my-2 leading-relaxed">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}
