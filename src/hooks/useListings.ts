import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Listing = Tables<"listings">;
type ListingType = "product" | "service" | "event";

interface UseListingsOptions {
  type?: ListingType;
  category?: string;
  searchQuery?: string;
  sortBy?: string;
  limit?: number;
}

export function useListings(options: UseListingsOptions = {}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "available")
        // Exclude sponsored listings from regular queries - they only appear in Promoted section
        .eq("is_sponsored", false);

      // Filter by type
      if (options.type) {
        query = query.eq("listing_type", options.type);
      }

      // Filter by category
      if (options.category && options.category !== "All Categories" && options.category !== "All Events") {
        query = query.eq("category", options.category);
      }

      // Search query
      if (options.searchQuery) {
        query = query.or(`title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`);
      }

      // Sorting
      switch (options.sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true, nullsFirst: false });
          break;
        case "price-high":
          query = query.order("price", { ascending: false, nullsFirst: false });
          break;
        case "popular":
          query = query.order("views_count", { ascending: false });
          break;
        case "date":
          query = query.order("event_date", { ascending: true, nullsFirst: false });
          break;
        case "rating":
          query = query.order("favorites_count", { ascending: false });
          break;
        default:
          // Featured listings first within category, then by created_at
          query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      }

      // Limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setListings([]);
      } else {
        setListings(data || []);
      }

      setIsLoading(false);
    };

    fetchListings();
  }, [options.type, options.category, options.searchQuery, options.sortBy, options.limit]);

  return { listings, isLoading, error };
}
