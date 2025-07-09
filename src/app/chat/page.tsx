"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, Paperclip, Smile, MoreVertical } from "lucide-react"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { TypingIndicator } from "@/components/chat/TypingIndicator"
import { useChat } from "@/components/chat/ChatContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { useMessages, useCreateMessage } from "@/lib/queries"
import { MessageCircle } from "lucide-react"
import type { MessageBubbleData } from "@/types"

interface Message {
  id: string;
  text?: string;
  fileUrl?: string;
  photoUrl?: string;
  audioUrl?: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  seen: boolean;
  createdAt: Date;
  sender?: {
    name?: string;
    avatarUrl?: string;
  };
  receiver?: {
    name?: string;
    avatarUrl?: string;
  };
  group?: {
    name?: string;
    avatarUrl?: string;
  };
}

export default function ChatPage() {
  const { selectedChat, setShowSidebar } = useChat()
  const isMobile = useIsMobile()
  const [newMessage, setNewMessage] = useState("")
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock user ID - replace with actual auth
  const currentUserId = "current-user-id"

  // Use React Query for messages
  const { data: messages = [], isLoading } = useMessages(
    currentUserId,
    selectedChat?.type === "user" ? selectedChat.id : undefined,
    selectedChat?.type === "group" ? selectedChat.id : undefined,
  )

  const createMessageMutation = useCreateMessage()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    try {
      const messageData = {
        text: newMessage,
        senderId: currentUserId,
        ...(selectedChat.type === "user" ? { receiverId: selectedChat.id } : { groupId: selectedChat.id }),
      }

      await createMessageMutation.mutateAsync(messageData)
      setNewMessage("")

      // Simulate other user typing
      setTimeout(() => {
        setOtherUserTyping(true)
        setTimeout(() => {
          setOtherUserTyping(false)
        }, 2000)
      }, 1000)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleBackToSidebar = () => {
    setShowSidebar(true)
  }

  // Convert Message to MessageBubbleData
  const convertToMessageBubbleData = (message: Message): MessageBubbleData => ({
    id: message.id,
    content: message.text || "",
    sender: message.senderId === currentUserId ? "user" : "other",
    timestamp: new Date(message.createdAt),
    type: message.photoUrl ? "image" : message.fileUrl ? "file" : message.audioUrl ? "audio" : "text",
    senderName: message.sender?.name || selectedChat?.name,
    senderAvatar: message.sender?.avatarUrl || selectedChat?.avatar,
  })

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-background to-background/50">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full neo-gradient flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a contact or group to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={handleBackToSidebar} className="hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedChat.avatar || "/placeholder.svg?height=40&width=40"} />
                <AvatarFallback>
                  {selectedChat.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {selectedChat.type === "user" && selectedChat.status === "online" && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse-glow"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{selectedChat.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedChat.type === "user"
                  ? selectedChat.status || "Offline"
                  : `${selectedChat.memberCount || 0} members`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
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
            {messages.map((message: Message) => (
              <MessageBubble
                key={message.id}
                message={convertToMessageBubbleData(message)}
              />
            ))}
          </AnimatePresence>
        )}

        {otherUserTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-12 bg-background/50 border-border/50 focus:border-primary/50"
              disabled={createMessageMutation.isPending}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-primary/10"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button
            type="submit"
            size="icon"
            className="neo-gradient hover:opacity-90 text-white"
            disabled={!newMessage.trim() || createMessageMutation.isPending}
          >
            {createMessageMutation.isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
