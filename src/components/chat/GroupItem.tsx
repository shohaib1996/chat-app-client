import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ChatGroup } from "@/types";

interface GroupItemProps {
  group: ChatGroup;
  onSelect: (group: ChatGroup) => void;
  selectedChatId?: string;
}

export default function GroupItem({ group, onSelect, selectedChatId }: GroupItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        selectedChatId === group.id ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50"
      }`}
      onClick={() => onSelect(group)}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={group.avatar || "/placeholder.svg"} />
          <AvatarFallback>{group.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium truncate">{group.name}</h4>
            {group.unreadCount && (
              <Badge className="neo-gradient text-white text-xs">{group.unreadCount}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {group.lastMessage || "No messages yet"} • {group.memberCount} members
          </p>
        </div>
      </div>
    </motion.div>
  );
}