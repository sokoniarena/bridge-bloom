import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  created_at: string;
}

const ITEMS_PER_PAGE = 12;

const LOCATIONS = [
  "All Locations",
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Nyeri",
];

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Vehicles",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Services",
  "Events",
  "Others",
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [activeTab, setActiveTab] = useState(
    searchParams.get("type") || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [selectedLocation, setSelectedLocation] = useState(
    searchParams.get("location") || "All Locations"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Categories"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "1000000"),
  ]);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Debounce search query and price range for smooth UX
  const debouncedQuery = useDebounce(query, 300);
  const debouncedPriceRange = useDebounce(priceRange, 400);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);

    let queryBuilder = supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("status", "available");

    // Deep search query - search across multiple fields with improved matching
    if (debouncedQuery && debouncedQuery.trim()) {
      const searchTerm = debouncedQuery.trim();
      // Search across title, description, location, category, and subcategory
      queryBuilder = queryBuilder.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,subcategory.ilike.%${searchTerm}%`
      );
    }

    // Category filter (listing type)
    if (activeTab !== "all") {
      const listingType = activeTab as "product" | "service" | "event";
      queryBuilder = queryBuilder.eq("listing_type", listingType);
    }

    // Location filter
    if (selectedLocation !== "All Locations") {
      queryBuilder = queryBuilder.ilike("location", `%${selectedLocation}%`);
    }

    // Category filter (category field)
    if (selectedCategory !== "All Categories") {
      queryBuilder = queryBuilder.eq("category", selectedCategory);
    }

    // Price filter with debounced values
    if (debouncedPriceRange[0] > 0) {
      queryBuilder = queryBuilder.gte("price", debouncedPriceRange[0]);
    }
    if (debouncedPriceRange[1] < 1000000) {
      queryBuilder = queryBuilder.lte("price", debouncedPriceRange[1]);
    }

    // Sorting - Fixed and comprehensive
    switch (sortBy) {
      case "newest":
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
        break;
      case "oldest":
        queryBuilder = queryBuilder.order("created_at", { ascending: true });
        break;
      case "price-low":
        queryBuilder = queryBuilder
          .order("price", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false });
        break;
      case "price-high":
        queryBuilder = queryBuilder
          .order("price", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false });
        break;
      case "popular":
        queryBuilder = queryBuilder
          .order("views_count", { ascending: false })
          .order("favorites_count", { ascending: false })
          .order("created_at", { ascending: false });
        break;
      default:
        // Relevance - sponsored first, then featured, then by views and recency
        queryBuilder = queryBuilder
          .order("is_sponsored", { ascending: false })
          .order("is_featured", { ascending: false })
          .order("views_count", { ascending: false })
          .order("created_at", { ascending: false });
    }

    // Pagination
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, count, error } = await queryBuilder;

    if (error) {
      console.error("Search error:", error);
      setListings([]);
      setTotalCount(0);
    } else if (data) {
      setListings(data as Listing[]);
      setTotalCount(count || 0);
    }

    setIsLoading(false);
  }, [debouncedQuery, activeTab, sortBy, selectedLocation, selectedCategory, debouncedPriceRange, currentPage]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Update URL params when filters change (debounced values for price)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (activeTab !== "all") params.set("type", activeTab);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (selectedLocation !== "All Locations")
      params.set("location", selectedLocation);
    if (selectedCategory !== "All Categories")
      params.set("category", selectedCategory);
    if (debouncedPriceRange[0] > 0) params.set("minPrice", debouncedPriceRange[0].toString());
    if (debouncedPriceRange[1] < 1000000)
      params.set("maxPrice", debouncedPriceRange[1].toString());
    if (currentPage > 1) params.set("page", currentPage.toString());

    setSearchParams(params, { replace: true });
  }, [
    debouncedQuery,
    activeTab,
    sortBy,
    selectedLocation,
    selectedCategory,
    debouncedPriceRange,
    currentPage,
    setSearchParams,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedLocation("All Locations");
    setSelectedCategory("All Categories");
    setPriceRange([0, 1000000]);
    setCurrentPage(1);
    setIsFiltersOpen(false);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Price Range</Label>
          <span className="text-xs text-muted-foreground">
            KES {priceRange[0].toLocaleString()} - KES {priceRange[1].toLocaleString()}
          </span>
        </div>
        <div className="pt-2 pb-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={0}
            max={1000000}
            step={1000}
            minStepsBetweenThumbs={1}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Min Price</Label>
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setPriceRange([Math.min(val, priceRange[1] - 1000), priceRange[1]]);
              }}
              placeholder="0"
              className="h-9"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Max Price</Label>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1000000;
                setPriceRange([priceRange[0], Math.max(val, priceRange[0] + 1000)]);
              }}
              placeholder="1,000,000"
              className="h-9"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={clearFilters}>
          Clear All
        </Button>
        <Button className="flex-1" onClick={() => setIsFiltersOpen(false)}>
          Apply Filters
        </Button>
      </div>
    </div>
  );

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
                    onClick={() => {
                      setQuery("");
                      setCurrentPage(1);
                    }}
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
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v);
              setCurrentPage(1);
            }}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="product">Products</TabsTrigger>
              <TabsTrigger value="service">Services</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            {/* Desktop Filters */}
            <div className="hidden md:block">
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search results
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden">
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search results
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedLocation !== "All Locations" ||
          selectedCategory !== "All Categories" ||
          priceRange[0] > 0 ||
          priceRange[1] < 1000000) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedLocation !== "All Locations" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedLocation("All Locations")}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {selectedLocation}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            {selectedCategory !== "All Categories" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCategory("All Categories")}
              >
                {selectedCategory}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPriceRange([0, 1000000])}
              >
                KES {priceRange[0].toLocaleString()} -{" "}
                {priceRange[1].toLocaleString()}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Results Count */}
        <p className="text-muted-foreground mb-6">
          {debouncedQuery && (
            <>
              Showing results for "
              <span className="font-medium text-foreground">{debouncedQuery}</span>" •{" "}
            </>
          )}
          <span className="font-medium text-foreground">{totalCount}</span>{" "}
          items found
          {sortBy !== "relevance" && (
            <span className="text-xs ml-2">
              (sorted by {sortBy === "newest" ? "newest" : sortBy === "oldest" ? "oldest" : sortBy === "price-low" ? "price ↑" : sortBy === "price-high" ? "price ↓" : "popularity"})
            </span>
          )}
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="listing-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="listing-grid">
              {listings.map((listing) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <SearchIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              No results found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
