// app/dashboard/project/[projectId]/components/docs-viewer.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ReactNode } from "react";
import { useDocsStore } from "@/stores/DocStore";

type CodeProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export function DocsViewer() {
  const { currentDoc } = useDocsStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!currentDoc) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Select a file from the Files tab to view</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10 md:px-12 md:py-16">
        <h1 className="text-4xl font-bold mb-8 border-b pb-4">
          {currentDoc.title}
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }: CodeProps) {
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
                        style={
                          vscDarkPlus as { [key: string]: React.CSSProperties }
                        }
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
            {currentDoc.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
