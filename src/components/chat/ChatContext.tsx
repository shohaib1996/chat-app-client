"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface ChatContextType {
  selectedChat: {
    id: string
    name: string
    type: "user" | "group"
    avatar?: string
    status?: string
    memberCount?: number
  } | null
  setSelectedChat: (chat: ChatContextType["selectedChat"]) => void
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedChat, setSelectedChat] = useState<ChatContextType["selectedChat"]>(null)
  const [showSidebar, setShowSidebar] = useState(true)

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        showSidebar,
        setShowSidebar,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
