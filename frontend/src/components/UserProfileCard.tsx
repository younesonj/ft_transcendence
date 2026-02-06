import { MapPin, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Preference {
  emoji: string;
  label: string;
}

interface UserProfile {
  name: string;
  age: number;
  location: string;
  bio: string;
  avatar: string;
  moveInDate: string;
  budget: string;
  preferences: Preference[];
}

interface UserProfileCardProps {
  user: UserProfile;
  onChatClick?: (user: { name: string; avatar: string }) => void;
}

const UserProfileCard = ({ user, onChatClick }: UserProfileCardProps) => {
  return (
    <div className="glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-16 h-16 rounded-xl object-cover grayscale"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">{user.name}, {user.age}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="w-3 h-3" />
            <span>{user.location}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onChatClick?.({ name: user.name, avatar: user.avatar })}
          className="shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>

      {/* Bio */}
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
        {user.bio}
      </p>

      {/* Preferences */}
      <div className="flex flex-wrap gap-2 mb-4">
        {user.preferences.map((pref, index) => (
          <span 
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm"
          >
            <span>{pref.emoji}</span>
            <span className="text-muted-foreground">{pref.label}</span>
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{user.moveInDate}</span>
        </div>
        <span className="text-primary font-semibold">{user.budget}</span>
      </div>
    </div>
  );
};

export default UserProfileCard;
