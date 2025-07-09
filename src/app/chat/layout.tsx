"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/chat/Sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChatProvider } from "@/components/chat/ChatContext"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ChatProvider>
      <div className="h-screen flex bg-background overflow-hidden">
        {/* Desktop Layout */}
        {!isMobile && (
          <>
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-80 border-r border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <Sidebar />
            </motion.div>

            <div className="flex-1 flex flex-col">
              <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center justify-end px-6"
              >
                <ThemeToggle />
              </motion.header>

              <AnimatePresence mode="wait">
                <motion.main
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 overflow-hidden"
                >
                  {children}
                </motion.main>
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <div className="flex-1 relative">
            <Sidebar />
            <AnimatePresence mode="wait">
              <motion.main
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>
        )}
      </div>
    </ChatProvider>
  )
}
