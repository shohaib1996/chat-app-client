import axios from "axios"
import type {
  User,
  Message,
  Group,
  GroupMember,
  RegisterRequest,
  UpdateProfileRequest,
  CreateMessageRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddGroupMemberRequest,
  UpdateGroupMemberRequest,
} from "@/types"

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token")
        window.location.href = "/auth/signin"
      }
    }
    return Promise.reject(error)
  },
)

// API functions
export const authAPI = {
  register: (data: RegisterRequest): Promise<{ data: User }> => api.post("/auth/register", data),

  login: (data: { email: string; password: string }): Promise<{ data: { user: User; token: string } }> =>
    api.post("/auth/login", data),

  getProfile: (): Promise<{ data: User }> => api.get("/auth/profile"),

  updateProfile: (data: UpdateProfileRequest): Promise<{ data: User }> => api.put("/auth/profile", data),

  getAllUsers: (): Promise<{data: User[]}> => api.get("/auth/users"),

  search: (name: string, type: string): Promise<{ data: User[] }> =>
    api.get(`/search?name=${name}&type=${type}`),
}

export const messagesAPI = {
  createMessage: (data: CreateMessageRequest): Promise<{ data: Message }> => api.post("/messages", data),

  getMessages: (senderId: string, receiverId?: string, groupId?: string): Promise<{ data: Message[] }> => {
    const params = new URLSearchParams({ senderId })
    if (receiverId) params.append("receiverId", receiverId)
    if (groupId) params.append("groupId", groupId)
    return api.get(`/messages?${params.toString()}`)
  },

  getMessageById: (id: string): Promise<{ data: Message }> => api.get(`/messages/${id}`),

  editMessage: (id: string, data: { text?: string }): Promise<{ data: Message }> => api.put(`/messages/${id}`, data),

  deleteMessage: (id: string): Promise<void> => api.delete(`/messages/${id}`),
}

export const groupsAPI = {
  createGroup: (data: CreateGroupRequest): Promise<{ data: Group }> => api.post("/groups", data),

  getGroups: (): Promise<{ data: Group[] }> => api.get("/groups"),

  getGroupById: (id: string): Promise<{ data: Group }> => api.get(`/groups/${id}`),

  updateGroup: (id: string, data: UpdateGroupRequest): Promise<{ data: Group }> => api.put(`/groups/${id}`, data),

  deleteGroup: (id: string): Promise<void> => api.delete(`/groups/${id}`),
}

export const uploadAPI = {
  uploadImage: (data: FormData): Promise<{ data: { url: string } }> =>
    api.post("/upload/image", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
}

export const groupMembersAPI = {
  addGroupMember: (data: AddGroupMemberRequest): Promise<{ data: GroupMember }> => api.post("/groupmembers", data),

  getGroupMembers: (groupId: string): Promise<{ data: GroupMember[] }> => api.get(`/groupmembers?groupId=${groupId}`),

  getGroupMemberById: (id: string): Promise<{ data: GroupMember }> => api.get(`/groupmembers/${id}`),

  updateGroupMember: (id: string, data: UpdateGroupMemberRequest): Promise<{ data: GroupMember }> =>
    api.put(`/groupmembers/${id}`, data),

  deleteGroupMember: (id: string): Promise<void> => api.delete(`/groupmembers/${id}`),
}
