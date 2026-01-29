import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type ReactionType = "like" | "love" | "laugh" | "wow" | "sad" | "angry";

export interface ReactionCounts {
  like: number;
  love: number;
  laugh: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface Story {
  id: string;
  user_id: string;
  content: string | null;
  images: string[];
  created_at: string;
  expires_at: string;
  reactions_count: ReactionCounts;
  views_count: number;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
  user_reaction?: ReactionType | null;
  mentions?: string[];
}

export interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

const defaultReactionCounts: ReactionCounts = {
  like: 0,
  love: 0,
  laugh: 0,
  wow: 0,
  sad: 0,
  angry: 0,
};

export function useFunCircleStories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesUploadedToday, setImagesUploadedToday] = useState(0);

  const fetchStories = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get stories that haven't expired
      const { data, error } = await supabase
        .from("fun_circle_stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profiles for each story
      const userIds = [...new Set(data?.map(s => s.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      // Get user's reactions
      const { data: reactions } = await supabase
        .from("fun_circle_story_reactions")
        .select("story_id, reaction_type")
        .eq("user_id", user.id);

      const userReactions = new Map(
        reactions?.map(r => [r.story_id, r.reaction_type as ReactionType]) || []
      );

      // Get mentions for stories
      const storyIds = data?.map(s => s.id) || [];
      const { data: mentions } = await supabase
        .from("fun_circle_mentions")
        .select("story_id, mentioned_user_id")
        .in("story_id", storyIds);

      const mentionsByStory = new Map<string, string[]>();
      mentions?.forEach(m => {
        const existing = mentionsByStory.get(m.story_id) || [];
        mentionsByStory.set(m.story_id, [...existing, m.mentioned_user_id]);
      });

      const storiesWithProfiles = (data || []).map(story => {
        const rawReactions = story.reactions_count as unknown as ReactionCounts;
        return {
          ...story,
          images: story.images || [],
          reactions_count: rawReactions || defaultReactionCounts,
          profile: profiles?.find(p => p.user_id === story.user_id),
          user_reaction: userReactions.get(story.id) || null,
          mentions: mentionsByStory.get(story.id) || [],
        };
      });

      setStories(storiesWithProfiles);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImagesUploadedToday = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("fun_circle_stories")
      .select("images")
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString());

    const count = (data || []).reduce((sum, story) => {
      return sum + (story.images?.length || 0);
    }, 0);

    setImagesUploadedToday(count);
  };

  const createStory = async (content: string, images: string[], mentionedUserIds: string[] = []) => {
    if (!user) return { error: new Error("Not authenticated") };

    if (imagesUploadedToday + images.length > 5) {
      toast({
        title: "Image limit reached",
        description: `You can only upload ${5 - imagesUploadedToday} more images today.`,
        variant: "destructive",
      });
      return { error: new Error("Image limit exceeded") };
    }

    const { data, error } = await supabase
      .from("fun_circle_stories")
      .insert({
        user_id: user.id,
        content,
        images,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to create story",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    // Add mentions if any
    if (mentionedUserIds.length > 0 && data) {
      await supabase.from("fun_circle_mentions").insert(
        mentionedUserIds.map(userId => ({
          story_id: data.id,
          mentioned_user_id: userId,
        }))
      );
    }

    toast({
      title: "Story posted!",
      description: "Your story will disappear in 24 hours.",
    });

    await fetchStories();
    await fetchImagesUploadedToday();
    return { data };
  };

  const addReaction = async (storyId: string, reactionType: ReactionType) => {
    if (!user) return;

    // Check if user already has a reaction
    const story = stories.find(s => s.id === storyId);
    const existingReaction = story?.user_reaction;

    if (existingReaction) {
      if (existingReaction === reactionType) {
        // Remove reaction if same type
        await removeReaction(storyId);
        return;
      }
      // Update reaction
      const { error } = await supabase
        .from("fun_circle_story_reactions")
        .update({ reaction_type: reactionType })
        .eq("story_id", storyId)
        .eq("user_id", user.id);

      if (!error) {
        setStories(prev =>
          prev.map(s => {
            if (s.id === storyId) {
              const newCounts = { ...s.reactions_count };
              if (existingReaction) newCounts[existingReaction]--;
              newCounts[reactionType]++;
              return { ...s, user_reaction: reactionType, reactions_count: newCounts };
            }
            return s;
          })
        );
      }
    } else {
      // Insert new reaction
      const { error } = await supabase
        .from("fun_circle_story_reactions")
        .insert({
          story_id: storyId,
          user_id: user.id,
          reaction_type: reactionType,
        });

      if (!error) {
        setStories(prev =>
          prev.map(s => {
            if (s.id === storyId) {
              const newCounts = { ...s.reactions_count };
              newCounts[reactionType]++;
              return { ...s, user_reaction: reactionType, reactions_count: newCounts };
            }
            return s;
          })
        );
      }
    }
  };

  const removeReaction = async (storyId: string) => {
    if (!user) return;

    const story = stories.find(s => s.id === storyId);
    const existingReaction = story?.user_reaction;

    const { error } = await supabase
      .from("fun_circle_story_reactions")
      .delete()
      .eq("story_id", storyId)
      .eq("user_id", user.id);

    if (!error && existingReaction) {
      setStories(prev =>
        prev.map(s => {
          if (s.id === storyId) {
            const newCounts = { ...s.reactions_count };
            newCounts[existingReaction]--;
            return { ...s, user_reaction: null, reactions_count: newCounts };
          }
          return s;
        })
      );
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("fun_circle_stories")
      .delete()
      .eq("id", storyId)
      .eq("user_id", user.id);

    if (!error) {
      setStories(prev => prev.filter(s => s.id !== storyId));
      toast({ title: "Story deleted" });
    }
  };

  // Comments functions
  const getComments = async (storyId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
      .from("fun_circle_comments")
      .select("*")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true });

    if (error) return [];

    const userIds = [...new Set(data?.map(c => c.user_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .in("user_id", userIds);

    return (data || []).map(comment => ({
      ...comment,
      profile: profiles?.find(p => p.user_id === comment.user_id),
    }));
  };

  const addComment = async (storyId: string, content: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("fun_circle_comments")
      .insert({
        story_id: storyId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    return data;
  };

  useEffect(() => {
    fetchStories();
    fetchImagesUploadedToday();
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("fun_circle_stories_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fun_circle_stories" },
        () => {
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    stories,
    isLoading,
    imagesUploadedToday,
    remainingImages: 5 - imagesUploadedToday,
    createStory,
    addReaction,
    removeReaction,
    deleteStory,
    getComments,
    addComment,
    refreshStories: fetchStories,
  };
}