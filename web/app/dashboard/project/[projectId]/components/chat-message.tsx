// hooks/useChat.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saveMessage } from "@/lib/actions/chats.actions";
import { createGeneratedFile } from "@/lib/actions/file.actions";
import { useState, useCallback, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChatIntent = "generate documentation" | undefined;

export interface MessageSource {
  score?: number;
  metadata?: {
    filename?: string;
    startLine?: number;
  };
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: MessageSource[];
}

interface UseChatOptions {
  projectId: string;
  chatId: string;
  onError?: (error: string) => void;
}

interface SendMessageOptions {
  intent?: ChatIntent;
}

// ── SSE event shapes (Q&A streaming path only) ───────────────────────────────

interface SSEThinkingEvent {
  type: "thinking";
  message: string;
}
interface SSEChunkEvent {
  type: "chunk";
  content: string;
}
interface SSESourcesEvent {
  type: "sources";
  sources: MessageSource[];
}
interface SSEDoneEvent {
  type: "done";
}
interface SSEErrorEvent {
  type: "error";
  error: string;
}

type SSEEvent =
  | SSEThinkingEvent
  | SSEChunkEvent
  | SSESourcesEvent
  | SSEDoneEvent
  | SSEErrorEvent;

function isSSEEvent(value: unknown): value is SSEEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as { type: unknown }).type === "string"
  );
}

// ── Doc-gen job polling types ─────────────────────────────────────────────────

interface DocGenJobStatus {
  job_id: string;
  type: string;
  status: "queued" | "running" | "complete" | "failed";
  result_path: string;
  error: string;
  content?: string;
}

const DOC_GEN_POLL_INTERVAL_MS = 1800;
const DOC_GEN_MAX_POLL_ATTEMPTS = 60; // ~108s ceiling — generous but bounded

// ── Hook ──────────────────────────────────────────────────────────────────────
//
// Two delivery mechanisms, chosen per-intent:
//
// 1. Normal Q&A — SSE streaming via /api/projects/[id]/chat. Tokens render
//    as they arrive via local `streamingMessage` state. The final message is
//    persisted into the shared React Query cache once the stream completes.
//
// 2. "generate documentation" — async job + polling via /api/generate-docs.
//    The doc-gen LangGraph path (plan → draft → critique) routinely exceeds
//    typical HTTP proxy timeout windows, so instead of streaming: POST
//    enqueues the job and returns immediately, a background worker runs the
//    graph with no HTTP connection involved, and the frontend polls a status
//    endpoint until the job completes.
//
// IMPORTANT — cache subscription:
// `messages` is read via `useQuery` with `enabled: false`. This is what
// makes this hook reactive. `chat-panel.tsx` owns the real query that fetches
// message history from Appwrite on mount under the same queryKey
// ["chat-messages", chatId]. This hook never re-fetches that data; it only
// subscribes to the same cache entry so that whenever `addMessageMutation`'s
// setQueryData call updates it (e.g. when an SSE stream finishes), React
// Query notifies this component and it re-renders. A plain
// queryClient.getQueryData(...) call reads the cache once at render time and
// is never notified of later updates — which is why streamed Q&A answers
// previously vanished even though the mutation succeeded and the cache was
// correct underneath.

