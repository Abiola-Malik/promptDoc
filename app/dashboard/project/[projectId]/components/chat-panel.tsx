// app/dashboard/project/[projectId]/components/chat-panel.tsx
"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { createChat, getProjectChats } from "@/lib/actions/chats.actions";
import { Loader2, MessageSquare, ChevronLeft, Menu } from "lucide-react";
import { ChatMessages } from "./chat-message";
import { useQuery } from "@tanstack/react-query";
import { getChatMessages } from "@/lib/actions/chats.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: chats = [], isLoading: isLoadingChats } = useQuery({
    queryKey: ["project-chats", projectId],
    queryFn: () => getProjectChats(projectId),
  });

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

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setIsSidebarOpen(false);
  };

  const activeChat = chats.find((chat) => chat.$id === activeChatId);

  if (isLoadingChats) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin mx-auto text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-sm md:text-base font-medium">Loading chats...</p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Setting up your workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0 border-r border-border">
        <ChatSidebar
          projectId={projectId}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Open chat list"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-96 p-0">
              <SheetHeader className="px-4 py-3 border-b border-border">
                <SheetTitle className="text-left">Chats</SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100%-60px)] overflow-y-auto">
                <ChatSidebar
                  projectId={projectId}
                  activeChatId={activeChatId}
                  onSelectChat={handleSelectChat}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary shrink-0" />
              <h2 className="text-sm font-semibold truncate">
                {activeChat?.title || "Chat"}
              </h2>
            </div>
            {messages.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Desktop Header (Optional) */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {activeChat?.title || "Chat"}
            </h2>
            {messages.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 min-h-0">
          {activeChatId ? (
            <ChatMessages
              projectId={projectId}
              chatId={activeChatId}
              messages={messages}
              isLoadingHistory={isLoadingHistory}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-base md:text-lg font-medium">
                    No chat selected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Select a chat from the sidebar or create a new one to get
                    started
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="w-4 h-4 mr-2" />
                  Open Chat List
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
