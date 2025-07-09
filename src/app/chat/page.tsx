"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { TypingIndicator } from "@/components/chat/TypingIndicator"

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: Date
  type: "text" | "image" | "file"
  senderName?: string
  senderAvatar?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hey! How are you doing?",
      sender: "other",
      timestamp: new Date(Date.now() - 300000),
      type: "text",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      content: "I'm doing great! Just working on some new features for the app.",
      sender: "user",
      timestamp: new Date(Date.now() - 240000),
      type: "text",
    },
    {
      id: "3",
      content: "That sounds exciting! Can you tell me more about it?",
      sender: "other",
      timestamp: new Date(Date.now() - 180000),
      type: "text",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40",
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate other user typing and responding
    setTimeout(() => {
      setOtherUserTyping(true)
      setTimeout(() => {
        setOtherUserTyping(false)
        const response: Message = {
          id: (Date.now() + 1).toString(),
          content: "That's really cool! I'd love to see it when it's ready.",
          sender: "other",
          timestamp: new Date(),
          type: "text",
          senderName: "Alex Chen",
          senderAvatar: "/placeholder.svg?height=40&width=40",
        }
        setMessages((prev) => [...prev, response])
      }, 2000)
    }, 1000)
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
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse-glow"></div>
            </div>
            <div>
              <h3 className="font-semibold">Alex Chen</h3>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background/80">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} isLast={index === messages.length - 1} />
          ))}
        </AnimatePresence>

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
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
