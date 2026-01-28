import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Grid3X3, LayoutGrid } from "lucide-react";

// Mock data
const mockProducts = [
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
    title: "Toyota Vitz 2018 - Low Mileage",
    price: 950000,
    originalPrice: 1100000,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80",
    location: "Mombasa",
    category: "product" as const,
    rating: 4.7,
  },
  {
    id: "3",
    title: "Samsung 55\" 4K Smart TV",
    price: 65000,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80",
    location: "Kisumu",
    category: "product" as const,
    isFeatured: true,
    rating: 4.8,
  },
  {
    id: "4",
    title: "MacBook Pro M3 14\" - Brand New",
    price: 280000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    location: "Nairobi, CBD",
    category: "product" as const,
    rating: 5.0,
  },
  {
    id: "5",
    title: "Nike Air Jordan 1 Retro High",
    price: 18500,
    originalPrice: 22000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    location: "Nakuru",
    category: "product" as const,
    rating: 4.6,
  },
  {
    id: "6",
    title: "PlayStation 5 Digital Edition",
    price: 75000,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80",
    location: "Eldoret",
    category: "product" as const,
    isSponsored: true,
    rating: 4.9,
  },
  {
    id: "7",
    title: "Leather Sofa Set - 7 Seater",
    price: 85000,
    originalPrice: 95000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",
    location: "Nairobi, Kilimani",
    category: "product" as const,
    rating: 4.5,
  },
  {
    id: "8",
    title: "Canon EOS R6 Mark II",
    price: 320000,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
    location: "Nairobi, Karen",
    category: "product" as const,
    isFeatured: true,
    rating: 4.8,
  },
  {
    id: "9",
    title: "Dining Table Set - 6 Seater Mahogany",
    price: 45000,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80",
    location: "Thika",
    category: "product" as const,
    rating: 4.4,
  },
  {
    id: "10",
    title: "Samsung Galaxy S24 Ultra",
    price: 165000,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80",
    location: "Nairobi, Lavington",
    category: "product" as const,
    rating: 4.9,
  },
  {
    id: "11",
    title: "Mountain Bike - Shimano Gears",
    price: 35000,
    originalPrice: 42000,
    image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500&q=80",
    location: "Naivasha",
    category: "product" as const,
    rating: 4.6,
  },
  {
    id: "12",
    title: "Hisense Double Door Fridge",
    price: 55000,
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&q=80",
    location: "Machakos",
    category: "product" as const,
    rating: 4.5,
  },
];

const categories = [
  "All Categories",
  "Electronics",
  "Vehicles",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Books",
  "Others",
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");

  return (
    <Layout>
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container py-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">
            Discover amazing products from trusted sellers across Kenya
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category */}
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

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            {/* More Filters Button */}
            <Button variant="outline" className="md:w-auto">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{mockProducts.length}</span> products
          </p>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="listing-grid">
          {mockProducts.map((product) => (
            <ListingCard key={product.id} {...product} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-10">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      </div>
    </Layout>
  );
}
