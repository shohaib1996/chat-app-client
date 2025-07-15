"use client"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import type { MessageBubbleData } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"

interface MessageBubbleProps {
  message: MessageBubbleData
  onEdit?: (messageId: string) => void
  onDelete?: (messageId: string) => void
}

export function MessageBubble({ message, onEdit, onDelete }: MessageBubbleProps) {
  const isUser = message.sender === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"} items-end space-x-2 min-w-0`}>
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
    px-4 py-2 rounded-2xl relative group min-w-0 max-w-xs sm:max-w-sm md:max-w-md
    ${isUser ? "neo-gradient text-white rounded-br-md" : "bg-card border border-border/50 rounded-bl-md"}
    ${isUser ? "animate-slide-in-right" : "animate-slide-in-left"}
  `}
          >
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap hyphens-auto">{message.content}</p>
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
              ${isUser ? "right-0 translate-x-1 neo-gradient" : "left-0 -translate-x-1 neo-gradient"}
              transform rotate-45
            `}
            />
          </motion.div>
        </div>
        {isUser && (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[9998]">
                {onEdit && <DropdownMenuItem onClick={() => onEdit(message.id)}>Edit</DropdownMenuItem>}
                {onDelete && <DropdownMenuItem onClick={() => onDelete(message.id)}>Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </motion.div>
  )
}
