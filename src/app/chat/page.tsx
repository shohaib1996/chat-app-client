"use client"

import React from "react"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageArea } from "@/components/chat/MessageArea"
import { MessageInput } from "@/components/chat/MessageInput"
import { EditMessageModal } from "@/components/chat/EditMessageModal"
import { DeleteMessageModal } from "@/components/chat/DeleteMessageModal"
import { useChatLogic } from "@/hooks/useChatHooks"
import { MessageCircle } from "lucide-react"
import { useChat } from "@/components/chat/ChatContext"

export default function ChatPage() {
  const { selectedChat } = useChat()
  const {
    newMessage,
    setNewMessage,
    selectedImage,
    setSelectedImage,
    imagePreview,
    setImagePreview,
    isUploading,
    messages,
    isLoading,
    typingUsers,
    userMap,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editedMessageContent,
    setEditedMessageContent,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isUserOnline,
    handleBackToSidebar,
    handleFileSelect,
    handleRemoveImage,
    handleSendMessage,
    handleTyping,
    handleEditMessage,
    handleSaveEdit,
    handleDeleteMessage,
    handleConfirmDelete,
    convertToMessageBubbleData,
    editMessageMutation,
    deleteMessageMutation,
  } = useChatLogic()

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-background to-background/50">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full neo-gradient flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a contact or group to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ChatHeader onBack={handleBackToSidebar} isUserOnline={isUserOnline} />
      <MessageArea
        messages={messages}
        isLoading={isLoading}
        typingUsers={typingUsers}
        userMap={userMap}
        convertToMessageBubbleData={convertToMessageBubbleData}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
      />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        isUploading={isUploading}
        handleSendMessage={handleSendMessage}
        handleTyping={handleTyping}
        handleFileSelect={handleFileSelect}
        handleRemoveImage={handleRemoveImage}
      />
      <EditMessageModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editedMessageContent={editedMessageContent}
        setEditedMessageContent={setEditedMessageContent}
        handleSaveEdit={handleSaveEdit}
        isPending={editMessageMutation.isPending}
      />
      <DeleteMessageModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        handleConfirmDelete={handleConfirmDelete}
        isPending={deleteMessageMutation.isPending}
      />
    </div>
  )
}