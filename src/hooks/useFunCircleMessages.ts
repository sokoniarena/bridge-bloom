import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface FunCircleConversation {
  id: string;
  participant_one: string;
  participant_two: string;
  last_message_at: string | null;
  created_at: string;
  other_user?: {
    user_id: string;
    username: string;
    avatar_url: string | null;
  };
  unread_count?: number;
  last_message?: string;
}

export interface FunCircleMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function useFunCircleMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<FunCircleConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<FunCircleConversation | null>(null);
  const [messages, setMessages] = useState<FunCircleMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("fun_circle_conversations")
        .select("*")
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Get other participants' profiles
      const otherUserIds = (data || []).map(c =>
        c.participant_one === user.id ? c.participant_two : c.participant_one
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", otherUserIds);

      // Get unread counts and last messages
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async conv => {
          const otherUserId = conv.participant_one === user.id 
            ? conv.participant_two 
            : conv.participant_one;
          
          const { count } = await supabase
            .from("fun_circle_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("is_read", false)
            .neq("sender_id", user.id);

          const { data: lastMsg } = await supabase
            .from("fun_circle_messages")
            .select("content")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conv,
            other_user: profiles?.find(p => p.user_id === otherUserId),
            unread_count: count || 0,
            last_message: lastMsg?.content,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("fun_circle_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error) {
      setMessages(data || []);
      
      // Mark messages as read
      if (user) {
        await supabase
          .from("fun_circle_messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id)
          .eq("is_read", false);
      }
    }
  };

  const startConversation = async (friendUserId: string) => {
    if (!user) return null;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("fun_circle_conversations")
      .select("*")
      .or(
        `and(participant_one.eq.${user.id},participant_two.eq.${friendUserId}),and(participant_one.eq.${friendUserId},participant_two.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      setCurrentConversation(existing);
      await fetchMessages(existing.id);
      return existing;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from("fun_circle_conversations")
      .insert({
        participant_one: user.id,
        participant_two: friendUserId,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to start conversation",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    await fetchConversations();
    setCurrentConversation(data);
    return data;
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    const { data, error } = await supabase
      .from("fun_circle_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Update last_message_at
    await supabase
      .from("fun_circle_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    setMessages(prev => [...prev, data]);
  };

  const openConversation = async (conversation: FunCircleConversation) => {
    setCurrentConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const closeConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!currentConversation) return;

    const channel = supabase
      .channel(`fun_circle_messages_${currentConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fun_circle_messages",
          filter: `conversation_id=eq.${currentConversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as FunCircleMessage;
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          
          // Mark as read if not sender
          if (user && newMessage.sender_id !== user.id) {
            supabase
              .from("fun_circle_messages")
              .update({ is_read: true })
              .eq("id", newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversation, user]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    startConversation,
    sendMessage,
    openConversation,
    closeConversation,
    refreshConversations: fetchConversations,
  };
}