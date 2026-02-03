import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SuggestedFriend {
  user_id: string;
  username: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  is_verified: boolean;
  created_at: string;
  suggestion_reason: "location" | "new_member" | "popular" | "active" | "mutual";
  mutual_friends_count?: number;
}

export function useFriendSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuggestions = async () => {
    if (!user) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get current user's profile for location-based matching
      const { data: myProfileData } = await supabase
        .from("profiles")
        .select("location")
        .eq("id", user.id)
        .maybeSingle();
      
      const myProfile = myProfileData as { location: string | null } | null;

      // Get existing friends and pending requests to exclude
      const { data: friendships } = await supabase
        .from("fun_circle_friends")
        .select("requester_id, addressee_id")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const excludedIds = new Set<string>([user.id]);
      (friendships || []).forEach(f => {
        excludedIds.add(f.requester_id);
        excludedIds.add(f.addressee_id);
      });

      // Fetch all potential suggestions - use 'id' instead of 'user_id'
      const { data: allProfilesData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, location, bio, is_verified, created_at")
        .not("id", "in", `(${Array.from(excludedIds).join(",")})`)
        .limit(50);

      const allProfiles = (allProfilesData as any[]) || [];

      if (allProfiles.length === 0) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      // Get story counts for activity-based suggestions
      const userIds = allProfiles.map(p => p.id);
      const { data: storyCounts } = await supabase
        .from("fun_circle_stories")
        .select("user_id")
        .in("user_id", userIds);

      const storyCountMap = new Map<string, number>();
      (storyCounts || []).forEach(s => {
        storyCountMap.set(s.user_id, (storyCountMap.get(s.user_id) || 0) + 1);
      });

      // Calculate mutual friends for each suggestion
      const myFriendIds = new Set(
        (friendships || [])
          .filter(f => f.requester_id === user.id || f.addressee_id === user.id)
          .map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id)
      );

      // Get friends of friends
      const { data: friendsOfFriends } = await supabase
        .from("fun_circle_friends")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(
          Array.from(myFriendIds)
            .map(id => `requester_id.eq.${id},addressee_id.eq.${id}`)
            .join(",")
        );

      const mutualCountMap = new Map<string, number>();
      (friendsOfFriends || []).forEach(f => {
        const potentialFriend = myFriendIds.has(f.requester_id) ? f.addressee_id : f.requester_id;
        if (!excludedIds.has(potentialFriend) && potentialFriend !== user.id) {
          mutualCountMap.set(potentialFriend, (mutualCountMap.get(potentialFriend) || 0) + 1);
        }
      });

      // Score and categorize suggestions
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const scoredSuggestions = allProfiles.map(profile => {
        let score = 0;
        let reason: SuggestedFriend["suggestion_reason"] = "popular";

        const mutualCount = mutualCountMap.get(profile.id) || 0;
        const storyCount = storyCountMap.get(profile.id) || 0;
        const isNewMember = new Date(profile.created_at) > oneWeekAgo;
        const sameLocation = myProfile?.location && profile.location && 
          profile.location.toLowerCase().includes(myProfile.location.toLowerCase().split(",")[0]);

        // Scoring logic
        if (mutualCount > 0) {
          score += mutualCount * 30;
          reason = "mutual";
        }

        if (sameLocation) {
          score += 25;
          if (reason !== "mutual") reason = "location";
        }

        if (isNewMember) {
          score += 20;
          if (reason !== "mutual" && reason !== "location") reason = "new_member";
        }

        if (storyCount > 0) {
          score += Math.min(storyCount * 5, 20);
          if (score > 0 && reason === "popular") reason = "active";
        }

        if (profile.is_verified) {
          score += 10;
        }

        return {
          user_id: profile.id,
          username: profile.username || profile.full_name || "Unknown",
          avatar_url: profile.avatar_url,
          location: profile.location,
          bio: profile.bio,
          is_verified: profile.is_verified || false,
          created_at: profile.created_at,
          suggestion_reason: reason,
          mutual_friends_count: mutualCount,
          score,
        };
      });

      // Sort by score and take top suggestions
      const sortedSuggestions = scoredSuggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map(({ score, ...rest }) => rest as SuggestedFriend);

      setSuggestions(sortedSuggestions);
    } catch (error) {
      console.error("Error fetching friend suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  return {
    suggestions,
    isLoading,
    refreshSuggestions: fetchSuggestions,
  };
}