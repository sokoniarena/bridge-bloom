import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

const mockServices = [
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
    title: "Personal Fitness Training",
    price: 4000,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80",
    location: "Nairobi",
    category: "service" as const,
    rating: 4.8,
  },
  {
    id: "s5",
    title: "Wedding Photography & Videography",
    price: 80000,
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=500&q=80",
    location: "Kenya Wide",
    category: "service" as const,
    rating: 4.9,
    isSponsored: true,
  },
  {
    id: "s6",
    title: "Professional Catering Services",
    price: 25000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=500&q=80",
    location: "Nairobi",
    category: "service" as const,
    rating: 4.6,
  },
  {
    id: "s7",
    title: "Plumbing & Electrical Repairs",
    price: 2500,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80",
    location: "Nairobi, Eastlands",
    category: "service" as const,
    rating: 4.5,
  },
  {
    id: "s8",
    title: "Private Tutoring - All Subjects",
    price: 1500,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80",
    location: "Nairobi",
    category: "service" as const,
    rating: 4.8,
  },
];

const categories = [
  "All Categories",
  "Home Services",
  "Professional Services",
  "Health & Fitness",
  "Events & Entertainment",
  "Education & Tutoring",
  "Technology",
  "Beauty & Wellness",
];

export default function Services() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-purple text-white">
        <div className="container py-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Services</h1>
          <p className="text-white/80">
            Find skilled professionals and service providers near you
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
                placeholder="Search services..."
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
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
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
            Showing <span className="font-medium text-foreground">{mockServices.length}</span> services
          </p>
        </div>

        <div className="listing-grid">
          {mockServices.map((service) => (
            <ListingCard key={service.id} {...service} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg">
            Load More Services
          </Button>
        </div>
      </div>
    </Layout>
  );
}
