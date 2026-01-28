import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";

// Combined mock data
const allListings = [
  // Products
  { id: "1", title: "iPhone 15 Pro Max 256GB", price: 145000, originalPrice: 180000, image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&q=80", location: "Nairobi, Westlands", category: "product" as const, isSponsored: true, rating: 4.9 },
  { id: "2", title: "Toyota Vitz 2018", price: 950000, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80", location: "Mombasa", category: "product" as const, rating: 4.7 },
  { id: "3", title: "Samsung 55\" 4K Smart TV", price: 65000, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80", location: "Kisumu", category: "product" as const, rating: 4.8 },
  { id: "4", title: "MacBook Pro M3 14\"", price: 280000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80", location: "Nairobi, CBD", category: "product" as const, rating: 5.0 },
  // Services
  { id: "s1", title: "Professional Home Cleaning", price: 3500, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", location: "Nairobi", category: "service" as const, rating: 4.9, isSponsored: true },
  { id: "s2", title: "Web Development Services", price: 50000, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80", location: "Remote", category: "service" as const, rating: 5.0 },
  // Events
  { id: "e1", title: "Tech Week 2024", price: 5000, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80", location: "KICC", category: "event" as const, eventDate: "Mar 15", isSponsored: true },
  { id: "e2", title: "Blankets & Wine", price: 3500, image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80", location: "Ngong", category: "event" as const, eventDate: "Mar 22" },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  const filteredListings = allListings.filter((listing) => {
    const matchesQuery = query === "" || 
      listing.title.toLowerCase().includes(query.toLowerCase()) ||
      listing.location.toLowerCase().includes(query.toLowerCase());
    
    const matchesCategory = activeTab === "all" || listing.category === activeTab;
    
    return matchesQuery && matchesCategory;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  return (
    <Layout>
      {/* Search Header */}
      <div className="bg-muted/30 border-b">
        <div className="container py-8">
          <h1 className="font-display text-3xl font-bold mb-4">Search</h1>
          
          <form onSubmit={handleSearch}>
            <div className="flex gap-3 max-w-2xl">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for anything..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="product">Products</TabsTrigger>
              <TabsTrigger value="service">Services</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-muted-foreground mb-6">
          {query && (
            <>
              Showing results for "<span className="font-medium text-foreground">{query}</span>" • 
            </>
          )}
          {" "}<span className="font-medium text-foreground">{filteredListings.length}</span> items found
        </p>

        {/* Grid */}
        {filteredListings.length > 0 ? (
          <div className="listing-grid">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <SearchIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
