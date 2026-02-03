import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin,
  Calendar,
  CheckCircle,
  Package,
  Sparkles,
  CalendarDays,
  MessageCircle,
  Phone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Profile {
  id: string;
  username: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  is_verified: boolean | null;
  created_at: string;
}

interface Listing {
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
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;

      setIsLoading(true);

      // Fetch profile - profiles table uses 'id' as the user identifier
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, email, phone, avatar_url, bio, location, is_verified, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch user's listings
      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (listingsData) {
        setListings(listingsData as Listing[]);
      }

      setIsLoading(false);
    };

    fetchProfileData();
  }, [userId]);

  const filteredListings = listings.filter((listing) => {
    if (activeTab === "all") return true;
    return listing.listing_type === activeTab;
  });

  const getCounts = () => {
    return {
      products: listings.filter((l) => l.listing_type === "product").length,
      services: listings.filter((l) => l.listing_type === "service").length,
      events: listings.filter((l) => l.listing_type === "event").length,
    };
  };

  const counts = getCounts();

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-80">
              <div className="bg-card rounded-2xl border p-6 space-y-4">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-full" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This user profile doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Profile Info */}
          <div className="md:w-80 flex-shrink-0">
            <div className="bg-card rounded-2xl border p-6 sticky top-24">
              {/* Avatar */}
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <h1 className="font-display text-xl font-bold flex items-center justify-center gap-2">
                  {profile.username || "User"}
                  {profile.is_verified && (
                    <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                  )}
                </h1>

                {profile.is_verified && (
                  <Badge variant="secondary" className="mt-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Seller
                  </Badge>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-6 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="font-bold">{counts.products}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="font-bold">{counts.services}</p>
                  <p className="text-xs text-muted-foreground">Services</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="font-bold">{counts.events}</p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mt-6 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since{" "}
                    {formatDistanceToNow(new Date(profile.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {/* Contact Buttons */}
              {!isOwnProfile && profile.phone && (
                <div className="mt-6 space-y-2">
                  <Button className="w-full" asChild>
                    <a
                      href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`tel:${profile.phone}`}>
                      <Phone className="h-4 w-4" />
                      Call Seller
                    </a>
                  </Button>
                </div>
              )}

              {isOwnProfile && (
                <Button variant="outline" className="w-full mt-6" asChild>
                  <Link to="/dashboard?tab=profile">Edit Profile</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Main Content - Listings */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
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
                {filteredListings.length === 0 ? (
                  <div className="text-center py-16 bg-muted/30 rounded-2xl">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No listings yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "Create your first listing to start selling!"
                        : "This seller hasn't posted any listings in this category."}
                    </p>
                    {isOwnProfile && (
                      <Button className="mt-4" asChild>
                        <Link to="/dashboard">Create Listing</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="listing-grid">
                    {filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        id={listing.id}
                        title={listing.title}
                        price={listing.price || 0}
                        originalPrice={listing.original_price || undefined}
                        image={listing.images?.[0] || "/placeholder.svg"}
                        location={listing.location}
                        category={listing.listing_type}
                        isSponsored={listing.is_sponsored}
                        isFeatured={listing.is_featured}
                        isFree={listing.is_free}
                        eventDate={
                          listing.event_date
                            ? new Date(listing.event_date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )
                            : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
