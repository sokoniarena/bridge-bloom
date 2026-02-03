import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Calendar, Heart, Share2, Phone, Mail, 
  ChevronLeft, ChevronRight, Star, Package, Sparkles, 
  Clock, Truck, Tag, User, Loader2, MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@/hooks/useConversation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  listing_type: "product" | "service" | "event";
  category: string | null;
  price: number | null;
  original_price: number | null;
  location: string;
  images: string[] | null;
  is_free: boolean | null;
  is_negotiable: boolean | null;
  delivery_available: boolean | null;
  event_date: string | null;
  is_sponsored: boolean | null;
  is_featured: boolean | null;
  views_count: number | null;
  favorites_count: number | null;
  created_at: string;
  user_id: string;
}

interface Profile {
  username: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  created_at: string;
}

export default function ListingDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { startConversation, isCreating } = useConversation();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
      incrementViews();
    }
  }, [id]);

  useEffect(() => {
    if (listing && user) {
      checkFavorite();
    }
  }, [listing, user]);

  const fetchListing = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, description, listing_type, category, price, original_price, location, images, is_free, is_negotiable, delivery_available, event_date, is_sponsored, is_featured, views_count, favorites_count, created_at, user_id")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Listing not found",
        description: "This listing may have been removed",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setListing(data as Listing);
    
    // Fetch seller profile - profiles table uses 'id' as the user identifier
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, email, phone, avatar_url, is_verified, created_at")
      .eq("id", data.user_id)
      .maybeSingle();
    
    setSeller(profile);

    // Fetch related listings
    const { data: related } = await supabase
      .from("listings")
      .select("id, title, description, listing_type, category, price, original_price, location, images, is_free, is_negotiable, delivery_available, event_date, is_sponsored, is_featured, views_count, favorites_count, created_at, user_id")
      .eq("listing_type", data.listing_type)
      .neq("id", data.id)
      .eq("status", "available")
      .limit(4);

    setRelatedListings((related || []) as Listing[]);
    setIsLoading(false);
  };

  const incrementViews = async () => {
    // Silently increment views - not critical if it fails
    try {
      await supabase
        .from("listings")
        .update({ views_count: (listing?.views_count || 0) + 1 })
        .eq("id", id!);
    } catch {
      // Ignore errors
    }
  };

  const checkFavorite = async () => {
    if (!user || !listing) return;
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("user_id", user.id)
      .maybeSingle();
    
    setIsFavorited(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
      });
      return;
    }

    if (isFavorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("listing_id", listing!.id)
        .eq("user_id", user.id);
      setIsFavorited(false);
      toast({ title: "Removed from favorites" });
    } else {
      await supabase.from("favorites").insert({
        listing_id: listing!.id,
        user_id: user.id,
      });
      setIsFavorited(true);
      toast({ title: "Added to favorites" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: listing?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const nextImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Listing Not Found</h1>
          <p className="text-muted-foreground mb-6">This listing may have been removed or doesn't exist.</p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const TypeIcon = listing.listing_type === "product" ? Package : 
                   listing.listing_type === "service" ? Sparkles : Calendar;

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to={`/${listing.listing_type}s`} className="hover:text-primary capitalize">
            {listing.listing_type}s
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{listing.title}</span>
        </nav>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-3 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
              {listing.images?.length > 0 ? (
                <>
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {listing.images.length > 1 && (
                    <>
                      <Button
                        variant="glass"
                        size="icon"
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="glass"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {listing.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              i === currentImageIndex 
                                ? "bg-white w-4" 
                                : "bg-white/50 hover:bg-white/80"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TypeIcon className="h-20 w-20 text-muted-foreground/50" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {listing.is_sponsored && (
                  <span className="sponsored-badge">
                    <Star className="h-3 w-3" />
                    Sponsored
                  </span>
                )}
                {listing.is_featured && (
                  <Badge className="bg-lavender text-lavender-foreground">Featured</Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {listing.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      i === currentImageIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Price */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {listing.listing_type}
                </Badge>
                {listing.category && (
                  <Badge variant="outline">{listing.category}</Badge>
                )}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">{listing.title}</h1>
              
              {/* Price */}
              <div className="flex items-baseline gap-3">
                {listing.is_free ? (
                  <span className="text-3xl font-bold text-primary">FREE</span>
                ) : listing.price ? (
                  <>
                    {listing.original_price && listing.original_price > listing.price && (
                      <span className="text-lg text-muted-foreground line-through">
                        KES {listing.original_price.toLocaleString()}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-primary">
                      KES {listing.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-lg text-muted-foreground">Price on request</span>
                )}
                {listing.is_negotiable && (
                  <Badge variant="outline" className="text-xs">Negotiable</Badge>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {listing.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                {format(new Date(listing.created_at), "MMM d, yyyy")}
              </div>
              {listing.delivery_available && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Truck className="h-4 w-4" />
                  Delivery available
                </div>
              )}
              {listing.event_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Event: {format(new Date(listing.event_date), "PPP p")}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant={isFavorited ? "default" : "outline"} 
                size="icon"
                onClick={toggleFavorite}
              >
                <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              {/* In-app Message Button */}
              {listing && user?.id !== listing.user_id && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => startConversation(listing.id, listing.user_id)}
                  disabled={isCreating}
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
              )}
              {seller?.phone && (
                <Button asChild className="flex-1">
                  <a href={`https://wa.me/${seller.phone.replace(/\D/g, '')}`} target="_blank">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              )}
              {seller?.phone && (
                <Button variant="outline" asChild className="flex-1">
                  <a href={`tel:${seller.phone}`}>
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                </Button>
              )}
            </div>

            <Separator />

            {/* Seller Card */}
            {seller && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-1">
                        {seller.username}
                        {seller.is_verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Member since {format(new Date(seller.created_at), "MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {seller.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${seller.phone}`} className="hover:text-primary">{seller.phone}</a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${seller.email}`} className="hover:text-primary">{seller.email}</a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Tips */}
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Safety Tips</h4>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Meet in public places for transactions</li>
                  <li>• Verify the item before paying</li>
                  <li>• Never send money in advance</li>
                  <li>• Report suspicious listings</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold mb-6">Related Listings</h2>
            <div className="listing-grid">
              {relatedListings.map((item) => (
                <Link
                  key={item.id}
                  to={`/${item.listing_type}s/${item.id}`}
                  className="listing-card"
                >
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{item.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </div>
                    <p className="text-primary font-bold text-sm">
                      {item.is_free ? "FREE" : item.price ? `KES ${item.price.toLocaleString()}` : "Price on request"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
