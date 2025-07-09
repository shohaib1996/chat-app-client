"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen neo-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-pink-400/20 to-purple-600/20 animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-400/20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            Neo<span className="text-pink-300">Chat</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Experience the future of communication with our next-generation messaging platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white neo-glow">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: MessageCircle, title: "Instant Messaging", desc: "Real-time communication with advanced features" },
            { icon: Users, title: "Group Chats", desc: "Create and manage group conversations effortlessly" },
            { icon: Shield, title: "Secure & Private", desc: "End-to-end encryption for all your messages" },
            { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed and performance" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="glass-effect border-white/20 hover:border-pink-400/50 transition-all duration-300">
                <CardHeader className="text-center">
                  <feature.icon className="w-12 h-12 mx-auto text-pink-400 mb-4" />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70 text-center">{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <Card className="glass-effect border-white/20 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Ready to experience the future?</CardTitle>
              <CardDescription className="text-white/70">
                Join thousands of users already using NeoChat for their daily communication needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/signup">
                <Button size="lg" className="neo-gradient hover:opacity-90 text-white font-semibold px-8">
                  Start Chatting Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
