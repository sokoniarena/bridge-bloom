import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Sparkles, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  { id: "products", label: "Products", icon: ShoppingBag, color: "bg-primary" },
  { id: "services", label: "Services", icon: Sparkles, color: "bg-lavender" },
  { id: "events", label: "Events", icon: Calendar, color: "bg-accent" },
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative container py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Kenya's Premier Marketplace
          </div>

          {/* Heading */}
          <h1 className="hero-text-gradient font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in-up">
            Discover Amazing Deals in Your Community
          </h1>

          {/* Subheading */}
          <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            Buy, sell, and connect with trusted sellers. From products to services to events — find it all on Sokoni Arena.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-10 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="search-bar max-w-2xl mx-auto">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                type="text"
                placeholder="Search for products, services, or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm" className="shrink-0">
                Search
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant="hero"
                  size="lg"
                  onClick={() => navigate(`/${cat.id}`)}
                  className="group"
                >
                  <div className={`p-1.5 rounded-lg ${cat.color} text-white mr-1`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  Browse {cat.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          {[
            { value: "50K+", label: "Active Listings" },
            { value: "25K+", label: "Trusted Sellers" },
            { value: "100K+", label: "Happy Buyers" },
            { value: "47", label: "Counties Covered" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-white/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
