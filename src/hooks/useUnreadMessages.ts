import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const previousCountRef = useRef(0);

  const showPushNotification = useCallback((senderName: string, messagePreview: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(`New message from ${senderName}`, {
            body: messagePreview.length > 100 ? `${messagePreview.slice(0, 100)}...` : messagePreview,
            icon: "/pwa-192x192.svg",
            badge: "/pwa-192x192.svg",
            tag: "new-message",
          });
        });
      } else {
        new Notification(`New message from ${senderName}`, {
          body: messagePreview.length > 100 ? `${messagePreview.slice(0, 100)}...` : messagePreview,
          icon: "/pwa-192x192.svg",
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      // Get conversations where user is participant
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (!conversations || conversations.length === 0) {
        setUnreadCount(0);
        return;
      }

      const conversationIds = conversations.map((c) => c.id);

      // Count unread messages not sent by current user
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to real-time message updates
    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new as { sender_id: string; content: string; conversation_id: string };
          
          // Only show notification if message is not from current user
          if (newMessage.sender_id !== user.id) {
            // Fetch sender's profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, full_name")
              .eq("id", newMessage.sender_id)
              .maybeSingle();

            const senderName = (profile as any)?.username || (profile as any)?.full_name || "Someone";
            showPushNotification(senderName, newMessage.content);
          }

          fetchUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showPushNotification]);

  return unreadCount;
}
