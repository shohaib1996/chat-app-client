import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useChat } from "@/components/chat/ChatContext"
import { useSocket } from "@/components/socket/SocketContext"
import { useQuery } from "@tanstack/react-query"
import { useMessages, useCreateMessage, useEditMessage, useDeleteMessage } from "@/lib/queries"
import { authAPI, uploadAPI } from "@/lib/api"
import type { Message, MessageBubbleData, ChatContextType } from "@/types"

interface User {
  id: string
  name: string
}

export function useChatLogic() {
  const { selectedChat, setShowSidebar, typingUsers, onlineUsers } = useChat() as ChatContextType
  const { socket } = useSocket()
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [editedMessageContent, setEditedMessageContent] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch user data
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: authAPI.getAllUsers,
  })
  const userMap = new Map<string, string>(
    (usersData as any)?.data?.data?.map((user: User) => [user.id, user.name]) || []
  )

  // Fetch messages
  const { data: messagesData, isLoading } = useMessages(
    currentUserId,
    selectedChat?.type === "user" ? selectedChat.id : undefined,
    selectedChat?.type === "group" ? selectedChat.id : undefined,
  )
  const messages: Message[] = (messagesData as any)?.data || []

  const createMessageMutation = useCreateMessage()
  const editMessageMutation = useEditMessage()
  const deleteMessageMutation = useDeleteMessage()

  // Socket room management
  useEffect(() => {
    if (!socket || !selectedChat) return

    const roomId = selectedChat.id
    socket.emit("joinRoom", roomId)
    return () => {
      socket.emit("leaveRoom", roomId)
    }
  }, [socket, selectedChat])

  const handleBackToSidebar = () => setShowSidebar(true)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    } else if (file) {
      alert("Please select an image file")
    }
    e.target.value = ""
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("image", file)
    try {
      const response = await uploadAPI.uploadImage(formData)
      return (response.data as any).data.url
    } catch (error) {
      console.error("Failed to upload image:", error)
      throw error
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedImage) || !selectedChat || !socket) return

    try {
      setIsUploading(true)
      let photoUrl = ""
      if (selectedImage) {
        photoUrl = await uploadImage(selectedImage)
      }

      const messageData = {
        text: newMessage.trim() || undefined,
        photoUrl: photoUrl || undefined,
        senderId: currentUserId,
        ...(selectedChat.type === "user" ? { receiverId: selectedChat.id } : { groupId: selectedChat.id }),
      }

      socket.emit("sendMessage", messageData)
      setNewMessage("")
      handleRemoveImage()

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTyping) {
        setIsTyping(false)
        socket.emit("stopTyping", selectedChat.id)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)
    if (!socket || !selectedChat) return

    const roomId = selectedChat.id
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (value.length > 0 && !isTyping) {
      setIsTyping(true)
      socket.emit("typing", roomId)
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false)
      socket.emit("stopTyping", roomId)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        socket.emit("stopTyping", roomId)
      }
    }, 2000)
  }

  const handleEditMessage = (messageId: string) => {
    const messageToEdit = messages.find((m) => m.id === messageId)
    if (messageToEdit) {
      setEditingMessage(messageToEdit)
      setEditedMessageContent(messageToEdit.text || "")
      setIsEditDialogOpen(true)
    }
  }

  const handleSaveEdit = () => {
    if (editingMessage && editedMessageContent.trim() !== "") {
      editMessageMutation.mutate(
        { id: editingMessage.id, data: { text: editedMessageContent } },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false)
            setEditingMessage(null)
            setEditedMessageContent("")
          },
        },
      )
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (messageToDelete) {
      deleteMessageMutation.mutate(messageToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setMessageToDelete(null)
        },
      })
    }
  }

  const convertToMessageBubbleData = (message: Message): MessageBubbleData => {
    let messageType: "text" | "image" | "file" | "audio" = "text"
    if (message.photoUrl) messageType = "image"
    else if (message.fileUrl) messageType = "file"
    else if (message.audioUrl) messageType = "audio"

    return {
      id: message.id,
      content: message.text || "",
      sender: message.senderId === currentUserId ? "user" : "other",
      timestamp: new Date(message.createdAt),
      type: messageType,
      senderName: message.sender?.name || selectedChat?.name,
      senderAvatar: message.sender?.avatarUrl || selectedChat?.avatar,
      imageUrl: message.photoUrl,
    }
  }

  return {
    newMessage,
    setNewMessage,
    selectedImage,
    setSelectedImage,
    imagePreview,
    setImagePreview,
    isUploading,
    messages,
    isLoading,
    typingUsers: selectedChat ? typingUsers.get(selectedChat.id) || new Set<string>() : new Set<string>(),
    userMap,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingMessage,
    editedMessageContent,
    setEditedMessageContent,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    messageToDelete,
    isUserOnline: selectedChat?.type === "user" && onlineUsers.some((u) => u.userId === selectedChat.id),
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
    createMessageMutation,
    editMessageMutation,
    deleteMessageMutation,
  }
}