"use client"
import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Upload } from "lucide-react"
import { Portal } from "@/components/ui/portal"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { groupsAPI } from "@/lib/api"
import { toast } from "sonner"
import type { Group } from "@/types"

interface UpdateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  group: Group
}

export function UpdateGroupModal({ isOpen, onClose, group }: UpdateGroupModalProps) {
  const queryClient = useQueryClient()
  const [groupName, setGroupName] = useState(group.name)
  const [avatarUrl, setAvatarUrl] = useState(group.avatarUrl || "")

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: (data: { name: string; avatarUrl?: string }) => groupsAPI.updateGroup(group.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["groupMembers", group.id] })
      toast.success("Group updated successfully")
      onClose()
    },
    onError: () => {
      toast.error("Failed to update group")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) {
      toast.error("Group name is required")
      return
    }

    updateGroupMutation.mutate({
      name: groupName.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    })
  }

  const isValidUrl = (url: string) => {
    if (!url.trim()) return true // Empty URL is valid (optional field)
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isFormValid = groupName.trim() && isValidUrl(avatarUrl)
  const isSubmitDisabled = updateGroupMutation.isPending || !isFormValid

  if (!isOpen) return null

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
        style={{ zIndex: 99999 }}
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-2xl"
          style={{ zIndex: 100000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Update Group</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={avatarUrl && isValidUrl(avatarUrl) ? avatarUrl : group.avatarUrl || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-lg">
                    {groupName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "G"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Upload className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center">Group Avatar Preview</p>
            </div>

            {/* Group Name */}
            <div>
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="mt-1"
                required
              />
            </div>

            {/* Avatar URL */}
            <div>
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Enter a valid image URL for the group avatar</p>
              {avatarUrl && !isValidUrl(avatarUrl) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="cursor-pointer bg-transparent"
                disabled={updateGroupMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitDisabled} className="cursor-pointer">
                {updateGroupMutation.isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  "Update Group"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  )
}
