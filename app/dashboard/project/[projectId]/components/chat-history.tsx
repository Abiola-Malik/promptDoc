"use client";

interface Chat {
  id: string;
  title: string;
  date: Date;
}

interface ChatHistoryProps {
  chats: Chat[];
}

export function ChatHistory({ chats }: ChatHistoryProps) {
  return (
    <div className="w-64 border-r border-border bg-card p-4 overflow-auto hidden lg:block">
      <h3 className="font-semibold text-foreground mb-4">Chat History</h3>
      <div className="space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm text-foreground transition-colors"
            onClick={() => {
              // TODO: Load or navigate to selected chat
              console.log("Selected chat:", chat.id);
            }}
          >
            <p className="truncate">{chat.title}</p>
            <p className="text-xs text-muted-foreground">
              {chat.date.toLocaleDateString()}
            </p>
          </button>
        ))}{" "}
      </div>
    </div>
  );
}
