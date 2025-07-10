// Database model types based on your Prisma schema
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  status?: string
}

export interface AuthUserProfile {
  data: User
}

export interface Message {
  id: string
  text?: string
  fileUrl?: string
  photoUrl?: string
  audioUrl?: string
  senderId: string
  receiverId?: string
  groupId?: string
  seen: boolean
  createdAt: Date
  sender?: User
  receiver?: User
  group?: Group
}

export interface Group {
  id: string
  name: string
  avatarUrl?: string
  createdAt: Date
  members?: GroupMember[]
  messages?: Message[]
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  joinedAt: Date
  isAdmin: boolean
  user?: User
  group?: Group
}

// API request/response types
export interface RegisterRequest {
  name: string
  email: string
  password: string
  avatarUrl?: string
  status?: string
}

export interface UpdateProfileRequest {
  name?: string
  avatarUrl?: string
  status?: string
}

export interface CreateMessageRequest {
  text?: string
  fileUrl?: string
  photoUrl?: string
  audioUrl?: string
  senderId: string
  receiverId?: string
  groupId?: string
}

export interface CreateGroupRequest {
  name: string
  avatarUrl?: string
}

export interface UpdateGroupRequest {
  name?: string
  avatarUrl?: string
}

export interface AddGroupMemberRequest {
  userId: string
  groupId: string
  isAdmin?: boolean
}

export interface UpdateGroupMemberRequest {
  isAdmin?: boolean
}

// UI component types
export interface ChatContact {
  id: string
  name: string
  avatar?: string
  status?: string
  lastMessage?: string
  lastSeen?: string
  unreadCount?: number
  type: "user"
}

export interface ChatGroup {
  id: string
  name: string
  avatar?: string
  memberCount: number
  lastMessage?: string
  unreadCount?: number
  type: "group"
}

export type ChatItem = ChatContact | ChatGroup

export interface MessageBubbleData {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: Date
  type: "text" | "image" | "file" | "audio"
  senderName?: string
  senderAvatar?: string
}
