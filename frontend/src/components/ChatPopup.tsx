import { useState, useEffect, useRef } from "react";
import { Send, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: Date;
}

interface ChatUser {
  name: string;
  avatar: string;
}

interface ChatPopupProps {
  open: boolean;
  onClose: () => void;
  user: ChatUser | null;
}

const ChatPopup = ({ open, onClose, user }: ChatPopupProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! I saw your profile and think we might be a good match as roommates!",
      sender: "me",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      text: "Hi there! Yeah, I noticed we have similar preferences. Are you also looking for a place near 42?",
      sender: "them",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
    {
      id: "3",
      text: "Exactly! I'm hoping to find something within 20 mins of the campus.",
      sender: "me",
      timestamp: new Date(Date.now() - 1000 * 60 * 1),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "me",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col w-80 shadow-2xl rounded-lg overflow-hidden border border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground">
        <div 
          className="flex items-center gap-2 cursor-pointer flex-1"
          onClick={() => setMinimized(!minimized)}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover grayscale"
          />
          <span className="font-medium text-sm">{user.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-primary-foreground hover:bg-white/20"
            onClick={() => setMinimized(!minimized)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-primary-foreground hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!minimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-72 px-3 py-2" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-sm ${
                      message.sender === "me"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className="text-[10px] opacity-60 mt-0.5 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-2">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Aa"
                className="flex-1 h-9 text-sm"
              />
              <Button 
                onClick={handleSend} 
                size="icon" 
                className="h-9 w-9"
                disabled={!newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPopup;
