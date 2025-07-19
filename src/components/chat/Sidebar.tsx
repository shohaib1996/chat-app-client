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
import { Search, Plus, Settings, User, MessageCircle, X, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCreateGroup, useSearch } from "@/lib/queries"
import type { ChatContact, ChatGroup, User as ApiUser, Group as ApiGroup } from "@/types"
import { useChat } from "./ChatContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { authAPI, groupsAPI } from "@/lib/api"
import { decodeJwt } from 'jose';
import { useSession } from "next-auth/react"

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const { selectedChat, setSelectedChat, showSidebar, setShowSidebar } = useChat()
  const isMobile = useIsMobile()
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupAvatarUrl, setNewGroupAvatarUrl] = useState("")
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<ApiUser[]>([])
  const [showMemberSearch, setShowMemberSearch] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [loggedInUser, setLoggedInUser] = useState<ApiUser | null>(null);

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
  })

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsAPI.getGroups,
    enabled: isClient,
  })

  const { data: searchResults, isLoading: searchLoading } = useSearch(memberSearchQuery, "user")

  const defaultUsers = (usersData?.data as any)?.data.slice(0, 5) || []

  const createGroupMutation = useCreateGroup()

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
    console.log("handleChatSelect called with:", chat);
    setSelectedChat(chat)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const handleMemberSelect = (user: ApiUser) => {
    const isSelected = selectedMembers.some((member) => member.id === user.id)
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter((member) => member.id !== user.id))
    } else {
      setSelectedMembers([...selectedMembers, user])
    }
    setValidationError("")
  }

  const handleCreateGroup = () => {
    if (newGroupName.trim() === "") {
      setValidationError("Group name cannot be empty.")
      return
    }

    if (selectedMembers.length < 2) {
      setValidationError("Please select at least 2 members to create a group.")
      return
    }

    const memberIds = selectedMembers.map((member) => member.id)

    createGroupMutation.mutate(
      {
        name: newGroupName,
        avatarUrl: newGroupAvatarUrl || undefined,
        memberIds,
      },
      {
        onSuccess: () => {
          setIsCreateGroupDialogOpen(false)
          setNewGroupName("")
          setNewGroupAvatarUrl("")
          setSelectedMembers([])
          setMemberSearchQuery("")
          setValidationError("")
          setShowMemberSearch(false)
        },
        onError: (error) => {
          console.error("Failed to create group:", error)
          setValidationError("Failed to create group. Please try again.")
        },
      },
    )
  }

  const handleDialogClose = () => {
    setIsCreateGroupDialogOpen(false)
    setNewGroupName("")
    setNewGroupAvatarUrl("")
    setSelectedMembers([])
    setMemberSearchQuery("")
    setValidationError("")
    setShowMemberSearch(false)
  }

  const displayUsers = memberSearchQuery ? (searchResults as any)?.data || [] : defaultUsers
  const shouldShowUsers = showMemberSearch && (memberSearchQuery || defaultUsers.length > 0)

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

  const MemberItem = ({ user, isSelected }: { user: ApiUser; isSelected: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
        isSelected ? "bg-primary/10 border-primary/50" : "hover:bg-accent/50 border-transparent"
      }`}
      onClick={() => handleMemberSelect(user)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {isSelected && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-2 h-2" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{user.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
    </motion.div>
  )

  if (isMobile && !showSidebar) {
    return null
  }

  return (
    <motion.div
      initial={{ x: isMobile ? -100 : 0, opacity: isMobile ? 0 : 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isMobile ? -100 : 0, opacity: isMobile ? 0 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`h-full flex flex-col bg-card/30 backdrop-blur-sm ${isMobile ? "absolute inset-0 z-50" : "w-80"}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold neo-gradient bg-clip-text text-white">NeoChat</h2>
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
              className={`w-full cursor-pointer justify-start ${pathname === "/chat" ? "neo-gradient text-white" : ""}`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chats
            </Button>
          </Link>
          <Link href="/chat/profile" className="flex-1">
            <Button
              variant={pathname === "/chat/profile" ? "default" : "ghost"}
              className={`w-full cursor-pointer justify-start ${pathname === "/chat/profile" ? "neo-gradient text-white" : ""}`}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Link href="/chat/settings" className="flex-1">
            <Button
              variant={pathname === "/chat/settings" ? "default" : "ghost"}
              className={`w-full cursor-pointer justify-start ${pathname === "/chat/settings" ? "neo-gradient text-white" : ""}`}
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
          <TabsContent value="chats" className="flex-1 mt-2">
            <ScrollArea className="h-full px-2">
              <div className="space-y-2">
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
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="groups" className="flex-1 mt-2">
            <ScrollArea className="h-full px-2">
              <div className="space-y-2">
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
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={loggedInUser?.avatarUrl || "/placeholder.svg?height=40&width=40"} />
              <AvatarFallback>{loggedInUser?.name?.split(" ").map(n => n[0]).join("") || "UN"}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(loggedInUser?.status || "offline")} rounded-full border-2 border-background ${loggedInUser?.status === "online" ? "animate-pulse-glow" : ""}`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{loggedInUser?.name || "Guest User"}</h4>
            <p className="text-sm text-muted-foreground">{loggedInUser?.status || "Offline"}</p>
          </div>
        </div>
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 flex-1 overflow-hidden">
            <div className="grid gap-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="groupAvatar">Avatar URL (Optional)</Label>
              <Input
                id="groupAvatar"
                value={newGroupAvatarUrl}
                onChange={(e) => setNewGroupAvatarUrl(e.target.value)}
                placeholder="Enter avatar URL"
              />
            </div>

            {/* Member Search */}
            <div className="grid gap-2 flex-1 overflow-hidden">
              <Label htmlFor="memberSearch">Add Members</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="memberSearch"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  onFocus={() => setShowMemberSearch(true)}
                  placeholder="Search members..."
                  className="pl-10"
                />
              </div>

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-accent/20 rounded-lg">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                    >
                      <span>{member.name}</span>
                      <button
                        onClick={() => handleMemberSelect(member)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Member Search Results */}
              {shouldShowUsers && (
                <div className="border rounded-lg max-h-48 overflow-hidden flex flex-col">
                  <div className="p-2 bg-accent/10 border-b text-sm font-medium">
                    {memberSearchQuery ? `Search results for "${memberSearchQuery}"` : "Suggested members"}
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {searchLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                          />
                        </div>
                      ) : displayUsers.length > 0 ? (
                        displayUsers.map((user: any) => (
                          <MemberItem
                            key={user.id}
                            user={user}
                            isSelected={selectedMembers.some((member) => member.id === user.id)}
                          />
                        ))
                      ) : (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          {memberSearchQuery ? "No users found" : "No members available"}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{validationError}</div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateGroup} disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}