"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/chat/Sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="h-screen flex bg-background">
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
    </div>
  )
}
