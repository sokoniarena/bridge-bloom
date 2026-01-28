import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteIds(new Set());
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id);

      if (data) {
        setFavoriteIds(new Set(data.map((f) => f.listing_id)));
      }
      setIsLoading(false);
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    const isFavorite = favoriteIds.has(listingId);

    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);

      if (!error) {
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
        toast({
          title: "Removed from favorites",
          description: "This listing has been removed from your favorites.",
        });
      }
    } else {
      // Add to favorites
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        listing_id: listingId,
      });

      if (!error) {
        setFavoriteIds((prev) => new Set(prev).add(listingId));
        toast({
          title: "Added to favorites",
          description: "This listing has been saved to your favorites.",
        });
      }
    }
  };

  const isFavorite = (listingId: string) => favoriteIds.has(listingId);

  return {
    favoriteIds,
    isLoading,
    toggleFavorite,
    isFavorite,
  };
}
