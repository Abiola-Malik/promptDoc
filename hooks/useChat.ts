"use client";

import { useState, useCallback, useRef } from "react";

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

interface UseChatOptions {
  projectId: string;
  onError?: (error: string) => void;
}

export function useChat({ projectId, onError }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAssistantIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, options?: { intent: "generate documentation" }) => {
      if (!content.trim() || isLoading) return;

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      if (options?.intent === "generate documentation") {
        setIsLoading(true);
        const generatingMessageId = `assistant-${Date.now()}`;
        currentAssistantIdRef.current = generatingMessageId;
        const generatingMessage: Message = {
          id: generatingMessageId,
          role: "assistant",
          content: "Generating documentation...",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, generatingMessage]);
        abortControllerRef.current = new AbortController();
        try {
          const response = await fetch(`/api/projects/${projectId}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              intent: "generate documentation",
            }),
            signal: abortControllerRef.current?.signal,
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || "Failed to generate documentation"
            );
          }
          const data = await response.json();
          if (data && data.file) {
            const { filename, content: fileContent, title } = data.file;
            const finalPath = filename.startsWith("/")
              ? filename
              : `/docs/${filename}`;
            const successMessage: Message = {
              id: generatingMessageId,
              role: "assistant",
              content: `**${
                title || filename
              }** generated!\n\n→ Saved as \`${finalPath}\`\n\nYou can now view and edit it in the file explorer.`,
              timestamp: new Date(),
            };
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === generatingMessageId ? successMessage : msg
              )
            );

            // Trigger global file creation event
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("fileCreated", {
                  detail: { path: finalPath, content: fileContent, open: true },
                })
              );
            }
          } else {
            throw new Error("No file returned from server");
          }
        } catch (error) {
          // error handling
          const errorMsg =
            error instanceof Error
              ? error.message
              : "Failed to generate documentation";

          const errorMessage: Message = {
            id: generatingMessageId,
            role: "assistant",
            content: `**Error generating documentation:**\n\n${errorMsg}`,
            timestamp: new Date(),
          };

          setMessages((prev) =>
            prev.map((m) => (m.id === generatingMessageId ? errorMessage : m))
          );

          onError?.(errorMsg);
        } finally {
          setIsLoading(false);
          abortControllerRef.current = null;
          currentAssistantIdRef.current = null;
        }
        return;
      }

      ///// NORMAL CHAT MESSAGE SENDING /////
      setIsLoading(true);
      setStreamingMessage(""); // Clear previous streaming message

      // Generate assistant message ID
      const assistantId = `assistant-${Date.now()}`;
      currentAssistantIdRef.current = assistantId;

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/projects/${projectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to send message");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let sources: Message["sources"] = undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "start") {
                  // Optional: handle start event
                  console.log("Stream started");
                }

                if (data.type === "chunk") {
                  // Accumulate content and update streaming message
                  accumulatedContent += data.content;
                  setStreamingMessage(accumulatedContent);
                }

                if (data.type === "sources") {
                  // Store sources for final message
                  sources = data.sources;
                }

                if (data.type === "done") {
                  // Finalize: move streaming message to messages array
                  const finalMessage: Message = {
                    id: assistantId,
                    role: "assistant",
                    content: accumulatedContent,
                    timestamp: new Date(),
                    sources,
                  };

                  setMessages((prev) => [...prev, finalMessage]);
                  setStreamingMessage(""); // Clear streaming message
                  setIsLoading(false);
                }

                if (data.type === "error") {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                // Ignore JSON parse errors from incomplete chunks
                if (parseError instanceof SyntaxError) {
                  continue;
                }
                throw parseError;
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request cancelled by user");

          // If there's accumulated content, save it
          if (streamingMessage) {
            const partialMessage: Message = {
              id: assistantId,
              role: "assistant",
              content: streamingMessage + "\n\n_[Generation stopped]_",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, partialMessage]);
          }

          setStreamingMessage("");
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to send message";

          console.error("Error sending message:", error);
          onError?.(errorMessage);

          // Add error message to chat
          const errorMsg: Message = {
            id: assistantId,
            role: "assistant",
            content: ` **Error:** ${errorMessage}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
          setStreamingMessage("");
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
        currentAssistantIdRef.current = null;
      }
    },
    [projectId, isLoading, onError]
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingMessage("");
    setIsLoading(false);
  }, []);

  return {
    messages,
    streamingMessage,
    isLoading,
    sendMessage,
    stop,
    clearMessages,
  };
}
