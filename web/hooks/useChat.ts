// hooks/useChat.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMessage } from "@/lib/actions/chats.actions";
import { createGeneratedFile } from "@/lib/actions/file.actions";
import { useState, useCallback, useRef } from "react";
import { useFileStore } from "@/stores/FileStore";

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
  chatId: string;
  onError?: (error: string) => void;
}

export function useChat({ projectId, chatId, onError }: UseChatOptions) {
  const queryClient = useQueryClient();
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAssistantIdRef = useRef<string | null>(null);

  // Mutation for adding messages (optimistic updates)
  const addMessageMutation = useMutation({
    mutationFn: async (message: Message) => {
      await saveMessage({
        chatId,
        role: message.role,
        content: message.content,
        projectId,
        sources: message.sources?.map(
          (source) => source.metadata?.filename || JSON.stringify(source)
        ),
      });
      return message;
    },
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["chat-messages", chatId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<Message[]>([
        "chat-messages",
        chatId,
      ]);

      // Optimistically update
      queryClient.setQueryData<Message[]>(["chat-messages", chatId], (old) => [
        ...(old || []),
        newMessage,
      ]);

      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ["chat-messages", chatId],
        context?.previousMessages
      );
      onError?.(err instanceof Error ? err.message : "Failed to save message");
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
    },
  });

  const sendMessage = useCallback(
    async (
      content: string,
      options?: { intent?: "generate documentation" }
    ) => {
      if (!content.trim() || isLoading || !chatId) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      // Optimistically add user message
      addMessageMutation.mutate(userMessage);

      ///// DOCUMENTATION GENERATION FLOW /////
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

        // Optimistically add generating message
        queryClient.setQueryData<Message[]>(
          ["chat-messages", chatId],
          (old) => [...(old || []), generatingMessage]
        );

        abortControllerRef.current = new AbortController();

        try {
          const response = await fetch(`/api/projects/${projectId}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              intent: "generate documentation",
            }),
            signal: abortControllerRef.current.signal,
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

            const result = await createGeneratedFile({
              projectId,
              filename,
              content: fileContent,
              title: title || filename,
            });

            const successMessage: Message = {
              id: generatingMessageId,
              role: "assistant",
              content: `**${title || filename}** generated!\n\n Saved as \`${
                result.path
              }\`\n\nYou can now view and edit it in the file explorer.`,
              timestamp: new Date(),
            };

            // Update generating message to success
            queryClient.setQueryData<Message[]>(
              ["chat-messages", chatId],
              (old) =>
                (old || []).map((msg) =>
                  msg.id === generatingMessageId ? successMessage : msg
                )
            );

            // Save success message to DB
            addMessageMutation.mutate(successMessage);

            // Trigger file creation
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("promptdoc:generate-file", {
                  detail: {
                    path: result.path,
                    content: fileContent,
                    open: true,
                  },
                })
              );
            }
          } else {
            throw new Error("No file returned from server");
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

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

          queryClient.setQueryData<Message[]>(
            ["chat-messages", chatId],
            (old) =>
              (old || []).map((m) =>
                m.id === generatingMessageId ? errorMessage : m
              )
          );

          addMessageMutation.mutate(errorMessage);
          onError?.(errorMsg);
        } finally {
          setIsLoading(false);
          abortControllerRef.current = null;
          currentAssistantIdRef.current = null;
        }
        return;
      }

      ///// NORMAL CHAT STREAMING /////
      setIsLoading(true);
      setStreamingMessage("");

      const assistantId = `assistant-${Date.now()}`;
      currentAssistantIdRef.current = assistantId;
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
        if (!reader) throw new Error("No response body");

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

                if (data.type === "chunk") {
                  accumulatedContent += data.content;
                  setStreamingMessage(accumulatedContent);
                }

                if (data.type === "sources") {
                  sources = data.sources;
                }

                if (data.type === "done") {
                  const finalMessage: Message = {
                    id: assistantId,
                    role: "assistant",
                    content: accumulatedContent,
                    timestamp: new Date(),
                    sources,
                  };

                  // Add to cache via mutation
                  addMessageMutation.mutate(finalMessage);

                  setStreamingMessage("");
                  setIsLoading(false);
                }

                if (data.type === "error") {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                if (parseError instanceof SyntaxError) continue;
                throw parseError;
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          if (streamingMessage) {
            const partialMessage: Message = {
              id: assistantId,
              role: "assistant",
              content: streamingMessage + "\n\n_[Generation stopped]_",
              timestamp: new Date(),
            };
            addMessageMutation.mutate(partialMessage);
          }
          setStreamingMessage("");
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to send message";

          const errorMsg: Message = {
            id: assistantId,
            role: "assistant",
            content: ` **Error:** ${errorMessage}`,
            timestamp: new Date(),
          };
          addMessageMutation.mutate(errorMsg);
          setStreamingMessage("");
          onError?.(errorMessage);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
        currentAssistantIdRef.current = null;
      }
    },
    [
      projectId,
      chatId,
      isLoading,
      streamingMessage,
      onError,
      queryClient,
      addMessageMutation,
    ]
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  const messages = queryClient.getQueryData<Message[]>([
    "chat-messages",
    chatId,
  ]) as Message[];

  return {
    messages,
    streamingMessage,
    isLoading,
    sendMessage,
    stop,
  };
}
