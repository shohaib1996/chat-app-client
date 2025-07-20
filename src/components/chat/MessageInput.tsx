"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, Smile, X } from "lucide-react"
import Image from "next/image"

interface MessageInputProps {
  newMessage: string
  setNewMessage: React.Dispatch<React.SetStateAction<string>>
  selectedImage: File | null
  setSelectedImage: (file: File | null) => void
  imagePreview: string | null
  setImagePreview: (url: string | null) => void
  isUploading: boolean
  handleSendMessage: (e: React.FormEvent) => void
  handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveImage: () => void
}

export function MessageInput({
  newMessage,
  setNewMessage,
  selectedImage,
  setSelectedImage,
  imagePreview,
  setImagePreview,
  isUploading,
  handleSendMessage,
  handleTyping,
  handleFileSelect,
  handleRemoveImage,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

   const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
    "😈",
    "👿",
    "👹",
    "👺",
    "🤡",
    "💩",
    "👻",
    "💀",
    "☠️",
    "👽",
    "👾",
    "🤖",
    "🎃",
    "😺",
    "😸",
    "😹",
    "😻",
    "😼",
    "😽",
    "🙀",
    "😿",
    "😾",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "👍",
    "👎",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "🤝",
    "👐",
    "🤲",
    "🤜",
    "🤛",
    "✊",
    "👊",
  ];

  const handleFileInputClick = () => {
    fileInputRef.current?.click()
  }

  const addEmoji = (emoji: string) => {
    setNewMessage((prev: string) => prev + emoji)
    setShowEmojiPicker(false)
  }

  return (
    <>
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-border/50 bg-card/20"
        >
          <div className="relative inline-block">
            <Image
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="max-w-32 max-h-32 rounded-lg object-cover border-2 border-border/50"
              width={128}
              height={128}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10"
            onClick={handleFileInputClick}
            disabled={isUploading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative emoji-picker-container">
            <Input
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="pr-12 bg-background/50 border-border/50 focus:border-primary/50"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-primary/10"
              disabled={isUploading}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute right-1 bottom-full mb-2 bg-white dark:bg-gray-800 border border-border rounded-lg p-3 shadow-lg z-50 grid grid-cols-8 gap-1 max-w-64 max-h-64 overflow-y-auto">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg transition-colors"
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            className="neo-gradient hover:opacity-90 text-white"
            disabled={(!newMessage.trim() && !selectedImage) || isUploading}
          >
            {isUploading ? (
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
    </>
  )
}