"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import type { MessageBubbleData } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Download, X } from "lucide-react"

interface MessageBubbleProps {
  message: MessageBubbleData
  onEdit?: (messageId: string) => void
  onDelete?: (messageId: string) => void
}

export function MessageBubble({ message, onEdit, onDelete }: MessageBubbleProps) {
  const [showImagePreview, setShowImagePreview] = useState(false)
  const isUser = message.sender === "user"

  const handleImageClick = () => {
    if (message.imageUrl) {
      setShowImagePreview(true)
    }
  }

  const handleDownload = async () => {
    if (!message.imageUrl) return

    try {
      const response = await fetch(message.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `image-${message.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download image:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowImagePreview(false)
    }
  }

  return (
    <>
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
              {/* Render image if present */}
              {message.imageUrl && (
                <div className="mb-2">
                  <img
                    src={message.imageUrl || "/placeholder.svg"}
                    alt="Uploaded image"
                    className="max-w-full h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleImageClick}
                  />
                </div>
              )}

              {/* Render text if present */}
              {message.content && message.content.trim() && (
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap hyphens-auto">
                  {message.content}
                </p>
              )}

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

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && message.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowImagePreview(false)}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-[90vw] max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close and download buttons */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImagePreview(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Image */}
              <div className="flex items-center justify-center">
                <img
                  src={message.imageUrl || "/placeholder.svg"}
                  alt="Full size preview"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
