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
          <AvatarFallback className="text-xs">AC</AvatarFallback>
        </Avatar>

        {/* <div className="ml-2">
          <p className="text-xs text-muted-foreground mb-1 px-2">Alex Chen</p>

          <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-card border border-border/50 relative">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>


            <div className="absolute bottom-0 left-0 -translate-x-1 w-3 h-3 bg-card border-l border-b border-border/50 transform rotate-45" />
          </div>
        </div> */}
      </div>
    </motion.div>
  )
}
