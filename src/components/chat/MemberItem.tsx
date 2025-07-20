import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import type { ApiUser } from "@/types";

interface MemberItemProps {
  user: ApiUser;
  isSelected: boolean;
  onSelect: (user: ApiUser) => void;
}

export default function MemberItem({ user, isSelected, onSelect }: MemberItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
        isSelected ? "bg-primary/10 border-primary/50" : "hover:bg-accent/50 border-transparent"
      }`}
      onClick={() => onSelect(user)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="w-8 h-8">
           

 <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          {isSelected && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-2 h-2" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{user.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
    </motion.div>
  );
}