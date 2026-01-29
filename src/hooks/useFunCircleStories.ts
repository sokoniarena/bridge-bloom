import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Story {
  id: string;
  user_id: string;
  content: string | null;
  images: string[];
  created_at: string;
  expires_at: string;
  likes_count: number;
  views_count: number;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
  is_liked?: boolean;
}

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

      // Get user's likes
      const { data: likes } = await supabase
        .from("fun_circle_story_likes")
        .select("story_id")
        .eq("user_id", user.id);

      const likedStoryIds = new Set(likes?.map(l => l.story_id) || []);

      const storiesWithProfiles = (data || []).map(story => ({
        ...story,
        images: story.images || [],
        profile: profiles?.find(p => p.user_id === story.user_id),
        is_liked: likedStoryIds.has(story.id),
      }));

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

  const createStory = async (content: string, images: string[]) => {
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

    toast({
      title: "Story posted!",
      description: "Your story will disappear in 24 hours.",
    });

    await fetchStories();
    await fetchImagesUploadedToday();
    return { data };
  };

  const likeStory = async (storyId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("fun_circle_story_likes")
      .insert({
        story_id: storyId,
        user_id: user.id,
      });

    if (!error) {
      setStories(prev =>
        prev.map(s =>
          s.id === storyId
            ? { ...s, is_liked: true, likes_count: s.likes_count + 1 }
            : s
        )
      );
    }
  };

  const unlikeStory = async (storyId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("fun_circle_story_likes")
      .delete()
      .eq("story_id", storyId)
      .eq("user_id", user.id);

    if (!error) {
      setStories(prev =>
        prev.map(s =>
          s.id === storyId
            ? { ...s, is_liked: false, likes_count: Math.max(0, s.likes_count - 1) }
            : s
        )
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
    likeStory,
    unlikeStory,
    deleteStory,
    refreshStories: fetchStories,
  };
}