// app/dashboard/project/[projectId]/components/chat-message.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Loader2,
  X,
  Copy,
  CheckCircle2,
  Sparkles,
  FileCode2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { useChat } from "@/hooks/useChat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{
    score?: number;
    metadata?: {
      filename?: string;
      startLine?: number;
    };
  }>;
}

interface ChatMessagesProps {
  projectId: string;
  chatId: string;
  messages: Message[]; // Passed from parent
  isLoadingHistory: boolean; // Passed from parent
}

type CodeProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export function ChatMessages({
  projectId,
  chatId,
  messages,
  isLoadingHistory,
}: ChatMessagesProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"chat" | "generate-docs">("chat");

  const { streamingMessage, isLoading, sendMessage, stop } = useChat({
    projectId,
    chatId,
  });

  // Conditional auto-scroll
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (isNearBottom) {
      viewport.scrollTo({
        top: scrollHeight,
        behavior: isLoading && streamingMessage ? "auto" : "smooth",
      });
    }
  }, [messages, streamingMessage, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const trimmedInput = input.trim();

    const isDocRequest =
      mode === "generate-docs" ||
      /generate.*(docs?|documentation|readme)|create.*(readme|docs?)|document this/i.test(
        trimmedInput
      );

    if (isDocRequest) {
      sendMessage(trimmedInput, { intent: "generate documentation" });
    } else {
      sendMessage(trimmedInput);
    }

    setInput("");
    setMode("chat");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const markdownComponents = {
    code({ inline, className, children, ...props }: CodeProps) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");

      if (!inline && match) {
        return (
          <div className="relative my-6 -mx-6">
            <div className="flex items-center justify-between rounded-t-xl bg-muted/80 px-4 py-2.5 border border-b-0 border-border">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {match[1]}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3"
                onClick={() =>
                  copyToClipboard(codeString, `code-${codeString.slice(0, 50)}`)
                }
              >
                {copiedId === `code-${codeString.slice(0, 50)}` ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs ml-1">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-xs ml-1">Copy</span>
                  </>
                )}
              </Button>
            </div>
            <SyntaxHighlighter
              style={vscDarkPlus as { [key: string]: React.CSSProperties }}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: 0,
                borderBottomLeftRadius: "0.75rem",
                borderBottomRightRadius: "0.75rem",
                fontSize: "0.875rem",
              }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code
          className="rounded bg-black/20 px-2 py-1 text-sm font-medium"
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  if (isLoadingHistory) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Messages */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div
          ref={viewportRef}
          className="flex-1 px-6 py-8 overflow-y-auto overflow-x-hidden"
        >
          <div className="mx-auto max-w-4xl">
            {messages.length === 0 && !streamingMessage ? (
              <div className="flex min-h-full flex-col items-center justify-center space-y-10 py-20 text-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center backdrop-blur-md border border-primary/20 shadow-2xl">
                    <Sparkles className="w-16 h-16 text-primary animate-pulse" />
                  </div>
                  <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl opacity-50" />
                </div>

                <div className="space-y-4 max-w-2xl">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                    Ask Your Code Anything
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Generate docs • Explain logic • Find components • Refactor •
                    Debug
                  </p>
                </div>

                <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    "Generate full project documentation",
                    "Explain the authentication flow",
                    "Document the LanguageSelect component",
                    "How does data fetching work?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="rounded-xl border border-border/50 bg-card/50 p-5 text-left text-sm transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
                    >
                      <span className="font-medium">→</span> {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 pb-20">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-4 animate-in slide-in-from-bottom-6 duration-700",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {/* AI Avatar */}
                    {msg.role === "assistant" && (
                      <div className="mt-2 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-xl ring-4 ring-primary/10">
                        AI
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        "max-w-3xl rounded-3xl px-6 py-5 shadow-lg ring-1 ring-border",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {msg.content}
                          </ReactMarkdown>

                          {/* Sources */}
                          {msg.sources?.length && msg.sources.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-border/50">
                              <p className="mb-3 text-sm font-semibold text-muted-foreground">
                                Sources ({msg.sources.length})
                              </p>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {msg.sources.slice(0, 8).map((src, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-xs font-mono border border-border/50"
                                  >
                                    <span className="truncate">
                                      {src.metadata?.filename}:
                                      {src.metadata?.startLine}
                                    </span>
                                    <span className="ml-3 font-bold text-primary">
                                      {((src.score ?? 0) * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="mt-2 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted shadow-xl">
                        <svg
                          className="w-7 h-7"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <title>User Avatar</title>
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && streamingMessage && (
                  <div className="flex gap-4 justify-start">
                    <div className="mt-2 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-xl ring-4 ring-primary/10">
                      AI
                    </div>
                    <div className="max-w-3xl rounded-3xl bg-card px-6 py-5 shadow-lg ring-1 ring-border">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {streamingMessage}
                        </ReactMarkdown>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Input */}
      <div className="border-t border-border bg-background px-4 py-5 shrink-0 sticky bottom-0   ">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => setMode("chat")}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                mode === "chat"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMode("generate-docs")}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                mode === "generate-docs"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Generate Docs
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your code..."
              className="min-h-16 max-h-48 resize-none rounded-2xl border-border bg-card px-5 py-4 text-base focus-visible:ring-primary/50"
              disabled={isLoading}
            />
            <div className="flex items-end">
              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={stop}
                  className="size-12 rounded-2xl"
                  aria-label="Stop generation"
                >
                  <X className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="size-12 rounded-2xl"
                  aria-label="Send Message"
                >
                  <Send className="w-5 h-5" />
                </Button>
              )}
            </div>
          </form>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
