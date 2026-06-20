"use client";

import { useRef, useEffect, useState, useMemo, memo } from "react";
import { Textarea } from "@/lib/components/ui/textarea";
import { Send, X, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
    metadata?: { filename?: string; startLine?: number };
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

// ── Message bubble ───────────────────────────────────────────────────────────
// No avatars, no gradients, no shadows. Role is communicated by alignment +
// a subtle background tint only on user messages. Assistant messages are
// borderless — they read as part of the page, not as a "card".
const MessageBubble = memo(
  ({
    msg,
    markdownComponents,
  }: {
    msg: Message;
    markdownComponents: Record<string, unknown>;
  }) => (
    <div
      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-md px-3.5 py-2.5
      ${msg.role === "user" ? "bg-[#1a1a1a]" : ""}`}
      >
        {msg.role === "assistant" ? (
          <div
            className="prose prose-sm prose-invert max-w-none
                        prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-[#ccc]
                        prose-headings:text-[#ededed] prose-headings:font-medium
                        prose-strong:text-[#ededed] prose-code:text-[#ccc]
                        prose-a:text-[#3ecf8e]"
          >
            {/* in-progress doc-gen placeholder gets a pulsing dot instead of markdown rendering */}
            {msg.content.startsWith("Queued") ||
            msg.content.startsWith("Generating documentation") ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                <span className="text-[13px] text-[#888]">{msg.content}</span>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {msg.content}
              </ReactMarkdown>
            )}

            {msg.sources &&
              msg.sources.length > 0 &&
              (() => {
                const validSources = msg.sources.filter(
                  (s) =>
                    s &&
                    s.metadata &&
                    typeof s.metadata.filename === "string" &&
                    s.metadata.filename.trim() !== "" &&
                    s.metadata.startLine != null,
                );

                if (validSources.length === 0) {
                  return (
                    <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
                      <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1.5">
                        Sources
                      </p>
                      <div className="text-[11px] text-[#666]">
                        Unknown source
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
                    <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1.5">
                      Sources
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {validSources.slice(0, 8).map((src, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono text-[#666] bg-[#141414]
                                   border border-[#1f1f1f] rounded px-2 py-0.5"
                        >
                          {src.metadata!.filename}:{src.metadata!.startLine}
                          <span className="text-[#3ecf8e] ml-1.5">
                            {((src.score ?? 0) * 100).toFixed(0)}%
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed text-[#ededed] break-words">
            {msg.content}
          </p>
        )}
      </div>
    </div>
  ),
);
MessageBubble.displayName = "MessageBubble";

const LoadingSkeleton = () => (
  <div className="flex justify-start">
    <div className="max-w-[70%] rounded-md px-3.5 py-2.5 space-y-2">
      <div className="h-3 bg-[#141414] rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-[#141414] rounded w-full animate-pulse" />
      <div className="h-3 bg-[#141414] rounded w-5/6 animate-pulse" />
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

  const { streamingMessage, isLoading, sendMessage, thinkingMessage, stop } =
    useChat({
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const trimmed = input.trim();
    if (mode === "generate-docs") {
      sendMessage(trimmed, { intent: "generate documentation" });
    } else {
      sendMessage(trimmed);
    }
    setInput("");
    setMode("chat");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  async function copyToClipboard(content: string, id: string) {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const el = document.createElement("textarea");
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const markdownComponents = useMemo(
    () => ({
      code({ inline, className, children, ...props }: CodeProps) {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");
        const codeId = `code-${codeString.length}-${codeString.slice(0, 30)}`;

        if (!inline && match) {
          return (
            <div className="my-3 -mx-3.5 rounded-md overflow-hidden border border-[#1a1a1a]">
              <div
                className="flex items-center justify-between bg-[#0a0a0a] px-3 py-1.5
                            border-b border-[#1a1a1a]"
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#444]">
                  {match[1]}
                </span>
                <button
                  onClick={() => copyToClipboard(codeString, codeId)}
                  className="flex items-center gap-1 text-[10px] text-[#555] hover:text-[#999]
                           transition-colors"
                >
                  {copiedId === codeId ? (
                    <>
                      <Check className="w-3 h-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto">
                <SyntaxHighlighter
                  style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: "12px",
                    background: "#0d0d0d",
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
            className="rounded bg-[#1a1a1a] px-1 py-0.5 text-[12px]"
            {...props}
          >
            {children}
          </code>
        );
      },
    }),
    [copiedId],
  );

  if (isLoadingHistory) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-4 h-4 rounded-full border-2 border-[#222] border-t-[#555] animate-spin" />
      </div>
    );
  }

  const suggestions = [
    "Generate full project documentation",
    "Explain the authentication flow",
    "Document the LanguageSelect component",
    "How does data fetching work?",
  ];

  return (
    <div className="flex h-full flex-col">
      {/* messages */}
      <div ref={viewportRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex min-h-full flex-col items-center justify-center gap-8 py-16 text-center">
              <div className="space-y-1.5">
                <p className="text-[15px] text-[#ccc]">
                  Ask your code anything
                </p>
                <p className="text-[12px] text-[#444]">
                  Generate docs · explain logic · find components
                </p>
              </div>

              <div className="grid w-full max-w-md grid-cols-1 gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-md border border-[#1a1a1a] px-3.5 py-2.5 text-left
                               text-[12px] text-[#666] hover:border-[#2a2a2a]
                               hover:bg-[#0f0f0f] hover:text-[#999] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {(() => {
                // Deduplicate messages by id (keep the last version).
                const map = new Map<string, Message>();
                messages.forEach((m) => map.set(m.id, m));
                const displayMessages = Array.from(map.values());
                return displayMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    markdownComponents={markdownComponents}
                  />
                ));
              })()}

              {/* Thinking / Progress Message */}
              {thinkingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-md px-3.5 py-2.5">
                    <div className="flex items-center gap-3 text-sm text-[#888] italic">
                      <div className="w-2 h-2 bg-[#888] rounded-full animate-pulse" />
                      {thinkingMessage}
                    </div>
                  </div>
                </div>
              )}

              {/* Streaming Answer */}
              {isLoading && streamingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-md px-3.5 py-2.5">
                    <div
                      className="prose prose-sm prose-invert max-w-none
                                    prose-p:text-[13px] prose-p:text-[#ccc]"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {streamingMessage}
                      </ReactMarkdown>
                    </div>
                    <span className="inline-block w-1.5 h-3.5 bg-[#555] ml-0.5 animate-pulse" />
                  </div>
                </div>
              )}

              {isLoading && !streamingMessage && <LoadingSkeleton />}
            </div>
          )}
        </div>
      </div>

      {/* input */}
      <div className="border-t border-[#1a1a1a] px-4 py-3 shrink-0">
        <div className="mx-auto max-w-2xl">
          {/* mode toggle */}
          <div className="flex gap-1 mb-2">
            <button
              type="button"
              onClick={() => setMode("chat")}
              disabled={isLoading}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors disabled:opacity-40
                ${mode === "chat" ? "bg-[#1a1a1a] text-[#ededed]" : "text-[#555] hover:text-[#888]"}`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMode("generate-docs")}
              disabled={isLoading}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors disabled:opacity-40
                ${mode === "generate-docs" ? "bg-[#1a1a1a] text-[#ededed]" : "text-[#555] hover:text-[#888]"}`}
            >
              Generate docs
            </button>
          </div>

          {/* input row */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "generate-docs"
                  ? "Describe the docs you want..."
                  : "Ask about your code..."
              }
              className="min-h-9 max-h-32 resize-none rounded-md border-[#1f1f1f]
                         bg-[#0f0f0f] px-3 py-2 text-[13px] text-[#ededed]
                         placeholder:text-[#3f3f3f] focus-visible:ring-0
                         focus-visible:border-[#333]"
              disabled={isLoading}
              rows={1}
            />
            <button
              type={isLoading ? "button" : "submit"}
              onClick={isLoading ? stop : undefined}
              disabled={!isLoading && !input.trim()}
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md
                         bg-[#1a1a1a] hover:bg-[#222] text-[#ccc]
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <X className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <p className="mt-1.5 text-[10px] text-[#333]">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
