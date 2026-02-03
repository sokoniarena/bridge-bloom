import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  User,
  Package,
  Loader2,
  Check,
  CheckCheck,
} from "lucide-react";

interface Conversation {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  last_message_at: string | null;
  listing?: {
    title: string;
    images: string[] | null;
    price: number | null;
  };
  other_user?: {
    username: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    sender_id: string;
    is_read: boolean | null;
  };
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function Messages() {
  const [searchParams] = useSearchParams();
  const activeConversationId = searchParams.get("c");
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToConversations();
    }
  }, [user]);

  // Update active conversation when URL or conversations change
  useEffect(() => {
    if (activeConversationId && conversations.length > 0) {
      const active = conversations.find(c => c.id === activeConversationId);
      setActiveConversation(active || null);
    } else if (!activeConversationId) {
      setActiveConversation(null);
    }
  }, [activeConversationId, conversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversationId && user) {
      fetchMessages(activeConversationId);
      subscribeToMessages(activeConversationId);
      markMessagesAsRead(activeConversationId);
    }
  }, [activeConversationId, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;
    setIsLoading(true);

    const { data: convos } = await supabase
      .from("conversations")
      .select("id, listing_id, buyer_id, seller_id, created_at, last_message_at")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (convos) {
      // Fetch additional data for each conversation
      const enrichedConvos = await Promise.all(
        convos.map(async (convo) => {
          // Get listing info
          const { data: listing } = await supabase
            .from("listings")
            .select("title, images, price")
            .eq("id", convo.listing_id!)
            .maybeSingle();

          // Get other user's profile - profiles table uses 'id' as the user identifier
          const otherUserId = convo.buyer_id === user.id ? convo.seller_id : convo.buyer_id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", otherUserId)
            .maybeSingle();

          // Get last message
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, sender_id, is_read")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", convo.id)
            .eq("is_read", false)
            .neq("sender_id", user.id);

          return {
            ...convo,
            listing: listing || undefined,
            other_user: profile || undefined,
            last_message: lastMsg || undefined,
            unread_count: count || 0,
          };
        })
      );

      setConversations(enrichedConvos);
    }

    setIsLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          // Mark as read if we're the recipient
          if ((payload.new as Message).sender_id !== user?.id) {
            markMessagesAsRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;
    
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId || !user || isSending) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      sender_id: user.id,
      content,
    });

    if (error) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
      setNewMessage(content);
    } else {
      // Update conversation's last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeConversationId);
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM d, h:mm a");
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in to view messages</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access your messages.
          </p>
          <Button asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="font-display text-2xl font-bold mb-6">Messages</h1>

        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
          {/* Conversations List */}
          <Card className={cn(
            "md:col-span-1",
            activeConversationId && "hidden md:block"
          )}>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Conversations</h2>
              </div>
              <ScrollArea className="h-[calc(100%-60px)]">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-1">Start a chat from a listing page</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((convo) => (
                      <Link
                        key={convo.id}
                        to={`/messages?c=${convo.id}`}
                        className={cn(
                          "flex gap-3 p-4 hover:bg-muted/50 transition-colors",
                          activeConversationId === convo.id && "bg-muted"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {convo.other_user?.avatar_url ? (
                            <img
                              src={convo.other_user.avatar_url}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-medium truncate">
                              {convo.other_user?.username || "User"}
                            </p>
                            {convo.unread_count ? (
                              <Badge className="shrink-0">{convo.unread_count}</Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {convo.listing?.title}
                          </p>
                          {convo.last_message && (
                            <p className={cn(
                              "text-sm truncate mt-1",
                              convo.unread_count ? "font-medium" : "text-muted-foreground"
                            )}>
                              {convo.last_message.sender_id === user.id && "You: "}
                              {convo.last_message.content}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className={cn(
            "md:col-span-2 flex flex-col",
            !activeConversationId && "hidden md:flex"
          )}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Link to="/messages" className="md:hidden">
                    <Button variant="ghost" size="icon">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </Link>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {activeConversation.other_user?.avatar_url ? (
                      <img
                        src={activeConversation.other_user.avatar_url}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {activeConversation.other_user?.username || "User"}
                    </p>
                    <Link
                      to={`/products/${activeConversation.listing_id}`}
                      className="text-xs text-muted-foreground hover:text-primary truncate block"
                    >
                      {activeConversation.listing?.title}
                    </Link>
                  </div>
                  {activeConversation.listing?.images?.[0] && (
                    <Link to={`/products/${activeConversation.listing_id}`}>
                      <img
                        src={activeConversation.listing.images[0]}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </Link>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg, i) => {
                      const isOwn = msg.sender_id === user.id;
                      const showTime =
                        i === 0 ||
                        new Date(msg.created_at).getTime() -
                          new Date(messages[i - 1].created_at).getTime() >
                          300000;

                      return (
                        <div key={msg.id}>
                          {showTime && (
                            <p className="text-xs text-center text-muted-foreground my-4">
                              {formatMessageTime(msg.created_at)}
                            </p>
                          )}
                          <div
                            className={cn(
                              "flex",
                              isOwn ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2",
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                              <div
                                className={cn(
                                  "flex items-center justify-end gap-1 mt-1",
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}
                              >
                                <span className="text-[10px]">
                                  {format(new Date(msg.created_at), "h:mm a")}
                                </span>
                                {isOwn && (
                                  msg.is_read ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || isSending}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
