import { Link } from "react-router-dom";
import { ShoppingBag, Sparkles, Calendar, ArrowRight, Smartphone, Car, Home, Shirt, Dumbbell, Briefcase, Music, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

const mainCategories = [
  {
    id: "products",
    title: "Products",
    description: "Shop electronics, fashion, home goods & more",
    icon: ShoppingBag,
    href: "/products",
    gradient: "from-primary to-green-brand-dark",
    count: "25K+ items",
  },
  {
    id: "services",
    title: "Services",
    description: "Find skilled professionals near you",
    icon: Sparkles,
    href: "/services",
    gradient: "from-lavender to-purple-600",
    count: "15K+ services",
  },
  {
    id: "events",
    title: "Events",
    description: "Discover parties, workshops & gatherings",
    icon: Calendar,
    href: "/events",
    gradient: "from-accent to-rose-600",
    count: "5K+ events",
  },
];

const subCategories = [
  { icon: Smartphone, label: "Electronics", href: "/products?category=electronics" },
  { icon: Car, label: "Vehicles", href: "/products?category=vehicles" },
  { icon: Home, label: "Property", href: "/products?category=property" },
  { icon: Shirt, label: "Fashion", href: "/products?category=fashion" },
  { icon: Dumbbell, label: "Sports", href: "/products?category=sports" },
  { icon: Briefcase, label: "Jobs", href: "/services?category=jobs" },
  { icon: Music, label: "Entertainment", href: "/events?category=entertainment" },
  { icon: Utensils, label: "Food & Dining", href: "/services?category=food" },
];

export function CategorySection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Explore Our Marketplace
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're looking to buy, sell, or discover — we've got you covered
          </p>
        </div>

        {/* Main Category Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={category.href}
                className="group relative overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Background Gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity group-hover:opacity-100",
                  category.gradient
                )} />
                
                {/* Decorative Circle */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
                
                {/* Content */}
                <div className="relative z-10 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-2xl font-bold mb-2">
                    {category.title}
                  </h3>
                  <p className="text-white/80 mb-6">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                    Explore Now
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sub Categories */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {subCategories.map((sub) => {
            const Icon = sub.icon;
            return (
              <Link
                key={sub.label}
                to={sub.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="p-3 rounded-xl bg-background shadow-sm group-hover:shadow-md group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-center">{sub.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
