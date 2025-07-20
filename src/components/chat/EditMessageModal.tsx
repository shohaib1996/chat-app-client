"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Portal } from "@/components/ui/portal"

interface EditMessageModalProps {
  isOpen: boolean
  onClose: () => void
  editedMessageContent: string
  setEditedMessageContent: (value: string) => void
  handleSaveEdit: () => void
  isPending: boolean
}

export function EditMessageModal({
  isOpen,
  onClose,
  editedMessageContent,
  setEditedMessageContent,
  handleSaveEdit,
  isPending,
}: EditMessageModalProps) {
  if (!isOpen) return null

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center"
        style={{ zIndex: 99999 }}
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl"
          style={{ zIndex: 100000 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold mb-4">Edit Message</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="messageContent">Message</Label>
              <Textarea
                id="messageContent"
                value={editedMessageContent}
                onChange={(e) => setEditedMessageContent(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isPending} className="cursor-pointer">
                {isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}