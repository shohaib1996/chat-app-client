"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MoreVertical, Users, Edit, Trash2 } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useChat } from "@/components/chat/ChatContext"
import { useQuery } from "@tanstack/react-query"
import { groupMembersAPI } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { GroupInfoModal } from "./GroupInfoModal"
import { UpdateGroupModal } from "./UpdateGroupModal"
import { DeleteGroupModal } from "./DeleteGroupModal"

interface ChatHeaderProps {
  onBack: () => void
  isUserOnline: boolean
}

export function ChatHeader({ onBack, isUserOnline }: ChatHeaderProps) {
  const { selectedChat } = useChat()
  const isMobile = useIsMobile()
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [showUpdateGroup, setShowUpdateGroup] = useState(false)
  const [showDeleteGroup, setShowDeleteGroup] = useState(false)

  // Fetch group members count for groups
  const { data: groupMembersData } = useQuery({
    queryKey: ["groupMembers", selectedChat?.id],
    queryFn: () => groupMembersAPI.getGroupMembers(selectedChat!.id),
    enabled: selectedChat?.type === "group" && !!selectedChat?.id,
  })

  const memberCount = (groupMembersData?.data as any)?.data?.length || 0

  if (!selectedChat) return null

  const isGroup = selectedChat.type === "group"

  // Convert ChatGroup to Group format for UpdateGroupModal
  const groupForUpdate = isGroup
    ? {
        id: selectedChat.id,
        name: selectedChat.name,
        avatar: selectedChat.avatar,
        type: "group" as const,
        memberCount: memberCount,
        createdAt: new Date(), // Add default createdAt since it's required
        description: undefined, // Add description field if needed
      }
    : null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedChat.avatar || "/placeholder.svg?height=40&width=40"} />
                <AvatarFallback>
                  {selectedChat.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "?"}
                </AvatarFallback>
              </Avatar>
              {selectedChat.type === "user" && isUserOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse-glow"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{selectedChat.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedChat.type === "user"
                  ? isUserOnline
                    ? "Online"
                    : "Offline"
                  : `${memberCount} ${memberCount === 1 ? "member" : "members"}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isGroup ? (
                  <>
                    <DropdownMenuItem onClick={() => setShowGroupInfo(true)} className="cursor-pointer">
                      <Users className="w-4 h-4 mr-2" />
                      Group Info
                      <span className="ml-auto text-xs text-muted-foreground">({memberCount})</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowUpdateGroup(true)} className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Update Group
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteGroup(true)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Group
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="cursor-pointer">
                      <Users className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Block User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      {isGroup && groupForUpdate && (
        <>
          <GroupInfoModal isOpen={showGroupInfo} onClose={() => setShowGroupInfo(false)} groupId={selectedChat.id} />
          <UpdateGroupModal isOpen={showUpdateGroup} onClose={() => setShowUpdateGroup(false)} group={groupForUpdate} />
          <DeleteGroupModal
            isOpen={showDeleteGroup}
            onClose={() => setShowDeleteGroup(false)}
            groupId={selectedChat.id}
            groupName={selectedChat.name}
          />
        </>
      )}
    </>
  )
}
