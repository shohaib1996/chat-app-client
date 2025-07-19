"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "@/components/socket/SocketContext";
import type { ChatItem } from "@/types";

interface User {
  userId: string;
  socketId: string;
}

interface ChatContextType {
  selectedChat: ChatItem | null;
  setSelectedChat: (chat: ChatItem | null) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  typingUsers: Map<string, Set<string>>; // Map of roomId to Set of userIds
  addTypingUser: (roomId: string, userId: string) => void;
  removeTypingUser: (roomId: string, userId: string) => void;
  onlineUsers: User[];
  setOnlineUsers: (users: User[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket();
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  const addTypingUser = (roomId: string, userId: string) => {
    setTypingUsers((prev) => {
      const newMap = new Map<string, Set<string>>(prev);
      const roomUsers = newMap.get(roomId) || new Set<string>();
      roomUsers.add(userId);
      newMap.set(roomId, roomUsers);
      return newMap;
    });
  };

  const removeTypingUser = (roomId: string, userId: string) => {
    setTypingUsers((prev) => {
      const newMap = new Map<string, Set<string>>(prev);
      const roomUsers = newMap.get(roomId) || new Set<string>();
      roomUsers.delete(userId);
      if (roomUsers.size === 0) {
        newMap.delete(roomId);
      } else {
        newMap.set(roomId, roomUsers);
      }
      return newMap;
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('typing', ({ socketId, userId }, roomId: string) => {
      console.log('Typing event received:', { socketId, userId, roomId });
      if (userId) {
        addTypingUser(roomId, userId);
      }
    });

    socket.on('stopTyping', ({ socketId, userId }, roomId: string) => {
      console.log('StopTyping event received:', { socketId, userId, roomId });
      if (userId) {
        removeTypingUser(roomId, userId);
      }
    });

    socket.on('onlineUsers', (users: User[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('onlineUsers');
    };
  }, [socket]);

  console.log("ChatContext - selectedChat:", selectedChat);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        showSidebar,
        setShowSidebar,
        typingUsers,
        addTypingUser,
        removeTypingUser,
        onlineUsers,
        setOnlineUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}