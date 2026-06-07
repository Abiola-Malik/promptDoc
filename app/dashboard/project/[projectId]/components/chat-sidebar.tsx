// app/dashboard/project/[projectId]/components/chat-sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Trash2, Edit2 } from "lucide-react";
import {
  getProjectChats,
  createChat,
  deleteChat,
  updateChatTitle,
  type Chat,
} from "@/lib/actions/chats.actions";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  projectId: string;
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatSidebar({
  projectId,
  activeChatId,
  onSelectChat,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    loadChats();
  }, [projectId]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const projectChats = await getProjectChats(projectId);
      setChats(projectChats);

      // Auto-select first chat if none selected
      if (!activeChatId && projectChats.length > 0) {
        onSelectChat(projectChats[0].$id);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await createChat(projectId);
      setChats((prev) => [newChat, ...prev]);
      onSelectChat(newChat.$id);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm("Delete this chat and all its messages?")) return;

    try {
      await deleteChat(chatId);
      const remainingChats = chats.filter((c) => c.$id !== chatId);
      setChats(remainingChats);

      // Select another chat if deleted was active
      if (activeChatId === chatId && remainingChats.length > 0) {
        onSelectChat(remainingChats[0].$id);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };
  const handleSaveTitle = async (chatId: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await updateChatTitle(chatId, editTitle);
      setChats((prev) =>
        prev.map((c) => (c.$id === chatId ? { ...c, title: editTitle } : c))
      );
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading chats...</div>;
  }

  return (
    <div className="flex h-full flex-col border-r border-border bg-card/50">
      <div className="p-4 border-b border-border">
        <Button onClick={handleCreateChat} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.$id}
              className={cn(
                "group relative rounded-lg p-3 cursor-pointer transition-colors",
                activeChatId === chat.$id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50"
              )}
              onClick={() => onSelectChat(chat.$id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editingId === chat.$id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveTitle(chat.$id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle(chat.$id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditTitle("");
                        }
                      }}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <h4 className="font-medium text-sm truncate">
                          {chat.title}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {chat.messageCount || 0} messages
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(chat.$id);
                      setEditTitle(chat.title);
                    }}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.$id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
