import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  const [debouncedSearch, setDebouncedSearch] = useState(options.searchQuery || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query inline to avoid hook ordering issues
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(options.searchQuery || "");
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [options.searchQuery]);

  // Memoize query params to prevent unnecessary refetches
  const queryKey = useMemo(() => 
    JSON.stringify({
      type: options.type,
      category: options.category,
      search: debouncedSearch,
      sortBy: options.sortBy,
      limit: options.limit,
    }),
    [options.type, options.category, debouncedSearch, options.sortBy, options.limit]
  );

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let query = supabase
      .from("listings")
      .select("*")
      .eq("status", "available")
      .eq("is_sponsored", false);

    if (options.type) {
      query = query.eq("listing_type", options.type);
    }

    if (options.category && options.category !== "All Categories" && options.category !== "All Events") {
      query = query.eq("category", options.category);
    }

    if (debouncedSearch) {
      query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
    }

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
        query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
    }

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
  }, [queryKey]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, isLoading, error, refetch: fetchListings };
}
