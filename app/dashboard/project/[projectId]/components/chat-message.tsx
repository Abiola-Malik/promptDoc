"use client";

import { useRef, useEffect, useState, useMemo, memo } from "react";
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
  Bot,
  User as UserIcon,
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
  messages: Message[];
  isLoadingHistory: boolean;
}

type CodeProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLElement>;

const MessageBubble = memo(
  ({
    msg,
    markdownComponents,
  }: {
    msg: Message;
    markdownComponents: Record<string, unknown>;
  }) => (
    <div
      className={cn(
        "flex gap-3 md:gap-4 animate-in slide-in-from-bottom-6 duration-700",
        msg.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {msg.role === "assistant" && (
        <div
          className="mt-2 flex size-9 md:size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/10"
          aria-label="AI Assistant"
        >
          <Bot className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] sm:max-w-2xl md:max-w-3xl rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-5 shadow-lg ring-1 ring-border",
          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
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

            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border/50">
                <p className="mb-2 md:mb-3 text-xs md:text-sm font-semibold text-muted-foreground">
                  Sources ({msg.sources.length})
                </p>
                <div className="grid grid-cols-1 gap-2 md:gap-3 sm:grid-cols-2">
                  {msg.sources.slice(0, 8).map((src, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 md:px-4 md:py-3 text-xs font-mono border border-border/50"
                    >
                      <span className="truncate">
                        {src.metadata?.filename}:{src.metadata?.startLine}
                      </span>
                      <span className="ml-2 md:ml-3 font-bold text-primary shrink-0">
                        {((src.score ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm md:text-base leading-relaxed break-words">
            {msg.content}
          </p>
        )}
      </div>

      {msg.role === "user" && (
        <div
          className="mt-2 flex size-9 md:size-11 shrink-0 items-center justify-center rounded-2xl bg-muted shadow-xl"
          aria-label="User"
        >
          <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      )}
    </div>
  )
);

MessageBubble.displayName = "MessageBubble";

const LoadingSkeleton = () => (
  <div className="flex gap-3 md:gap-4 justify-start animate-pulse">
    <div className="mt-2 flex size-9 md:size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20" />
    <div className="max-w-[85%] sm:max-w-2xl md:max-w-3xl rounded-2xl md:rounded-3xl bg-card/50 px-4 py-3 md:px-6 md:py-5 shadow-lg ring-1 ring-border/50">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
    </div>
  </div>
);

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

    if (mode === "generate-docs") {
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

  const markdownComponents = useMemo(
    () => ({
      code({ inline, className, children, ...props }: CodeProps) {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");

        if (!inline && match) {
          return (
            <div className="relative my-4 md:my-6 -mx-4 md:-mx-6">
              <div className="flex items-center justify-between rounded-t-xl bg-muted/80 px-3 md:px-4 py-2 md:py-2.5 border border-b-0 border-border">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                  <span className="text-[10px] md:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {match[1]}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 md:h-8 px-2 md:px-3"
                  onClick={() =>
                    copyToClipboard(
                      codeString,
                      `code-${codeString.length}-${codeString.slice(
                        0,
                        30
                      )}-${codeString.slice(-20)}`
                    )
                  }
                  aria-label="Copy code to clipboard"
                >
                  {copiedId ===
                  `code-${codeString.length}-${codeString.slice(
                    0,
                    30
                  )}-${codeString.slice(-20)}` ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                      <span className="text-[10px] md:text-xs ml-1">
                        Copied!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="text-[10px] md:text-xs ml-1">Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <SyntaxHighlighter
                  style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    borderBottomLeftRadius: "0.75rem",
                    borderBottomRightRadius: "0.75rem",
                    fontSize: "0.813rem",
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            </div>
          );
        }

        return (
          <code
            className="rounded bg-black/20 px-1.5 md:px-2 py-0.5 md:py-1 text-xs md:text-sm font-medium"
            {...props}
          >
            {children}
          </code>
        );
      },
    }),
    [copiedId]
  );

  if (isLoadingHistory) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading chat history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Messages Area */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 md:px-6 py-4 md:py-8"
      >
        <div className="mx-auto max-w-4xl">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex min-h-full flex-col items-center justify-center space-y-6 md:space-y-10 py-12 md:py-20 text-center px-4">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center backdrop-blur-md border border-primary/20 shadow-2xl">
                  <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
                </div>
                <div className="absolute -inset-6 md:-inset-8 rounded-full bg-primary/10 blur-3xl opacity-50" />
              </div>

              <div className="space-y-3 md:space-y-4 max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                  Ask Your Code Anything
                </h1>
                <p className="text-base md:text-xl text-muted-foreground">
                  Generate docs • Explain logic • Find components • Refactor •
                  Debug
                </p>
              </div>

              <div className="grid w-full max-w-3xl grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2">
                {[
                  "Generate full project documentation",
                  "Explain the authentication flow",
                  "Document the LanguageSelect component",
                  "How does data fetching work?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-xl border border-border/50 bg-card/50 p-4 md:p-5 text-left text-xs md:text-sm transition-all hover:border-primary/50 hover:bg-card hover:shadow-md active:scale-95"
                  >
                    <span className="font-medium">→</span> {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  markdownComponents={markdownComponents}
                />
              ))}

              {isLoading && streamingMessage && (
                <div className="flex gap-3 md:gap-4 justify-start">
                  <div
                    className="mt-2 flex size-9 md:size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/10"
                    aria-label="AI Assistant"
                  >
                    <Bot className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="max-w-[85%] sm:max-w-2xl md:max-w-3xl rounded-2xl md:rounded-3xl bg-card px-4 py-3 md:px-6 md:py-5 shadow-lg ring-1 ring-border">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {streamingMessage}
                      </ReactMarkdown>
                    </div>
                    <div className="mt-2 md:mt-3 flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && !streamingMessage && <LoadingSkeleton />}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 md:px-4 py-3 md:py-5 shrink-0">
        <div className="mx-auto max-w-4xl">
          {/* Mode Selector */}
          <div className="flex justify-center gap-2 md:gap-4 mb-3 md:mb-4">
            <button
              type="button"
              onClick={() => setMode("chat")}
              disabled={isLoading}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                mode === "chat"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted active:scale-95"
              )}
              aria-label="Chat mode"
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMode("generate-docs")}
              disabled={isLoading}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                mode === "generate-docs"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted active:scale-95"
              )}
              aria-label="Generate documentation mode"
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Generate Docs
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "generate-docs"
                  ? "Describe what docs you want to generate..."
                  : "Ask about your code..."
              }
              className="min-h-12 md:min-h-16 max-h-32 md:max-h-48 resize-none rounded-xl md:rounded-2xl border-border bg-card px-3 md:px-5 py-3 md:py-4 text-sm md:text-base focus-visible:ring-primary/50"
              disabled={isLoading}
              rows={1}
            />
            <div className="flex items-end">
              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={stop}
                  className="size-10 md:size-12 rounded-xl md:rounded-2xl shrink-0"
                  aria-label="Stop generation"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="size-10 md:size-12 rounded-xl md:rounded-2xl shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              )}
            </div>
          </form>

          {/* Help Text */}
          <p className="mt-2 md:mt-3 text-center text-[10px] md:text-xs text-muted-foreground">
            <span className="hidden sm:inline">
              Enter to send • Shift+Enter for new line
            </span>
            <span className="sm:hidden">Tap to send</span>
          </p>
        </div>
      </div>
    </div>
  );
}
