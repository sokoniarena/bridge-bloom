import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Clock, Star, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";

interface SponsorRequest {
  id: string;
  listing_id: string;
  user_id: string;
  status: string;
  duration_days: number;
  requested_at: string;
  admin_notes: string | null;
  listing?: {
    title: string;
    listing_type: string;
    images: string[];
  };
  profile?: {
    username: string;
    email: string;
  };
}

export function SponsorRequestsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SponsorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SponsorRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("sponsor_requests")
      .select("*")
      .order("requested_at", { ascending: false });

    if (!error && data) {
      // Fetch related listings and profiles
      const listingIds = [...new Set(data.map(r => r.listing_id))];
      const userIds = [...new Set(data.map(r => r.user_id))];

      const [{ data: listings }, { data: profiles }] = await Promise.all([
        supabase.from("listings").select("id, title, listing_type, images").in("id", listingIds),
        supabase.from("profiles").select("id, username, email").in("id", userIds),
      ]);

      const listingMap = new Map(listings?.map(l => [l.id, l]) || []);
      const profileMap = new Map((profiles as any[])?.map(p => [p.id, p]) || []);

      const enrichedRequests = data.map(r => ({
        ...r,
        listing: listingMap.get(r.listing_id),
        profile: profileMap.get(r.user_id),
      }));

      setRequests(enrichedRequests);
    }
    setIsLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedRequest || !user) return;
    setIsProcessing(true);

    // Update sponsor request
    const { error: requestError } = await supabase
      .from("sponsor_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: adminNotes || null,
      })
      .eq("id", selectedRequest.id);

    if (requestError) {
      toast({ title: "Error", description: requestError.message, variant: "destructive" });
      setIsProcessing(false);
      return;
    }

    // Update listing to be sponsored
    const sponsoredUntil = addDays(new Date(), selectedRequest.duration_days);
    await supabase
      .from("listings")
      .update({
        is_sponsored: true,
        sponsored_until: sponsoredUntil.toISOString(),
      })
      .eq("id", selectedRequest.listing_id);

    toast({ title: "Request approved", description: "Listing is now sponsored" });
    setSelectedRequest(null);
    setAdminNotes("");
    fetchRequests();
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedRequest || !user) return;
    setIsProcessing(true);

    const { error } = await supabase
      .from("sponsor_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: adminNotes || null,
      })
      .eq("id", selectedRequest.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request rejected" });
      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    }
    setIsProcessing(false);
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Sponsor Requests
            </CardTitle>
            <CardDescription>Review and approve sponsorship requests</CardDescription>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive">{pendingCount} Pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No sponsor requests yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                        {request.listing?.images?.[0] ? (
                          <img 
                            src={request.listing.images[0]} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Star className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">
                          {request.listing?.title || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {request.listing?.listing_type}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{request.profile?.username || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{request.profile?.email}</p>
                  </TableCell>
                  <TableCell>{request.duration_days} days</TableCell>
                  <TableCell>
                    {format(new Date(request.requested_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "approved" ? "default" :
                        request.status === "rejected" ? "destructive" : "secondary"
                      }
                    >
                      {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {request.status === "approved" && <Check className="h-3 w-3 mr-1" />}
                      {request.status === "rejected" && <X className="h-3 w-3 mr-1" />}
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" ? (
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedRequest(request)}
                      >
                        Review
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Review Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRequest?.status === "pending" ? "Review Sponsor Request" : "Request Details"}
              </DialogTitle>
              <DialogDescription>
                {selectedRequest?.listing?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Requester</p>
                  <p className="font-medium">{selectedRequest?.profile?.username}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedRequest?.duration_days} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Requested</p>
                  <p className="font-medium">
                    {selectedRequest && format(new Date(selectedRequest.requested_at), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={
                    selectedRequest?.status === "approved" ? "default" :
                    selectedRequest?.status === "rejected" ? "destructive" : "secondary"
                  }>
                    {selectedRequest?.status}
                  </Badge>
                </div>
              </div>

              {selectedRequest?.status === "pending" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Admin Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this decision..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Approve
                    </Button>
                  </div>
                </>
              ) : (
                selectedRequest?.admin_notes && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Admin Notes:</p>
                    <p className="text-sm">{selectedRequest.admin_notes}</p>
                  </div>
                )
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
