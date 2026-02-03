import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Users, Package, FileText, Search, Trash2, Eye, Loader2, AlertTriangle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { SponsorRequestsManager } from "@/components/admin/SponsorRequestsManager";

interface Listing {
  id: string;
  title: string;
  listing_type: string;
  status: string;
  location: string;
  created_at: string;
  user_id: string;
  profiles?: { username: string | null; email: string } | null;
}

interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  is_verified: boolean | null;
}

export default function Admin() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listings");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalListings: 0,
    totalUsers: 0,
  });

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      // Fetch profiles separately - profiles table uses 'id' as the user identifier
      const userIds = [...new Set(data.map((l) => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, email")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      
      const listingsWithProfiles = data.map((listing) => ({
        ...listing,
        profiles: profileMap.get(listing.user_id) || null,
      }));

      setListings(listingsWithProfiles as Listing[]);
      setStats((prev) => ({ ...prev, totalListings: data.length }));
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, phone, created_at, is_verified")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setUsers(data as UserProfile[]);
      setStats((prev) => ({ ...prev, totalUsers: data.length }));
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchListings(), fetchUsers()]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const handleDeleteListing = async (listingId: string) => {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (error) {
      toast({
        title: "Error deleting listing",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Listing deleted" });
      fetchListings();
    }
  };

  // Filter data based on search
  const filteredListings = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      (u.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-8 pb-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You do not have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-destructive/10">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage listings, users, and view audit logs</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Listings Tab */}
            {activeTab === "listings" && (
              <Card>
                <CardHeader>
                  <CardTitle>All Listings</CardTitle>
                  <CardDescription>Moderate and manage all marketplace listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredListings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {listing.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{listing.listing_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{listing.status}</Badge>
                          </TableCell>
                          <TableCell>{listing.location}</TableCell>
                          <TableCell>{listing.profiles?.username || "Unknown"}</TableCell>
                          <TableCell>{format(new Date(listing.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this listing. This action is logged.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteListing(listing.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Sponsors Tab */}
            {activeTab === "sponsors" && <SponsorRequestsManager />}

            {/* Users Tab */}
            {activeTab === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>View and manage registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={user.is_verified ? "default" : "secondary"}>
                              {user.is_verified ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
