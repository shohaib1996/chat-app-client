"use client"

import React, { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageBubble } from "@/components/chat/MessageBubble"
import type { Message, MessageBubbleData } from "@/types"

interface MessageAreaProps {
  messages: Message[]
  isLoading: boolean
  typingUsers: Set<string>
  userMap: Map<string, string>
  convertToMessageBubbleData: (message: Message) => MessageBubbleData
  onEdit: (messageId: string) => void
  onDelete: (messageId: string) => void
}

export function MessageArea({
  messages,
  isLoading,
  typingUsers,
  userMap,
  convertToMessageBubbleData,
  onEdit,
  onDelete,
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background/80">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={convertToMessageBubbleData(message)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          {typingUsers.size > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              {Array.from(typingUsers)
                .map((userId) => userMap.get(userId) || "Someone")
                .join(", ") + " is typing..."}
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}