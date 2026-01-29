import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    user_id: string;
  };
}

export interface Friend {
  user_id: string;
  username: string;
  avatar_url: string | null;
  friendship_id: string;
}

export function useFunCircleFriends() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFriends = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get all accepted friendships
      const { data: friendships, error } = await supabase
        .from("fun_circle_friends")
        .select("*")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      // Get the friend user IDs
      const friendUserIds = (friendships || []).map(f =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      if (friendUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", friendUserIds);

        const friendsList = (friendships || []).map(f => {
          const friendUserId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
          const profile = profiles?.find(p => p.user_id === friendUserId);
          return {
            user_id: friendUserId,
            username: profile?.username || "Unknown",
            avatar_url: profile?.avatar_url,
            friendship_id: f.id,
          };
        });

        setFriends(friendsList);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!user) return;

    // Requests sent to me
    const { data: incoming } = await supabase
      .from("fun_circle_friends")
      .select("*")
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    const requesterIds = (incoming || []).map(r => r.requester_id);
    
    if (requesterIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", requesterIds);

      const requestsWithProfiles = (incoming || []).map(r => ({
        ...r,
        status: r.status as "pending" | "accepted" | "rejected",
        profile: profiles?.find(p => p.user_id === r.requester_id),
      }));

      setPendingRequests(requestsWithProfiles);
    } else {
      setPendingRequests([]);
    }

    // Requests I sent
    const { data: outgoing } = await supabase
      .from("fun_circle_friends")
      .select("*")
      .eq("requester_id", user.id)
      .eq("status", "pending");

    setSentRequests((outgoing || []).map(r => ({
      ...r,
      status: r.status as "pending" | "accepted" | "rejected",
    })));
  };

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    if (addresseeId === user.id) {
      toast({
        title: "Cannot add yourself",
        variant: "destructive",
      });
      return { error: new Error("Cannot add yourself") };
    }

    // Check if already friends or request exists
    const { data: existing } = await supabase
      .from("fun_circle_friends")
      .select("id, status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      const message = existing.status === "accepted" 
        ? "You are already friends" 
        : "Friend request already exists";
      toast({ title: message });
      return { error: new Error(message) };
    }

    const { error } = await supabase
      .from("fun_circle_friends")
      .insert({
        requester_id: user.id,
        addressee_id: addresseeId,
      });

    if (error) {
      toast({
        title: "Failed to send request",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({ title: "Friend request sent!" });
    await fetchPendingRequests();
    return { error: null };
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("fun_circle_friends")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (!error) {
      toast({ title: "Friend request accepted!" });
      await fetchFriends();
      await fetchPendingRequests();
    }
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("fun_circle_friends")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (!error) {
      toast({ title: "Friend request declined" });
      await fetchPendingRequests();
    }
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from("fun_circle_friends")
      .delete()
      .eq("id", friendshipId);

    if (!error) {
      toast({ title: "Friend removed" });
      await fetchFriends();
    }
  };

  const searchUsers = async (query: string) => {
    if (!user || query.length < 2) return [];

    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .neq("user_id", user.id)
      .ilike("username", `%${query}%`)
      .limit(10);

    return data || [];
  };

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("fun_circle_friends_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fun_circle_friends" },
        () => {
          fetchFriends();
          fetchPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    isLoading,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
    refreshFriends: fetchFriends,
  };
}