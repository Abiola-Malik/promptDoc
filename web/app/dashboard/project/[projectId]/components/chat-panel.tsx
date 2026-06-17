"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./chat-message";
import {
  createChat,
  getProjectChats,
  getChatMessages,
} from "@/lib/actions/chats.actions";
import { useQuery } from "@tanstack/react-query";

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

export function ChatPanel({ projectId }: { projectId: string }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [createChatError, setCreateChatError] = useState<string | null>(null);

  const { data: chats = [], isLoading: isLoadingChats } = useQuery({
    queryKey: ["project-chats", projectId],
    queryFn: () => getProjectChats(projectId),
  });

  useEffect(() => {
    // clear any previous create-chat error when chats reload
    setCreateChatError(null);
    if (isLoadingChats) return;
    if (chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].$id);
    } else if (chats.length === 0 && !activeChatId) {
      setCreateChatError(null);
      createChat(projectId, "General Chat")
        .then((c) => {
          setActiveChatId(c.$id);
          setCreateChatError(null);
        })
        .catch((e) => {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("Failed to create chat:", e);
          setCreateChatError(msg || "Failed to create chat");
        });
    }
  }, [chats, isLoadingChats, activeChatId, projectId]);

  async function tryCreateDefaultChat() {
    setCreateChatError(null);
    try {
      const c = await createChat(projectId, "General Chat");
      setActiveChatId(c.$id);
      setCreateChatError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Retry create chat failed:", e);
      setCreateChatError(msg || "Failed to create chat");
    }
  }

  const { data: messages = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["chat-messages", activeChatId],
    queryFn: async () => {
      if (!activeChatId) return [];
      const dbMessages = await getChatMessages(activeChatId);
      return dbMessages.map((msg) => ({
        id: msg.$id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        sources: msg.sources
          ? safeParseSources(msg.sources, msg.$id)
          : undefined,
      })) as Message[];
    },
    enabled: !!activeChatId,
  });

  function safeParseSources(raw: string, id: string) {
    try {
      return JSON.parse(raw);
    } catch {
      console.error("Failed to parse sources:", id);
      return undefined;
    }
  }

  const activeChat = chats.find((c) => c.$id === activeChatId);

  if (isLoadingChats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-4 h-4 rounded-full border-2 border-[#222] border-t-[#555] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* sidebar — hidden below lg, no sheet/drawer for now (revisit mobile separately) */}
      <div className="hidden lg:flex w-60 shrink-0 border-r border-[#1a1a1a]">
        <ChatSidebar
          projectId={projectId}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
        />
      </div>

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* chat title bar */}
        <div className="h-10 flex items-center px-4 border-b border-[#1a1a1a] shrink-0">
          <span className="text-[12px] text-[#888] truncate">
            {activeChat?.title || "Chat"}
          </span>
          {messages.length > 0 && (
            <span className="text-[11px] text-[#3f3f3f] ml-2">
              {messages.length}
            </span>
          )}
        </div>

        {createChatError && (
          <div className="px-4 py-2 bg-[#2a0f0f] text-[12px] text-[#ffdede] flex items-center justify-between gap-4">
            <div>
              Failed to create default chat: {createChatError}. You can retry or
              create a chat from the sidebar.
            </div>
            <div>
              <button
                onClick={tryCreateDefaultChat}
                className="px-2 py-1 rounded bg-[#3ecf8e] text-[#011006] text-[12px]"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0">
          {activeChatId ? (
            <ChatMessages
              projectId={projectId}
              chatId={activeChatId}
              messages={messages}
              isLoadingHistory={isLoadingHistory}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[12px] text-[#444]">No chat selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
