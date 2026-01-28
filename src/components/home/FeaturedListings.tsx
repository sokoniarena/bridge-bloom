import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data - will be replaced with real data from Supabase
const mockListings = {
  products: [
    {
      id: "1",
      title: "iPhone 15 Pro Max 256GB - Like New Condition",
      price: 145000,
      originalPrice: 180000,
      image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&q=80",
      location: "Nairobi, Westlands",
      category: "product" as const,
      isSponsored: true,
      rating: 4.9,
    },
    {
      id: "2",
      title: "Toyota Vitz 2018 - Low Mileage, Well Maintained",
      price: 950000,
      originalPrice: 1100000,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80",
      location: "Mombasa",
      category: "product" as const,
      rating: 4.7,
    },
    {
      id: "3",
      title: "Samsung 55\" 4K Smart TV - Crystal UHD",
      price: 65000,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80",
      location: "Kisumu",
      category: "product" as const,
      isFeatured: true,
      rating: 4.8,
    },
    {
      id: "4",
      title: "MacBook Pro M3 14\" - Brand New Sealed",
      price: 280000,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
      location: "Nairobi, CBD",
      category: "product" as const,
      rating: 5.0,
    },
    {
      id: "5",
      title: "Nike Air Jordan 1 Retro High - Size 42",
      price: 18500,
      originalPrice: 22000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      location: "Nakuru",
      category: "product" as const,
      rating: 4.6,
    },
    {
      id: "6",
      title: "PlayStation 5 Digital Edition + 2 Controllers",
      price: 75000,
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80",
      location: "Eldoret",
      category: "product" as const,
      isSponsored: true,
      rating: 4.9,
    },
    {
      id: "7",
      title: "Leather Sofa Set - 7 Seater, Brown",
      price: 85000,
      originalPrice: 95000,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",
      location: "Nairobi, Kilimani",
      category: "product" as const,
      rating: 4.5,
    },
    {
      id: "8",
      title: "Canon EOS R6 Mark II with 24-105mm Lens",
      price: 320000,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
      location: "Nairobi, Karen",
      category: "product" as const,
      isFeatured: true,
      rating: 4.8,
    },
  ],
  services: [
    {
      id: "s1",
      title: "Professional Home Cleaning Services",
      price: 3500,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80",
      location: "Nairobi",
      category: "service" as const,
      rating: 4.9,
      isSponsored: true,
    },
    {
      id: "s2",
      title: "Expert Web & App Development",
      price: 50000,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80",
      location: "Remote / Kenya",
      category: "service" as const,
      rating: 5.0,
      isFeatured: true,
    },
    {
      id: "s3",
      title: "Interior Design Consultation",
      price: 15000,
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80",
      location: "Nairobi, Westlands",
      category: "service" as const,
      rating: 4.7,
    },
    {
      id: "s4",
      title: "Personal Fitness Training - Home Visits",
      price: 4000,
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80",
      location: "Nairobi",
      category: "service" as const,
      rating: 4.8,
    },
  ],
  events: [
    {
      id: "e1",
      title: "Nairobi Tech Week 2024 - Innovation Summit",
      price: 5000,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80",
      location: "KICC, Nairobi",
      category: "event" as const,
      eventDate: "Mar 15",
      isSponsored: true,
    },
    {
      id: "e2",
      title: "Blankets & Wine - Music Festival",
      price: 3500,
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80",
      location: "Ngong Racecourse",
      category: "event" as const,
      eventDate: "Mar 22",
      isFeatured: true,
    },
    {
      id: "e3",
      title: "Photography Workshop for Beginners",
      price: 0,
      image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?w=500&q=80",
      location: "Nairobi National Museum",
      category: "event" as const,
      eventDate: "Mar 18",
      isFree: true,
    },
    {
      id: "e4",
      title: "Startup Pitch Night - Investor Meetup",
      price: 2000,
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&q=80",
      location: "iHub, Nairobi",
      category: "event" as const,
      eventDate: "Mar 25",
    },
  ],
};

export function FeaturedListings() {
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
            <div className="listing-grid">
              {mockListings.products.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            <div className="listing-grid">
              {mockListings.services.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <div className="listing-grid">
              {mockListings.events.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
