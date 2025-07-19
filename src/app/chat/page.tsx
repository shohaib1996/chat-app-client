"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Paperclip, Smile, MoreVertical } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMessages, useCreateMessage, useEditMessage, useDeleteMessage } from "@/lib/queries";
import { MessageCircle } from "lucide-react";
import type { MessageBubbleData } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Portal } from "@/components/ui/portal";
import { useSession } from "next-auth/react";
import { useChat } from "@/components/chat/ChatContext";
import { useSocket } from "@/components/socket/SocketContext";
import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";

interface Message {
  id: string;
  text?: string;
  fileUrl?: string;
  photoUrl?: string;
  audioUrl?: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  seen: boolean;
  createdAt: Date;
  sender?: {
    name?: string;
    avatarUrl?: string;
  };
  receiver?: {
    name?: string;
    avatarUrl?: string;
  };
  group?: {
    name?: string;
    avatarUrl?: string;
  };
}

export default function ChatPage() {
  console.log("ChatPage component rendering.");
  const { selectedChat, setShowSidebar, typingUsers, onlineUsers } = useChat();
  const { socket } = useSocket();
  const isMobile = useIsMobile();
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedMessageContent, setEditedMessageContent] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Fetch user data to map userId to names
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: authAPI.getAllUsers,
  });
  const userMap = new Map(
    (usersData as any)?.data?.data.map((user: any) => [user.id, user.name]) || []
  );
  console.log('usersData:', usersData);
  console.log('userMap:', Array.from(userMap.entries()));

  useEffect(() => {
    console.log("ChatPage - selectedChat (from useChat):", selectedChat);
  }, [selectedChat]);

  // Join/leave chat room
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const roomId = selectedChat.id; // Match backend's room
    console.log('Joining room:', roomId); // Debug log
    socket.emit("joinRoom", roomId);

    return () => {
      console.log('Leaving room:', roomId); // Debug log
      socket.emit("leaveRoom", roomId);
    };
  }, [socket, selectedChat]);

  // Handle typing events
  useEffect(() => {
    if (!socket || !isTyping) return;

    const roomId = selectedChat?.id; // Match backend's room
    console.log('Emitting typing:', roomId); // Debug log
    socket.emit("typing", roomId);

    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
      if (selectedChat) {
        console.log('Emitting stopTyping:', roomId); // Debug log
        socket.emit("stopTyping", roomId);
      }
    }, 2000); // Stop typing after 2 seconds of inactivity

    return () => clearTimeout(typingTimeout);
  }, [socket, isTyping, selectedChat]);

  // Use React Query for messages
  const { data: messagesData, isLoading } = useMessages(
    currentUserId,
    selectedChat?.type === "user" ? selectedChat.id : undefined,
    selectedChat?.type === "group" ? selectedChat.id : undefined,
  );

  const messages: Message[] = (messagesData as any)?.data || [];
  const createMessageMutation = useCreateMessage();
  const editMessageMutation = useEditMessage();
  const deleteMessageMutation = useDeleteMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socket) return;

    try {
      const messageData = {
        text: newMessage,
        senderId: currentUserId,
        ...(selectedChat.type === "user" ? { receiverId: selectedChat.id } : { groupId: selectedChat.id }),
      };

      socket.emit("sendMessage", messageData); // Use socket to send message
      setNewMessage("");
      setIsTyping(false);
      const roomId = selectedChat.id; // Match backend's room
      socket.emit("stopTyping", roomId);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedChat) return;

    const roomId = selectedChat.id; // Match backend's room
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      console.log('Emitting typing:', roomId); // Debug log
      socket.emit("typing", roomId);
    } else if (isTyping && !e.target.value) {
      setIsTyping(false);
      console.log('Emitting stopTyping:', roomId); // Debug log
      socket.emit("stopTyping", roomId);
    }
  };

  const handleEditMessage = (messageId: string) => {
    const messageToEdit = messages.find((m) => m.id === messageId);
    if (messageToEdit) {
      setEditingMessage(messageToEdit);
      setEditedMessageContent(messageToEdit.text || "");
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessage && editedMessageContent.trim() !== "") {
      editMessageMutation.mutate(
        { id: editingMessage.id, data: { text: editedMessageContent } },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setEditingMessage(null);
            setEditedMessageContent("");
          },
        },
      );
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (messageToDelete) {
      deleteMessageMutation.mutate(messageToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setMessageToDelete(null);
        },
      });
    }
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
  };

  // Convert Message to MessageBubbleData
  const convertToMessageBubbleData = (message: Message): MessageBubbleData => ({
    id: message.id,
    content: message.text || "",
    sender: message.senderId === currentUserId ? "user" : "other",
    timestamp: new Date(message.createdAt),
    type: message.photoUrl ? "image" : message.fileUrl ? "file" : message.audioUrl ? "audio" : "text",
    senderName: message.sender?.name || selectedChat?.name,
    senderAvatar: message.sender?.avatarUrl || selectedChat?.avatar,
  });

  // Check if the selected user is online
  const isUserOnline = selectedChat?.type === "user" && onlineUsers.some((u) => u.userId === selectedChat.id);

  // Get typing users for the current chat
  const currentRoomTypingUsers = selectedChat ? typingUsers.get(selectedChat.id) || new Set() : new Set();
  console.log('socket connected:', socket?.connected);
  console.log('typingUsers:', Array.from(typingUsers.entries()));
  console.log('selectedChat:', selectedChat);
  console.log('currentRoomTypingUsers:', currentRoomTypingUsers);

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
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-b border-border/50 bg-card/30 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={handleBackToSidebar} className="hover:bg-primary/10">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedChat.avatar || "/placeholder.svg?height=40&width=40"} />
                  <AvatarFallback>
                    {selectedChat.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
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
                    : `${selectedChat.memberCount || 0} members`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 cursor-pointer">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background/80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message: Message) => (
                <MessageBubble
                  key={message.id}
                  message={convertToMessageBubbleData(message)}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              ))}
              {currentRoomTypingUsers.size > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  {Array.from(currentRoomTypingUsers)
                    .map((userId) => userMap.get(userId) || "Someone")
                    .join(", ") + " is typing..."}
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm"
        >
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="pr-12 bg-background/50 border-border/50 focus:border-primary/50"
                disabled={createMessageMutation.isPending}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-primary/10"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              className="neo-gradient hover:opacity-90 text-white"
              disabled={!newMessage.trim() || createMessageMutation.isPending}
            >
              {createMessageMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Custom Edit Modal using Portal */}
      {isEditDialogOpen && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            style={{ zIndex: 99999 }}
            onClick={() => setIsEditDialogOpen(false)}
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
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={editMessageMutation.isPending} className="cursor-pointer">
                    {editMessageMutation.isPending ? (
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
      )}

      {/* Custom Delete Modal using Portal */}
      {isDeleteDialogOpen && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            style={{ zIndex: 99999 }}
            onClick={() => setIsDeleteDialogOpen(false)}
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
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleteMessageMutation.isPending}
                  className="cursor-pointer"
                >
                  {deleteMessageMutation.isPending ? (
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
      )}
    </>
  );
}