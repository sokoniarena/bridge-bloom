import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MapPin, ExternalLink, Package, Sparkles, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoriteListing {
  id: string;
  title: string;
  price: number | null;
  location: string;
  images: string[];
  listing_type: string;
}

const typeIcons = {
  product: Package,
  service: Sparkles,
  event: Calendar,
};

export function FavoritesList() {
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [listings, setListings] = useState<FavoriteListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteListings = async () => {
      if (!user || favoriteIds.size === 0) {
        setListings([]);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("listings")
        .select("id, title, price, location, images, listing_type")
        .in("id", Array.from(favoriteIds))
        .limit(6);

      setListings(data || []);
      setIsLoading(false);
    };

    fetchFavoriteListings();
  }, [user, favoriteIds]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">No favorites yet</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Save listings you like to find them easily later
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/products">Browse Listings</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4 text-destructive" />
            Your Favorites
          </h3>
          <Button asChild size="sm" variant="ghost">
            <Link to="/favorites">
              View All
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {listings.map((listing) => {
            const TypeIcon = typeIcons[listing.listing_type];
            return (
              <Link
                key={listing.id}
                to={`/${listing.listing_type}s/${listing.id}`}
                className="group relative rounded-lg overflow-hidden border bg-card hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-muted relative">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TypeIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(listing.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                  >
                    <Heart className="h-4 w-4 fill-destructive text-destructive" />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{listing.title}</p>
                  {listing.price && (
                    <p className="text-xs text-primary font-medium">
                      KES {listing.price.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {listing.location}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
