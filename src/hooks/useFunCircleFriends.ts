import { useState, useEffect, useCallback } from "react";
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

  const fetchFriendsAndRequests = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Parallel fetch for friends and pending requests
      const [friendshipsResult, incomingResult, outgoingResult] = await Promise.all([
        supabase
          .from("fun_circle_friends")
          .select("*")
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
        supabase
          .from("fun_circle_friends")
          .select("*")
          .eq("addressee_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("fun_circle_friends")
          .select("*")
          .eq("requester_id", user.id)
          .eq("status", "pending"),
      ]);

      const friendships = friendshipsResult.data || [];
      const incoming = incomingResult.data || [];
      const outgoing = outgoingResult.data || [];

      // Get all user IDs we need profiles for
      const friendUserIds = friendships.map(f =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      const requesterIds = incoming.map(r => r.requester_id);
      const allUserIds = [...new Set([...friendUserIds, ...requesterIds])];

      // Single batch profile fetch
      let profiles: Array<{ user_id: string; username: string; avatar_url: string | null }> = [];
      if (allUserIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", allUserIds);
        profiles = data || [];
      }

      // Build friends list
      const friendsList = friendships.map(f => {
        const friendUserId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
        const profile = profiles.find(p => p.user_id === friendUserId);
        return {
          user_id: friendUserId,
          username: profile?.username || "Unknown",
          avatar_url: profile?.avatar_url,
          friendship_id: f.id,
        };
      });
      setFriends(friendsList);

      // Build pending requests
      const requestsWithProfiles = incoming.map(r => ({
        ...r,
        status: r.status as "pending" | "accepted" | "rejected",
        profile: profiles.find(p => p.user_id === r.requester_id),
      }));
      setPendingRequests(requestsWithProfiles);

      // Set sent requests
      setSentRequests(outgoing.map(r => ({
        ...r,
        status: r.status as "pending" | "accepted" | "rejected",
      })));
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
    await fetchFriendsAndRequests();
    return { error: null };
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("fun_circle_friends")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (!error) {
      toast({ title: "Friend request accepted!" });
      await fetchFriendsAndRequests();
    }
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("fun_circle_friends")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (!error) {
      toast({ title: "Friend request declined" });
      await fetchFriendsAndRequests();
    }
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from("fun_circle_friends")
      .delete()
      .eq("id", friendshipId);

    if (!error) {
      toast({ title: "Friend removed" });
      await fetchFriendsAndRequests();
    }
  };

  const searchUsers = useCallback(async (query: string) => {
    if (!user || query.length < 2) return [];

    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .neq("user_id", user.id)
      .ilike("username", `%${query}%`)
      .limit(10);

    return data || [];
  }, [user]);

  useEffect(() => {
    fetchFriendsAndRequests();
  }, [fetchFriendsAndRequests]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("fun_circle_friends_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fun_circle_friends" },
        () => {
          fetchFriendsAndRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFriendsAndRequests]);

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
    refreshFriends: fetchFriendsAndRequests,
  };
}
