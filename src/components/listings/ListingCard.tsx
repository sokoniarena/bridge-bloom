import { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface ListingCardProps {
  id: string;
  title: string;
  price?: number;
  originalPrice?: number;
  image: string;
  location: string;
  category: "product" | "service" | "event";
  isSponsored?: boolean;
  isFeatured?: boolean;
  rating?: number;
  eventDate?: string;
  isFree?: boolean;
}

export const ListingCard = memo(function ListingCard({
  id,
  title,
  price,
  originalPrice,
  image,
  location,
  category,
  isSponsored = false,
  isFeatured = false,
  rating,
  eventDate,
  isFree = false,
}: ListingCardProps) {
  const categoryPath = category === "product" ? "products" : category === "service" ? "services" : "events";
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(id);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  }, [id, toggleFavorite]);
  
  return (
    <Link to={`/${categoryPath}/${id}`} className="group">
      <article className="listing-card flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <OptimizedImage
            src={image}
            alt={title}
            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
            width={400}
            priority={false}
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {isSponsored && (
              <span className="sponsored-badge">
                <Star className="h-3 w-3" />
                Sponsored
              </span>
            )}
            {isFeatured && (
              <Badge variant="secondary" className="bg-lavender text-lavender-foreground text-xs">
                Featured
              </Badge>
            )}
            {category === "event" && eventDate && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {eventDate}
              </Badge>
            )}
          </div>
          
          {/* Favorite Button */}
          <Button
            variant="glass"
            size="icon"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 transition-opacity",
              isFav ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={handleFavoriteClick}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-destructive text-destructive")} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3">
          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{location}</span>
          </div>

          {/* Price & Rating */}
          <div className="mt-auto flex items-end justify-between">
            <div>
              {isFree ? (
                <span className="text-primary font-bold text-sm">FREE</span>
              ) : price ? (
                <>
                  {originalPrice && (
                    <span className="price-original">KES {originalPrice.toLocaleString()}</span>
                  )}
                  <span className={cn(
                    "price-current",
                    originalPrice && "text-accent"
                  )}>
                    KES {price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">Contact for price</span>
              )}
            </div>
            
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
});
