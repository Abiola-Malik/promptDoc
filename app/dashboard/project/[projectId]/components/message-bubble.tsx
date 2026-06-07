"use client";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
        max-w-xs lg:max-w-md px-4 py-3 rounded-lg
        ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-muted text-foreground rounded-bl-none"
        }
      `}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={`
          text-xs mt-1
          ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}
        `}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
