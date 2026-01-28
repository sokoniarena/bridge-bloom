import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Calendar } from "lucide-react";

const mockEvents = [
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
  {
    id: "e5",
    title: "Art Exhibition - African Contemporary",
    price: 1500,
    image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=500&q=80",
    location: "GoDown Arts Centre",
    category: "event" as const,
    eventDate: "Mar 20",
  },
  {
    id: "e6",
    title: "Yoga & Wellness Retreat",
    price: 8000,
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&q=80",
    location: "Naivasha",
    category: "event" as const,
    eventDate: "Apr 5",
    isSponsored: true,
  },
  {
    id: "e7",
    title: "Stand-Up Comedy Night",
    price: 2500,
    image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=500&q=80",
    location: "K1 Klubhouse",
    category: "event" as const,
    eventDate: "Mar 28",
  },
  {
    id: "e8",
    title: "Farmers Market - Organic Produce",
    price: 0,
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&q=80",
    location: "Karura Forest",
    category: "event" as const,
    eventDate: "Every Sat",
    isFree: true,
  },
];

const categories = [
  "All Events",
  "Music & Concerts",
  "Business & Networking",
  "Workshops & Classes",
  "Sports & Fitness",
  "Arts & Culture",
  "Food & Drink",
  "Charity & Causes",
];

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [sortBy, setSortBy] = useState("date");

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-accent text-white">
        <div className="container py-12">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8" />
            <h1 className="font-display text-3xl md:text-4xl font-bold">Events</h1>
          </div>
          <p className="text-white/80">
            Discover exciting events, workshops, and gatherings near you
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date: Upcoming</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{mockEvents.length}</span> events
          </p>
        </div>

        <div className="listing-grid">
          {mockEvents.map((event) => (
            <ListingCard key={event.id} {...event} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg">
            Load More Events
          </Button>
        </div>
      </div>
    </Layout>
  );
}
