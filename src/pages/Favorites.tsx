import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Package, Sparkles, CalendarDays, Search } from "lucide-react";

interface FavoriteWithListing {
  id: string;
  listing_id: string;
  created_at: string;
  listings: {
    id: string;
    title: string;
    price: number | null;
    original_price: number | null;
    images: string[];
    location: string;
    listing_type: "product" | "service" | "event";
    is_sponsored: boolean;
    is_featured: boolean;
    is_free: boolean;
    event_date: string | null;
    status: string;
  };
}

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      setIsLoading(true);

      const { data } = await supabase
        .from("favorites")
        .select(
          `
          id,
          listing_id,
          created_at,
          listings (
            id,
            title,
            price,
            original_price,
            images,
            location,
            listing_type,
            is_sponsored,
            is_featured,
            is_free,
            event_date,
            status
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        // Filter out favorites where listing was deleted or status is not available
        const validFavorites = data.filter(
          (f: any) => f.listings && f.listings.status === "available"
        ) as FavoriteWithListing[];
        setFavorites(validFavorites);
      }

      setIsLoading(false);
    };

    fetchFavorites();
  }, [user]);

  const removeFavorite = async (favoriteId: string) => {
    await supabase.from("favorites").delete().eq("id", favoriteId);
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
  };

  const filteredFavorites = favorites.filter((fav) => {
    if (activeTab === "all") return true;
    return fav.listings.listing_type === activeTab;
  });

  const getCounts = () => {
    return {
      products: favorites.filter((f) => f.listings.listing_type === "product")
        .length,
      services: favorites.filter((f) => f.listings.listing_type === "service")
        .length,
      events: favorites.filter((f) => f.listings.listing_type === "event")
        .length,
    };
  };

  const counts = getCounts();

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign In to View Favorites</h1>
          <p className="text-muted-foreground mb-6">
            Keep track of your favorite listings by signing in.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground">
              {favorites.length} saved{" "}
              {favorites.length === 1 ? "listing" : "listings"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">
              No favorites yet
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Start exploring and save your favorite products, services, and
              events for quick access.
            </p>
            <Button asChild>
              <Link to="/search">
                <Search className="h-4 w-4" />
                Explore Listings
              </Link>
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({favorites.length})</TabsTrigger>
              <TabsTrigger value="product">
                <Package className="h-4 w-4 mr-1" />
                Products ({counts.products})
              </TabsTrigger>
              <TabsTrigger value="service">
                <Sparkles className="h-4 w-4 mr-1" />
                Services ({counts.services})
              </TabsTrigger>
              <TabsTrigger value="event">
                <CalendarDays className="h-4 w-4 mr-1" />
                Events ({counts.events})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredFavorites.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <p className="text-muted-foreground">
                    No favorites in this category.
                  </p>
                </div>
              ) : (
                <div className="listing-grid">
                  {filteredFavorites.map((fav) => (
                    <div key={fav.id} className="relative group">
                      <ListingCard
                        id={fav.listings.id}
                        title={fav.listings.title}
                        price={fav.listings.price || 0}
                        originalPrice={
                          fav.listings.original_price || undefined
                        }
                        image={fav.listings.images?.[0] || "/placeholder.svg"}
                        location={fav.listings.location}
                        category={fav.listings.listing_type}
                        isSponsored={fav.listings.is_sponsored}
                        isFeatured={fav.listings.is_featured}
                        isFree={fav.listings.is_free}
                        eventDate={
                          fav.listings.event_date
                            ? new Date(
                                fav.listings.event_date
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : undefined
                        }
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFavorite(fav.id);
                        }}
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
