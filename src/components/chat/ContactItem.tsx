import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ChatContact } from "@/types";

interface ContactItemProps {
  contact: ChatContact;
  onSelect: (contact: ChatContact) => void;
  selectedChatId?: string;
}

export default function ContactItem({ contact, onSelect, selectedChatId }: ContactItemProps) {
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        selectedChatId === contact.id ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50"
      }`}
      onClick={() => onSelect(contact)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={contact.avatar || "/placeholder.svg"} />
            <AvatarFallback>{contact.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(contact.status)} rounded-full border-2 border-background ${
              contact.status === "online" ? "animate-pulse-glow" : ""
            }`}
          ></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium truncate">{contact.name}</h4>
            {contact.unreadCount && (
              <Badge className="neo-gradient text-white text-xs">{contact.unreadCount}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {contact.lastMessage || `Last seen ${contact.lastSeen}`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}