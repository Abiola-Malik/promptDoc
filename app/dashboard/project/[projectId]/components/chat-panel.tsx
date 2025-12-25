// app/dashboard/project/[projectId]/components/chat-panel.tsx
"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { createChat, getProjectChats } from "@/lib/actions/chats.actions";
import { Loader2 } from "lucide-react";
import { ChatMessages } from "./chat-message";

interface ChatPanelProps {
  projectId: string;
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize: Load chats and create first one if needed
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setIsInitializing(true);
        const chats = await getProjectChats(projectId);

        if (!isMounted) return;

        if (chats.length > 0) {
          // Select most recent chat
          setActiveChatId(chats[0].$id);
        } else {
          // Create first chat automatically
          const newChat = await createChat(projectId, "General Chat");
          if (!isMounted) return;
          setActiveChatId(newChat.$id);
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        if (!isMounted) return;
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [projectId]);
  if (isInitializing) {
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
      {/* Chat Sidebar - List of chats for this project */}
      <div className="w-64 flex-shrink-0 border-r border-border">
        <ChatSidebar
          projectId={projectId}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
        />
      </div>

      {/* Main Chat Area - Messages for selected chat */}
      <div className="flex-1">
        {activeChatId ? (
          <ChatMessages projectId={projectId} chatId={activeChatId} />
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
