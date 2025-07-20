import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearch, useCreateGroup } from "@/lib/queries";
import MemberItem from "./MemberItem";
import type { ApiUser } from "@/types";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupDialog({ isOpen, onClose }: CreateGroupDialogProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatarUrl, setNewGroupAvatarUrl] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<ApiUser[]>([]);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { data: searchResults, isLoading: searchLoading } = useSearch(memberSearchQuery, "user");
  const createGroupMutation = useCreateGroup();

  const defaultUsers = (searchResults as any)?.data?.slice(0, 5) || [];
  const displayUsers = memberSearchQuery ? (searchResults as any)?.data || [] : defaultUsers;
  const shouldShowUsers = showMemberSearch && (memberSearchQuery || defaultUsers.length > 0);

  const handleMemberSelect = (user: ApiUser) => {
    const isSelected = selectedMembers.some((member) => member.id === user.id);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter((member) => member.id !== user.id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
    setValidationError("");
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() === "") {
      setValidationError("Group name cannot be empty.");
      return;
    }

    if (selectedMembers.length < 2) {
      setValidationError("Please select at least 2 members to create a group.");
      return;
    }

    const memberIds = selectedMembers.map((member) => member.id);

    createGroupMutation.mutate(
      {
        name: newGroupName,
        avatarUrl: newGroupAvatarUrl || undefined,
        memberIds,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          console.error("Failed to create group:", error);
          setValidationError("Failed to create group. Please try again.");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-1 overflow-hidden">
          <div className="grid gap-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="groupAvatar">Avatar URL (Optional)</Label>
            <Input
              id="groupAvatar"
              value={newGroupAvatarUrl}
              onChange={(e) => setNewGroupAvatarUrl(e.target.value)}
              placeholder="Enter avatar URL"
            />
          </div>

          {/* Member Search */}
          <div className="grid gap-2 flex-1 overflow-hidden">
            <Label htmlFor="memberSearch">Add Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="memberSearch"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                onFocus={() => setShowMemberSearch(true)}
                placeholder="Search members..."
                className="pl-10"
              />
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-accent/20 rounded-lg">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                  >
                    <span>{member.name}</span>
                    <button
                      onClick={() => handleMemberSelect(member)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Member Search Results */}
            {shouldShowUsers && (
              <div className="border rounded-lg max-h-48 overflow-hidden flex flex-col">
                <div className="p-2 bg-accent/10 border-b text-sm font-medium">
                  {memberSearchQuery ? `Search results for "${memberSearchQuery}"` : "Suggested members"}
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                        />
                      </div>
                    ) : displayUsers.length > 0 ? (
                      displayUsers.map((user: any) => (
                        <MemberItem
                          key={user.id}
                          user={user}
                          isSelected={selectedMembers.some((member) => member.id === user.id)}
                          onSelect={handleMemberSelect}
                        />
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        {memberSearchQuery ? "No users found" : "No members available"}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
              {validationError}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleCreateGroup}
            disabled={createGroupMutation.isPending}
          >
            {createGroupMutation.isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              "Create Group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}