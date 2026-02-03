import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Eye, Edit, Trash2, Package, Sparkles, Calendar, TrendingUp, Heart, Loader2, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ListingForm } from "@/components/dashboard/ListingForm";
import { SponsorRequestButton } from "@/components/dashboard/SponsorRequestButton";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { FavoritesList } from "@/components/dashboard/FavoritesList";
import { cn } from "@/lib/utils";

interface Listing {
  id: string;
  title: string;
  listing_type: "product" | "service" | "event";
  status: string;
  price: number | null;
  views_count: number | null;
  favorites_count: number | null;
  created_at: string;
  images: string[] | null;
}

const statusColors = {
  available: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  out_of_stock: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  expired: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const typeIcons = {
  product: Package,
  service: Sparkles,
  event: Calendar,
};

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [dashboardTab, setDashboardTab] = useState(searchParams.get("tab") || "listings");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    views: 0,
    favorites: 0,
  });

  const fetchListings = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, listing_type, status, price, views_count, favorites_count, created_at, images")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching listings",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setListings(data as Listing[]);
      const total = data.length;
      const active = data.filter((l) => l.status === "available").length;
      const views = data.reduce((sum, l) => sum + (l.views_count || 0), 0);
      const favorites = data.reduce((sum, l) => sum + (l.favorites_count || 0), 0);
      setStats({ total, active, views, favorites });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const handleStatusChange = async (listingId: string, newStatus: "available" | "out_of_stock" | "expired" | "draft") => {
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listingId);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      fetchListings();
    }
  };

  const handleDelete = async (listingId: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", listingId);

    if (error) {
      toast({ title: "Error deleting listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing deleted" });
      fetchListings();
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingListing(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchListings();
  };

  const filteredListings = listings.filter((listing) => {
    if (listingTypeFilter === "all") return true;
    return listing.listing_type === listingTypeFilter;
  });

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and profile</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Admin Panel Button - Only visible to admins */}
            {isAdmin && (
              <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                <Link to="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Link>
              </Button>
            )}
            <Tabs value={dashboardTab} onValueChange={(v) => { setDashboardTab(v); setSearchParams({ tab: v }); }}>
              <TabsList>
                <TabsTrigger value="listings">
                  <Package className="h-4 w-4 mr-1" />
                  Listings
                </TabsTrigger>
                <TabsTrigger value="favorites">
                  <Heart className="h-4 w-4 mr-1" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {dashboardTab === "profile" ? (
          <ProfileEditor />
        ) : dashboardTab === "favorites" ? (
          <FavoritesList />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">Total Listings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <TrendingUp className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.active}</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Eye className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.views}</p>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <Heart className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.favorites}</p>
                      <p className="text-sm text-muted-foreground">Favorites</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Listings Card */}
            <Card>
              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="font-semibold text-lg">Your Listings</h2>
                  <div className="flex items-center gap-3">
                    <Tabs value={listingTypeFilter} onValueChange={setListingTypeFilter}>
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="product">Products</TabsTrigger>
                        <TabsTrigger value="service">Services</TabsTrigger>
                        <TabsTrigger value="event">Events</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4" />
                          Create
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingListing ? "Edit Listing" : "Create New Listing"}</DialogTitle>
                          <DialogDescription>
                            {editingListing ? "Update your listing details" : "Fill in the details for your new listing"}
                          </DialogDescription>
                        </DialogHeader>
                        <ListingForm listing={editingListing} onSuccess={handleFormSuccess} onCancel={handleFormClose} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first listing to start selling</p>
                    <Button onClick={() => setIsFormOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Create Listing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredListings.map((listing) => {
                      const TypeIcon = typeIcons[listing.listing_type];
                      return (
                        <div
                          key={listing.id}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                              {listing.images?.[0] ? (
                                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <TypeIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-medium truncate">{listing.title}</h3>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {listing.views_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {listing.favorites_count}
                                </span>
                                {listing.price && <span className="font-medium text-foreground">KES {listing.price.toLocaleString()}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select value={listing.status} onValueChange={(value: "available" | "out_of_stock" | "expired" | "draft") => handleStatusChange(listing.id, value)}>
                              <SelectTrigger className="w-36">
                                <Badge variant="secondary" className={cn("text-xs", statusColors[listing.status])}>
                                  {listing.status.replace("_", " ")}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(listing)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <SponsorRequestButton listingId={listing.id} listingTitle={listing.title} />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone. This will permanently delete your listing.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(listing.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