export function useChat({ projectId, chatId, onError }: UseChatOptions) {
  const queryClient = useQueryClient();
  const [streamingMessage, setStreamingMessage] = useState("");
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCancelledRef = useRef(false);

  // Subscribes to the message cache without ever fetching on its own.
  // enabled: false means this query never runs its own network request —
  // it purely mirrors whatever chat-panel.tsx's real query has already put
  // in the cache, and re-renders this component on every write to that key.
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["chat-messages", chatId],
    queryFn: () => Promise.resolve([]),
    enabled: false,
    staleTime: Infinity,
  });

  const addMessageMutation = useMutation({
    mutationFn: async (message: Message) => {
      await saveMessage({
        chatId,
        role: message.role,
        content: message.content,
        projectId,
        sources: message.sources?.map(
          (source) => source.metadata?.filename || JSON.stringify(source),
        ),
      });
      return message;
    },
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ["chat-messages", chatId] });
      const previousMessages = queryClient.getQueryData<Message[]>([
        "chat-messages",
        chatId,
      ]);
      queryClient.setQueryData<Message[]>(["chat-messages", chatId], (old) => [
        ...(old ?? []),
        newMessage,
      ]);
      return { previousMessages };
    },
    onError: (err, _newMessage, context) => {
      queryClient.setQueryData(
        ["chat-messages", chatId],
        context?.previousMessages,
      );
      onError?.(err instanceof Error ? err.message : "Failed to save message");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
    },
  });

  // Updates a message in the local query cache in place, identified by id.
  // Used for evolving progress text ("Queued..." → "Generating...") on the
  // same logical assistant message without creating duplicates, before the
  // mutation that ultimately persists the final version. Uses setQueryData
  // directly (not the mutation) because these are transient UI states that
  // should never be written to Appwrite.
  function upsertAssistantMessage(id: string, message: Message) {
    queryClient.setQueryData<Message[]>(["chat-messages", chatId], (old) => {
      const existing = old ?? [];
      const idx = existing.findIndex((m) => m.id === id);
      if (idx === -1) return [...existing, message];
      const next = [...existing];
      next[idx] = message;
      return next;
    });
  }

  // ── Q&A streaming path ───────────────────────────────────────────────────────
  async function runStreamingChat(content: string) {
    const assistantId = `assistant-${Date.now()}`;
    abortControllerRef.current = new AbortController();

    let accumulatedContent = "";
    let sources: MessageSource[] | undefined;

    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || "Failed to send message",
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          let parsed: unknown;
          try {
            parsed = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          if (!isSSEEvent(parsed)) continue;

          switch (parsed.type) {
            case "thinking":
              setThinkingMessage(parsed.message);
              break;
            case "chunk":
              accumulatedContent += parsed.content;
              setStreamingMessage(accumulatedContent);
              setThinkingMessage("");
              break;
            case "sources":
              sources = parsed.sources;
              break;
            case "error":
              throw new Error(parsed.error);
            case "done": {
              addMessageMutation.mutate({
                id: assistantId,
                role: "assistant",
                content: accumulatedContent,
                timestamp: new Date(),
                sources,
              });
              // Clear local streaming state — the message now lives in the
              // shared cache (subscribed to via useQuery above), so the UI
              // continues showing it without a gap.
              setStreamingMessage("");
              setThinkingMessage("");
              break;
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        if (accumulatedContent) {
          addMessageMutation.mutate({
            id: assistantId,
            role: "assistant",
            content: accumulatedContent + "\n\n_[Generation stopped]_",
            timestamp: new Date(),
          });
        }
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        addMessageMutation.mutate({
          id: assistantId,
          role: "assistant",
          content: `**Error:** ${errorMessage}`,
          timestamp: new Date(),
        });
        onError?.(errorMessage);
      }
    } finally {
      setStreamingMessage("");
      setThinkingMessage("");
    }
  }

  // ── Doc-gen async polling path ───────────────────────────────────────────────
  async function runDocGeneration(content: string) {
    const assistantId = `assistant-${Date.now()}`;
    pollCancelledRef.current = false;

    const placeholder: Message = {
      id: assistantId,
      role: "assistant",
      content: "Queued — preparing to generate documentation...",
      timestamp: new Date(),
    };
    upsertAssistantMessage(assistantId, placeholder);

    try {
      const startRes = await fetch("/api/generate-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: content, projectId }),
      });

      if (!startRes.ok) {
        const err = await startRes.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error || "Failed to start generation",
        );
      }

      const { jobId } = (await startRes.json()) as { jobId: string };

      const progressLabels: Record<string, string> = {
        queued: "Queued — waiting for a worker to pick this up...",
        running: "Generating documentation — this can take up to a minute...",
      };

      let attempts = 0;

      const poll = async (): Promise<void> => {
        if (pollCancelledRef.current) return;

        attempts += 1;
        if (attempts > DOC_GEN_MAX_POLL_ATTEMPTS) {
          const errorMessage =
            "Generation is taking longer than expected. Please try again.";
          upsertAssistantMessage(assistantId, {
            ...placeholder,
            content: `**Error:** ${errorMessage}`,
          });
          pollCancelledRef.current = true;
          onError?.(errorMessage);
          return;
        }

        const statusRes = await fetch(`/api/generate-docs/status/${jobId}`);
        if (!statusRes.ok) {
          pollTimeoutRef.current = setTimeout(poll, DOC_GEN_POLL_INTERVAL_MS);
          return;
        }

        const status = (await statusRes.json()) as DocGenJobStatus;

        if (status.status === "queued" || status.status === "running") {
          upsertAssistantMessage(assistantId, {
            ...placeholder,
            content: progressLabels[status.status] ?? "Working on it...",
          });
          pollTimeoutRef.current = setTimeout(poll, DOC_GEN_POLL_INTERVAL_MS);
          return;
        }

        if (status.status === "failed") {
          const errorMessage =
            status.error || "Documentation generation failed";
          upsertAssistantMessage(assistantId, {
            ...placeholder,
            content: `**Error:** ${errorMessage}`,
          });
          pollCancelledRef.current = true;
          onError?.(errorMessage);
          return;
        }

        // complete — persist the generated markdown as a file in the project.
        // Goes through addMessageMutation (not upsertAssistantMessage) since
        // the final confirmation should be saved to Appwrite, unlike the
        // transient "Queued.../Generating..." progress states above.
        const markdown = status.content ?? "";
        const filename = "GENERATED_DOCS.md";

        const result = await createGeneratedFile({
          projectId,
          filename,
          content: markdown,
          title: "Generated documentation",
        });

        addMessageMutation.mutate({
          id: assistantId,
          role: "assistant",
          content: `**Generated documentation** is ready!\n\nSaved as \`${result.path}\`\n\nYou can now view and edit it in the file explorer.`,
          timestamp: new Date(),
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("promptdoc:generate-file", {
              detail: { path: result.path, content: markdown, open: true },
            }),
          );
        }
      };

      await poll();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Documentation generation failed";
      addMessageMutation.mutate({
        id: assistantId,
        role: "assistant",
        content: `**Error:** ${errorMessage}`,
        timestamp: new Date(),
      });
      onError?.(errorMessage);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string, options?: SendMessageOptions) => {
      if (!content.trim() || isLoading || !chatId) return;

      addMessageMutation.mutate({
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      });

      setIsLoading(true);
      setStreamingMessage("");
      setThinkingMessage("");

      try {
        if (options?.intent === "generate documentation") {
          await runDocGeneration(content);
        } else {
          await runStreamingChat(content);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, chatId, isLoading, onError],
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    pollCancelledRef.current = true;
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    setIsLoading(false);
  }, []);

  return {
    messages,
    streamingMessage,
    thinkingMessage,
    isLoading,
    sendMessage,
    stop,
  };
}
