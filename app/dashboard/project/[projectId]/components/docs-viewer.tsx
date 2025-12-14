"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sampleMarkdown = `# React Dashboard Documentation

## Overview
This is a comprehensive dashboard application built with React and TypeScript. It provides real-time analytics, project management, and team collaboration features.

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## Tech Stack
- React 18 + TypeScript
- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- Appwrite for auth & database
- Pinecone for vector search
- Gemini for AI documentation

## Components

### ProjectHeader
Displays project name, status, and actions.

### ChatPanel
Real-time AI chat with streaming responses and source citations.

### DocsViewer
Beautiful Markdown rendering of generated documentation (you're looking at it!).

## API Endpoints

| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | /api/projects         | List all user projects          |
| POST   | /api/projects         | Create new project              |
| GET    | /api/projects/[id]    | Get project details             |
| POST   | /api/chat/stream      | Stream AI response              |

## Best Practices
1. Always use Server Components when possible
2. Keep Client Components minimal
3. Use Server Actions for mutations
4. Leverage streaming for AI responses
5. Never leak secrets to the client

## Architecture
Uses Next.js App Router with hybrid Server/Client rendering. Data flows through Server Actions → Appwrite → Pinecone → Gemini AI.
`;

export function DocsViewer({ projectId }: { projectId: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10 md:px-12 md:py-16">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1({ children }) {
                return (
                  <h1 className="text-4xl font-bold text-foreground mt-12 mb-6 first:mt-0 border-b border-border pb-4">
                    {children}
                  </h1>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-3xl font-bold text-foreground mt-10 mb-5 border-l-4 border-primary pl-4">
                    {children}
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                    {children}
                  </h3>
                );
              },
              p({ children }) {
                return (
                  <p className="text-foreground/90 leading-relaxed my-4">
                    {children}
                  </p>
                );
              },
              ul({ children }) {
                return (
                  <ul className="list-disc list-inside my-6 space-y-2 pl-4">
                    {children}
                  </ul>
                );
              },
              ol({ children }) {
                return (
                  <ol className="list-decimal list-inside my-6 space-y-2 pl-4">
                    {children}
                  </ol>
                );
              },
              li({ children }) {
                return <li className="text-foreground/90">{children}</li>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-primary/50 pl-6 italic my-8 text-foreground/80">
                    {children}
                  </blockquote>
                );
              },
              table({ children }) {
                return (
                  <div className="my-8 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full">{children}</table>
                  </div>
                );
              },
              thead({ children }) {
                return <thead className="bg-muted/50">{children}</thead>;
              },
              th({ children }) {
                return (
                  <th className="px-6 py-4 text-left font-semibold text-foreground border-b border-border">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-6 py-4 border-b border-border/50 text-foreground/90">
                    {children}
                  </td>
                );
              },
              hr() {
                return <hr className="my-12 border-border/50" />;
              },
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                if (!inline && match) {
                  return (
                    <div className="relative group my-8 -mx-6 md:mx-0">
                      <div className="flex items-center justify-between bg-muted/80 px-6 py-3 rounded-t-xl border border-b-0 border-border">
                        <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                          {match[1]}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(codeString)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedCode === codeString ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: 0,
                          borderBottomLeftRadius: "0.75rem",
                          borderBottomRightRadius: "0.75rem",
                          fontSize: "0.9375rem",
                          padding: "1.5rem",
                        }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                return (
                  <code
                    className="px-2 py-1 rounded bg-muted font-mono text-sm border border-border/50"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {sampleMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
