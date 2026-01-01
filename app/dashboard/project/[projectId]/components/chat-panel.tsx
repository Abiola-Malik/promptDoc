// app/dashboard/project/[projectId]/components/chat-panel.tsx
"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { createChat, getProjectChats } from "@/lib/actions/chats.actions";
import { Loader2 } from "lucide-react";
import { ChatMessages } from "./chat-message";
import { useQuery } from "@tanstack/react-query";
import { getChatMessages } from "@/lib/actions/chats.actions";

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

interface ChatPanelProps {
  projectId: string;
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Use cached chats from parent
  const { data: chats = [], isLoading: isLoadingChats } = useQuery({
    queryKey: ["project-chats", projectId],
    queryFn: () => getProjectChats(projectId),
  });

  // Auto-select first chat or create one
  useEffect(() => {
    const initialize = async () => {
      if (isLoadingChats) return;

      if (chats.length > 0 && !activeChatId) {
        setActiveChatId(chats[0].$id);
      } else if (chats.length === 0 && !activeChatId) {
        try {
          const newChat = await createChat(projectId, "General Chat");
          setActiveChatId(newChat.$id);
        } catch (error) {
          console.error("Failed to create chat:", error);
        }
      }
    };

    initialize();
  }, [chats, isLoadingChats, activeChatId, projectId]);

  // Use cached messages from parent
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
          ? (() => {
              try {
                return JSON.parse(msg.sources);
              } catch {
                console.error("Failed to parse message sources:", msg.$id);
                return undefined;
              }
            })()
          : undefined,
      })) as Message[];
    },
    enabled: !!activeChatId,
  });
  if (isLoadingChats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Chat Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-border">
        <ChatSidebar
          projectId={projectId}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        {activeChatId ? (
          <ChatMessages
            projectId={projectId}
            chatId={activeChatId}
            messages={messages}
            isLoadingHistory={isLoadingHistory}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Select a chat or create a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
