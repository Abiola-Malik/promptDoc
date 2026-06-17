"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  getProjectChats,
  createChat,
  deleteChat,
  updateChatTitle,
  type Chat,
} from "@/lib/actions/chats.actions";

interface ChatSidebarProps {
  projectId: string;
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
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

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectChats = await getProjectChats(projectId);
      setChats(projectChats);
      if (!activeChatId && projectChats.length > 0) {
        onSelectChat(projectChats[0].$id);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, activeChatId, onSelectChat]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  async function handleCreateChat() {
    try {
      const newChat = await createChat(projectId);
      setChats((prev) => [newChat, ...prev]);
      onSelectChat(newChat.$id);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  }

  async function handleDeleteChat(chatId: string) {
    if (!confirm("Delete this chat and all its messages?")) return;
    try {
      await deleteChat(chatId);
      const remaining = chats.filter((c) => c.$id !== chatId);
      setChats(remaining);
      if (activeChatId === chatId && remaining.length > 0) {
        onSelectChat(remaining[0].$id);
      } else if (activeChatId === chatId && remaining.length === 0) {
        onSelectChat(null); // Clear stale ID; ChatPanel will auto-create
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  }

  async function handleSaveTitle(chatId: string) {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await updateChatTitle(chatId, editTitle);
      setChats((prev) =>
        prev.map((c) => (c.$id === chatId ? { ...c, title: editTitle } : c)),
      );
    } catch (error) {
      console.error("Failed to update title:", error);
    } finally {
      setEditingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="p-3 space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 rounded bg-[#141414] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* new chat */}
      <div className="p-2 border-b border-[#1a1a1a]">
        <button
          onClick={handleCreateChat}
          className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md
                     border border-[#1f1f1f] text-[12px] text-[#888]
                     hover:bg-[#141414] hover:text-[#ccc] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New chat
        </button>
      </div>

      {/* chat list */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {chats.map((chat) => (
          <div
            key={chat.$id}
            onClick={() => onSelectChat(chat.$id)}
            className={`
              group relative rounded-md px-2.5 py-2 cursor-pointer transition-colors
              ${activeChatId === chat.$id ? "bg-[#1a1a1a]" : "hover:bg-[#141414]"}
            `}
          >
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
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-1.5 py-0.5
                           text-[12px] text-[#ededed] focus:outline-none focus:border-[#444]"
              />
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12px] text-[#ccc] truncate">
                    {chat.title}
                  </p>
                  <p className="text-[10px] text-[#444] mt-0.5">
                    {chat.messageCount || 0} messages
                  </p>
                </div>

                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(chat.$id);
                      setEditTitle(chat.title);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded text-[#555] hover:text-[#999]"
                  >
                    <span className="text-[10px]">edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.$id);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded text-[#555] hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
