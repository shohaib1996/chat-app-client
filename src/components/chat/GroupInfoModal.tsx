"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Crown, UserMinus, X, UserPlus, Search } from "lucide-react"
import { Portal } from "@/components/ui/portal"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { groupMembersAPI, authAPI } from "@/lib/api"
import { toast } from "sonner"
import type { GroupMember, User } from "@/types"

interface GroupInfoModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
}

export function GroupInfoModal({ isOpen, onClose, groupId }: GroupInfoModalProps) {
  const queryClient = useQueryClient()
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addingUserId, setAddingUserId] = useState<string | null>(null)

  // Fetch group members
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => groupMembersAPI.getGroupMembers(groupId),
    enabled: isOpen && !!groupId,
  })

  const members: GroupMember[] = (membersData?.data as any)?.data || []

  // Search users
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await authAPI.search(query, "user")
      // Filter out users who are already members
      const memberUserIds = members.map((member) => member.userId)
      const filteredResults = (response.data as any).data.filter((user: User) => !memberUserIds.includes(user.id))
      setSearchResults(filteredResults)
    } catch (error) {
      toast.error("Failed to search users")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: { userId: string; groupId: string; isAdmin: boolean }) => groupMembersAPI.addGroupMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] })
      toast.success("Member added successfully")
      setAddingUserId(null)
      setSearchQuery("")
      setSearchResults([])
    },
    onError: () => {
      toast.error("Failed to add member")
      setAddingUserId(null)
    },
  })

  // Update member role mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, isAdmin }: { memberId: string; isAdmin: boolean }) =>
      groupMembersAPI.updateGroupMember(memberId, { isAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] })
      toast.success("Member role updated successfully")
      setLoadingMemberId(null)
    },
    onError: () => {
      toast.error("Failed to update member role")
      setLoadingMemberId(null)
    },
  })

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => groupMembersAPI.deleteGroupMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] })
      toast.success("Member removed successfully")
      setLoadingMemberId(null)
    },
    onError: () => {
      toast.error("Failed to remove member")
      setLoadingMemberId(null)
    },
  })

  const handleToggleAdmin = (member: GroupMember) => {
    setLoadingMemberId(member.id)
    const newIsAdmin = !member.isAdmin
    updateMemberMutation.mutate({ memberId: member.id, isAdmin: newIsAdmin })
  }

  const handleRemoveMember = (member: GroupMember) => {
    setLoadingMemberId(member.id)
    removeMemberMutation.mutate(member.id)
  }

  const handleAddMember = (user: User) => {
    setAddingUserId(user.id)
    addMemberMutation.mutate({
      userId: user.id,
      groupId: groupId,
      isAdmin: false,
    })
  }

  if (!isOpen) return null

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
        style={{ zIndex: 99999 }}
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          style={{ zIndex: 100000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Group Members</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add Member</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Add Member Section */}
          {showAddMember && (
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users to add..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      handleSearch(e.target.value)
                    }}
                    className="pl-10"
                  />
                </div>

                {/* Search Results */}
                {searchQuery && (
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                        />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                    ) : (
                      searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {user.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddMember(user)}
                            disabled={addingUserId === user.id}
                            className="cursor-pointer"
                          >
                            {addingUserId === user.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                              />
                            ) : (
                              "Add"
                            )}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No members found</div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 space-y-3 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={member.user?.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{member.user?.name || "Unknown User"}</p>
                        <p className="text-sm text-gray-500 truncate">{member.user?.email || ""}</p>
                      </div>
                      {member.isAdmin && (
                        <Badge variant="secondary" className="flex-shrink-0">
                          <Crown className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Admin</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant={member.isAdmin ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleAdmin(member)}
                        disabled={loadingMemberId === member.id}
                        className="cursor-pointer text-xs sm:text-sm"
                      >
                        {loadingMemberId === member.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{member.isAdmin ? "Remove Admin" : "Make Admin"}</span>
                            <span className="sm:hidden">{member.isAdmin ? "Remove" : "Admin"}</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member)}
                        disabled={loadingMemberId === member.id}
                        className="cursor-pointer"
                      >
                        {loadingMemberId === member.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                          />
                        ) : (
                          <UserMinus className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  )
}
