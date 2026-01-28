import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListings } from "@/hooks/useListings";
import { format } from "date-fns";

export function FeaturedListings() {
  const { listings: products, isLoading: productsLoading } = useListings({ type: "product", limit: 30 });
  const { listings: services, isLoading: servicesLoading } = useListings({ type: "service", limit: 30 });
  const { listings: events, isLoading: eventsLoading } = useListings({ type: "event", limit: 30 });

  const isLoading = productsLoading || servicesLoading || eventsLoading;

  const mapListingToCard = (listing: any) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    originalPrice: listing.original_price,
    image: listing.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&q=80",
    location: listing.location,
    category: listing.listing_type as "product" | "service" | "event",
    isSponsored: listing.is_sponsored,
    isFeatured: listing.is_featured,
    rating: listing.favorites_count ? Math.min(5, 4 + listing.favorites_count * 0.1) : undefined,
    eventDate: listing.event_date ? format(new Date(listing.event_date), "MMM d") : undefined,
    isFree: listing.is_free,
  });

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Featured Listings
            </h2>
            <p className="text-muted-foreground text-lg">
              Discover the best deals from trusted sellers
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/search">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full max-w-md mb-8 bg-background/50 p-1">
            <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
            <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
            <TabsTrigger value="events" className="flex-1">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length > 0 ? (
              <div className="listing-grid">
                {products.map((listing) => (
                  <ListingCard key={listing.id} {...mapListingToCard(listing)} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">No products available</p>
            )}
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            {servicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : services.length > 0 ? (
              <div className="listing-grid">
                {services.map((listing) => (
                  <ListingCard key={listing.id} {...mapListingToCard(listing)} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">No services available</p>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length > 0 ? (
              <div className="listing-grid">
                {events.map((listing) => (
                  <ListingCard key={listing.id} {...mapListingToCard(listing)} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">No events available</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
