"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Settings, User, MessageCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface Contact {
  id: string
  name: string
  avatar: string
  status: "online" | "offline" | "away"
  lastMessage?: string
  lastSeen?: string
  unreadCount?: number
}

interface Group {
  id: string
  name: string
  avatar: string
  memberCount: number
  lastMessage?: string
  unreadCount?: number
}

const contacts: Contact[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastMessage: "That sounds exciting! Can you tell me more?",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    lastMessage: "See you tomorrow!",
    lastSeen: "2 hours ago",
  },
  {
    id: "3",
    name: "Mike Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    lastMessage: "Thanks for the help",
    lastSeen: "1 day ago",
  },
  {
    id: "4",
    name: "Emma Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastMessage: "Perfect! Let's do it",
    unreadCount: 1,
  },
]

const groups: Group[] = [
  {
    id: "1",
    name: "Design Team",
    avatar: "/placeholder.svg?height=40&width=40",
    memberCount: 8,
    lastMessage: "New mockups are ready for review",
    unreadCount: 5,
  },
  {
    id: "2",
    name: "Project Alpha",
    avatar: "/placeholder.svg?height=40&width=40",
    memberCount: 12,
    lastMessage: "Meeting at 3 PM today",
  },
  {
    id: "3",
    name: "Random Chat",
    avatar: "/placeholder.svg?height=40&width=40",
    memberCount: 25,
    lastMessage: "Anyone up for lunch?",
    unreadCount: 3,
  },
]

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const ContactItem = ({ contact }: { contact: Contact }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={contact.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {contact.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(contact.status)} rounded-full border-2 border-background ${contact.status === "online" ? "animate-pulse-glow" : ""}`}
          ></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium truncate">{contact.name}</h4>
            {contact.unreadCount && <Badge className="neo-gradient text-white text-xs">{contact.unreadCount}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {contact.lastMessage || `Last seen ${contact.lastSeen}`}
          </p>
        </div>
      </div>
    </motion.div>
  )

  const GroupItem = ({ group }: { group: Group }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={group.avatar || "/placeholder.svg"} />
          <AvatarFallback>
            {group.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium truncate">{group.name}</h4>
            {group.unreadCount && <Badge className="neo-gradient text-white text-xs">{group.unreadCount}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {group.lastMessage} • {group.memberCount} members
          </p>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="h-full flex flex-col bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold neo-gradient bg-clip-text text-transparent">NeoChat</h2>
          <Button size="icon" variant="ghost" className="hover:bg-primary/10">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-border/50">
        <div className="flex space-x-1">
          <Link href="/chat" className="flex-1">
            <Button
              variant={pathname === "/chat" ? "default" : "ghost"}
              className={`w-full justify-start ${pathname === "/chat" ? "neo-gradient text-white" : ""}`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chats
            </Button>
          </Link>
          <Link href="/chat/profile" className="flex-1">
            <Button
              variant={pathname === "/chat/profile" ? "default" : "ghost"}
              className={`w-full justify-start ${pathname === "/chat/profile" ? "neo-gradient text-white" : ""}`}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Link href="/chat/settings" className="flex-1">
            <Button
              variant={pathname === "/chat/settings" ? "default" : "ghost"}
              className={`w-full justify-start ${pathname === "/chat/settings" ? "neo-gradient text-white" : ""}`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="chats" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="flex-1 mt-2">
            <ScrollArea className="h-full px-2">
              <AnimatePresence>
                {contacts
                  .filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ContactItem contact={contact} />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="groups" className="flex-1 mt-2">
            <ScrollArea className="h-full px-2">
              <AnimatePresence>
                {groups
                  .filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((group, index) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GroupItem group={group} />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse-glow"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">John Doe</h4>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}
