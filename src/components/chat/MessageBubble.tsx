"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import type { MessageBubbleData } from "@/types"

interface MessageBubbleProps {
  message: MessageBubbleData
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex max-w-[70%] ${isUser ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}>
        {!isUser && (
          <Avatar className="w-8 h-8 mb-1">
            <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">
              {message.senderName
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`${isUser ? "mr-2" : "ml-2"}`}>
          {!isUser && message.senderName && (
            <p className="text-xs text-muted-foreground mb-1 px-2">{message.senderName}</p>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`
              px-4 py-2 rounded-2xl relative
              ${isUser ? "neo-gradient text-white rounded-br-md" : "bg-card border border-border/50 rounded-bl-md"}
              ${isUser ? "animate-slide-in-right" : "animate-slide-in-left"}
            `}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>

            <div
              className={`
              text-xs mt-1 opacity-70
              ${isUser ? "text-white/70" : "text-muted-foreground"}
            `}
            >
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </div>

            {/* Message tail */}
            <div
              className={`
              absolute bottom-0 w-3 h-3
              ${
                isUser
                  ? "right-0 translate-x-1 neo-gradient"
                  : "left-0 -translate-x-1 bg-card border-l border-b border-border/50"
              }
              transform rotate-45
            `}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
