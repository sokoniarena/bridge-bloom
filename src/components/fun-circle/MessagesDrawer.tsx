import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Loader2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFunCircleMessages,
  FunCircleConversation,
  FunCircleMessage,
} from "@/hooks/useFunCircleMessages";
import { cn } from "@/lib/utils";

interface MessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessagesDrawer({ isOpen, onClose }: MessagesDrawerProps) {
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    openConversation,
    closeConversation,
    sendMessage,
  } = useFunCircleMessages();

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentConversation || !newMessage.trim()) return;

    setIsSending(true);
    await sendMessage(currentConversation.id, newMessage);
    setNewMessage("");
    setIsSending(false);
  };

  const handleBack = () => {
    closeConversation();
  };

  if (!isOpen) return null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-3">
          {currentConversation ? (
            <>
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentConversation.other_user?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {currentConversation.other_user?.username?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">
                {currentConversation.other_user?.username || "Chat"}
              </CardTitle>
            </>
          ) : (
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {currentConversation ? (
          // Message View
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.sender_id === user?.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Conversations List
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Message a friend to start chatting!</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    onClick={() => openConversation(conv)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function ConversationItem({
  conversation,
  onClick,
}: {
  conversation: FunCircleConversation;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 text-left"
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={conversation.other_user?.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {conversation.other_user?.username?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        {(conversation.unread_count || 0) > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
            {conversation.unread_count}
          </Badge>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-medium">
            {conversation.other_user?.username || "Unknown"}
          </span>
          {conversation.last_message_at && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(conversation.last_message_at), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
        {conversation.last_message && (
          <p className="text-sm text-muted-foreground truncate">
            {conversation.last_message}
          </p>
        )}
      </div>
    </button>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: FunCircleMessage;
  isOwn: boolean;
}) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}