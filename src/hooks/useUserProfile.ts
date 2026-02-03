import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  is_verified: boolean;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as unknown as UserProfile);
    }
    setIsLoading(false);
  };

  const updateAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    // Upload to storage
    const fileExt = file.name.split(".").pop();
    const fileName = `avatars/${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("fun-circle")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("fun-circle")
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl } as any)
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return null;
    }

    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
    return avatarUrl;
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    isLoading,
    updateAvatar,
    refreshProfile: fetchProfile,
  };
}
