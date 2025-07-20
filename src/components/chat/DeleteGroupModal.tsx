"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Portal } from "@/components/ui/portal"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { groupsAPI } from "@/lib/api"
import { toast } from "sonner"
import { useChat } from "@/components/chat/ChatContext"

interface DeleteGroupModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  groupName: string
}

export function DeleteGroupModal({ isOpen, onClose, groupId, groupName }: DeleteGroupModalProps) {
  const queryClient = useQueryClient()
  const { setSelectedChat } = useChat()

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: () => groupsAPI.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      setSelectedChat(null) // Clear selected chat
      toast.success("Group deleted successfully")
      onClose()
    },
    onError: () => {
      toast.error("Failed to delete group")
    },
  })

  const handleDelete = () => {
    deleteGroupMutation.mutate()
  }

  if (!isOpen) return null

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center"
        style={{ zIndex: 99999 }}
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 shadow-2xl"
          style={{ zIndex: 100000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-red-600">Delete Group</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Are you sure you want to delete the group <strong>"{groupName}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All messages and group data will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose} className="cursor-pointer bg-transparent">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteGroupMutation.isPending}
                className="cursor-pointer"
              >
                {deleteGroupMutation.isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  "Delete Group"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
