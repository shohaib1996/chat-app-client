"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MessageCircle,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useChat } from "./ChatContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { authAPI, groupsAPI } from "@/lib/api";
import { useSession } from "next-auth/react";
import ContactItem from "./ContactItem";
import GroupItem from "./GroupItem";
import CreateGroupDialog from "./CreateGroupDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatContact, ChatGroup, ApiUser, ApiGroup } from "@/types";

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const {
    selectedChat,
    setSelectedChat,
    showSidebar,
    setShowSidebar,
    onlineUsers,
  } = useChat();
  const isMobile = useIsMobile();
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<ApiUser | null>(null);
  const router = useRouter();

  const { data: session } = useSession();

  useEffect(() => {
    setIsClient(true);
    if (session?.user) {
      setLoggedInUser({
        id: session.user.id as string,
        name: session.user.name as string,
        email: session.user.email as string,
        avatarUrl: session.user.image as string,
        status: session.user.status as string,
      });
    }
  }, [session]);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: authAPI.getAllUsers,
    enabled: isClient,
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsAPI.getGroups,
    enabled: isClient,
  });

  const contacts: ChatContact[] =
    (usersData as any)?.data?.data
      .filter((user: ApiUser) => user.id !== loggedInUser?.id)
      .map((user: ApiUser) => ({
        id: user.id,
        name: user.name,
        avatar: user.avatarUrl,
        status: onlineUsers.some((u) => u.userId === user.id)
          ? "online"
          : "offline",
        lastMessage: "No messages yet",
        unreadCount: 0,
        type: "user",
      })) || [];

  const groups: ChatGroup[] =
    (groupsData as any)?.data?.data.map((group: ApiGroup) => ({
      id: group.id,
      name: group.name,
      avatar: group.avatarUrl,
      memberCount: group.members?.length || 0,
      lastMessage: "No messages yet",
      unreadCount: 0,
      type: "group",
    })) || [];

  const handleChatSelect = (chat: ChatContact | ChatGroup) => {
    setSelectedChat(chat);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  if (isMobile && !showSidebar) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    router.push("/auth/signin");
    return
  };

  return (
    <motion.div
      initial={{ x: isMobile ? -100 : 0, opacity: isMobile ? 0 : 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isMobile ? -100 : 0, opacity: isMobile ? 0 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`h-full flex flex-col bg-card/30 backdrop-blur-sm ${
        isMobile ? "absolute inset-0 z-50" : "w-80"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold neo-gradient bg-clip-text text-white">
            NeoChat
          </h2>
          <Button
            size="icon"
            variant="ghost"
            className="hover:bg-primary/10 cursor-pointer"
            onClick={() => setIsCreateGroupDialogOpen(true)}
          >
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
      <div className="p-2 border-b border-border/50">
        <div className="flex">
          <Link href="/chat" className="flex-1">
            <Button
              variant={pathname === "/chat" ? "default" : "ghost"}
              className={`w-full cursor-pointer justify-start ${
                pathname === "/chat" ? "neo-gradient text-white" : ""
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chats
            </Button>
          </Link>
          <Link href="/chat/profile" className="flex-1">
            <Button
              variant={pathname === "/chat/profile" ? "default" : "ghost"}
              className={`w-full cursor-pointer justify-start ${
                pathname === "/chat/profile" ? "neo-gradient text-white" : ""
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Link href="/chat/settings" className="flex-1">
            <Button
              variant={pathname === "/chat/settings" ? "default" : "ghost"}
              className={`w-full cursor-pointer justify-start ${
                pathname === "/chat/settings" ? "neo-gradient text-white" : ""
              }`}
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
          <TabsList className="grid w-full grid-cols-2 mt-2 px-2">
            <TabsTrigger className="cursor-pointer" value="chats">
              Chats
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="groups">
              Groups
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chats" className="flex-1 mt-2 overflow-auto">
            <ScrollArea className="h-full px-2">
              <div className="space-y-2">
                {usersLoading && !isClient ? (
                  <div className="flex items-center justify-center h-32">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <AnimatePresence>
                    {contacts
                      .filter((contact) =>
                        contact.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((contact, index) => (
                        <motion.div
                          key={contact.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ContactItem
                            contact={contact}
                            onSelect={handleChatSelect}
                            selectedChatId={selectedChat?.id}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="groups" className="flex-1 mt-2 overflow-auto">
            <ScrollArea className="h-full px-2">
              <div className="space-y-2">
                {groupsLoading && !isClient ? (
                  <div className="flex items-center justify-center h-32">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <AnimatePresence>
                    {groups
                      .filter((group) =>
                        group.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((group, index) => (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <GroupItem
                            group={group}
                            onSelect={handleChatSelect}
                            selectedChatId={selectedChat?.id}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={
                  loggedInUser?.avatarUrl ||
                  "/placeholder.svg?height=40&width=40"
                }
              />
              <AvatarFallback>
                {loggedInUser?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "UN"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">
              {loggedInUser?.name || "Guest User"}
            </h4>
            <p className="text-sm text-muted-foreground">
              {onlineUsers.some((u) => u.userId === loggedInUser?.id)
                ? "Online"
                : "Offline"}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            size="icon"
            className="bg-red-400 hover:bg-red-700"
          >
            <LogOut />
          </Button>
        </div>
      </div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={isCreateGroupDialogOpen}
        onClose={() => setIsCreateGroupDialogOpen(false)}
      />
    </motion.div>
  );
}
