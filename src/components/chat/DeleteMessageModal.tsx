"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Portal } from "@/components/ui/portal"

interface DeleteMessageModalProps {
  isOpen: boolean
  onClose: () => void
  handleConfirmDelete: () => void
  isPending: boolean
}

export function DeleteMessageModal({ isOpen, onClose, handleConfirmDelete, isPending }: DeleteMessageModalProps) {
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
          <h2 className="text-lg font-semibold mb-2">Are you absolutely sure?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            This action cannot be undone. This will permanently delete your message.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  "Continue"
                )}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  )
}