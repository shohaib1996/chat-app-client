import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authAPI, messagesAPI, groupsAPI, groupMembersAPI, uploadAPI } from "./api"
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

export interface AuthProfileResponse {
  data: User;
}

export const useProfile = () => {
  return useQuery<User>({
    queryKey: ["profile"],
    queryFn: () => authAPI.getProfile().then((res) => (res.data)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useRegister = () => {
  return useMutation<{ data: User }, Error, RegisterRequest>({
    mutationFn: authAPI.register,
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation<{ data: User }, Error, UpdateProfileRequest>({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export const useSearch = (name: string, type: string) => {
  return useQuery<User[]>({
    queryKey: ["search", name, type],
    queryFn: () => authAPI.search(name, type).then((res) => res.data),
    enabled: !!name,
  })
}

// Message queries
export const useMessages = (senderId: string, receiverId?: string, groupId?: string) => {
  return useQuery<Message[]>({
    queryKey: ["messages", senderId, receiverId, groupId],
    queryFn: () => messagesAPI.getMessages(senderId, receiverId, groupId).then((res) => res.data),
    enabled: !!(senderId && (receiverId || groupId)),
    refetchInterval: 3000, // Refetch every 3 seconds for real-time feel
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()

  return useMutation<{ data: Message }, Error, CreateMessageRequest>({
    mutationFn: messagesAPI.createMessage,
    onSuccess: (_, variables) => {
      // Invalidate messages for the conversation
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.senderId, variables.receiverId, variables.groupId],
      })
      if (variables.receiverId) {
        queryClient.invalidateQueries({
          queryKey: ["messages", variables.receiverId, variables.senderId],
        })
      }
    },
  })
}

export const useEditMessage = () => {
  const queryClient = useQueryClient()

  return useMutation<{ data: Message }, Error, { id: string; data: { text?: string } }>({
    mutationFn: ({ id, data }) => messagesAPI.editMessage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] })
    },
  })
}

export const useDeleteMessage = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: messagesAPI.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] })
    },
  })
}

// Group queries
export const useGroups = () => {
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => groupsAPI.getGroups().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

export const useGroup = (id: string) => {
  return useQuery<Group>({
    queryKey: ["group", id],
    queryFn: () => groupsAPI.getGroupById(id).then((res) => res.data),
    enabled: !!id,
  })
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation<{ data: Group }, Error, CreateGroupRequest>({
    mutationFn: groupsAPI.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const useUpdateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation<{ data: Group }, Error, { id: string; data: UpdateGroupRequest }>({
    mutationFn: ({ id, data }) => groupsAPI.updateGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["group", variables.id] })
    },
  })
}

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: groupsAPI.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

// Group members queries
export const useGroupMembers = (groupId: string) => {
  return useQuery<GroupMember[]>({
    queryKey: ["groupMembers", groupId],
    queryFn: () => groupMembersAPI.getGroupMembers(groupId).then((res) => res.data),
    enabled: !!groupId,
  })
}

export const useAddGroupMember = () => {
  const queryClient = useQueryClient()

  return useMutation<{ data: GroupMember }, Error, AddGroupMemberRequest>({
    mutationFn: groupMembersAPI.addGroupMember,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", variables.groupId] })
    },
  })
}

export const useUpdateGroupMember = () => {
  const queryClient = useQueryClient()

  return useMutation<{ data: GroupMember }, Error, { id: string; data: UpdateGroupMemberRequest }>({
    mutationFn: ({ id, data }) => groupMembersAPI.updateGroupMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers"] })
    },
  })
}

export const useDeleteGroupMember = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: groupMembersAPI.deleteGroupMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers"] })
    },
  })
}

// Upload queries
export const useUploadImage = () => {
  return useMutation<{ data: { url: string } }, Error, FormData>({
    mutationFn: uploadAPI.uploadImage,
  })
}
