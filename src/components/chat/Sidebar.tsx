"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Settings, User, MessageCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useChat } from "./ChatContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { authAPI, groupsAPI } from "@/lib/api"
import type { ChatContact, ChatGroup, User as ApiUser, Group as ApiGroup } from "@/types"

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const { selectedChat, setSelectedChat, showSidebar, setShowSidebar } = useChat()
  const isMobile = useIsMobile()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: authAPI.getAllUsers,
    enabled: isClient, // Only fetch on the client
  })

  console.log(usersData)

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsAPI.getGroups,
    enabled: isClient, // Only fetch on the client
  })

  const contacts: ChatContact[] =
    (usersData as any)?.data?.data.map((user: ApiUser) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatarUrl,
      status: user.status || "offline",
      lastMessage: "No messages yet",
      unreadCount: 0,
      type: "user",
    })) || []

  const groups: ChatGroup[] =
    (groupsData as any)?.data?.data.map((group: ApiGroup) => ({
      id: group.id,
      name: group.name,
      avatar: group.avatarUrl,
      memberCount: group.members?.length || 0,
      lastMessage: "No messages yet",
      unreadCount: 0,
      type: "group",
    })) || []

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

  const handleChatSelect = (chat: ChatContact | ChatGroup) => {
    setSelectedChat(chat)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const ContactItem = ({ contact }: { contact: ChatContact }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        selectedChat?.id === contact.id ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50"
      }`}
      onClick={() => handleChatSelect(contact)}
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
            className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
              contact.status || "offline",
            )} rounded-full border-2 border-background ${contact.status === "online" ? "animate-pulse-glow" : ""}`}
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

  const GroupItem = ({ group }: { group: ChatGroup }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        selectedChat?.id === group.id ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50"
      }`}
      onClick={() => handleChatSelect(group)}
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
            {group.lastMessage || "No messages yet"} • {group.memberCount} members
          </p>
        </div>
      </div>
    </motion.div>
  )

  // Mobile: Hide sidebar when chat is selected
  if (isMobile && !showSidebar) {
    return null
  }

  return (
    <motion.div
      initial={{ x: isMobile ? -100 : 0, opacity: isMobile ? 0 : 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isMobile ? -100 : 0, opacity: isMobile ? 0 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`h-full flex flex-col bg-card/30 backdrop-blur-sm ${isMobile ? "absolute inset-0 z-50" : ""}`}
    >
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
              {usersLoading && !isClient ? (
                <div className="flex items-center justify-center h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : (
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
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="groups" className="flex-1 mt-2">
            <ScrollArea className="h-full px-2">
              {groupsLoading && !isClient ? (
                <div className="flex items-center justify-center h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : (
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
              )}
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
    </motion.div>
  )
}