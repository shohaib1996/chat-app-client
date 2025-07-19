"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-end space-x-2 max-w-[70%]">
        <Avatar className="w-8 h-8 mb-1">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          {/* <AvatarFallback className="text-xs">AC</AvatarFallback> */}
        </Avatar>
      </div>
    </motion.div>
  )
}
