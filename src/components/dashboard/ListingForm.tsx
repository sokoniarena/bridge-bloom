import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ListingFormProps {
  listing?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const categories = {
  product: ["Electronics", "Vehicles", "Fashion", "Home & Garden", "Sports", "Books", "Others"],
  service: ["Home Services", "Professional Services", "Health & Fitness", "Events", "Education", "Technology", "Beauty"],
  event: ["Music & Concerts", "Business", "Workshops", "Sports", "Arts & Culture", "Food & Drink", "Charity"],
};

export function ListingForm({ listing, onSuccess, onCancel }: ListingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: listing?.title || "",
    description: listing?.description || "",
    listing_type: listing?.listing_type || "product",
    category: listing?.category || "",
    price: listing?.price?.toString() || "",
    original_price: listing?.original_price?.toString() || "",
    location: listing?.location || "",
    is_free: listing?.is_free || false,
    is_negotiable: listing?.is_negotiable || false,
    delivery_available: listing?.delivery_available || false,
    event_date: listing?.event_date ? new Date(listing.event_date).toISOString().slice(0, 16) : "",
    images: listing?.images?.join(", ") || "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to create a listing.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const imagesArray = formData.images
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url);

    const listingData = {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      listing_type: formData.listing_type,
      category: formData.category || null,
      price: formData.price ? parseFloat(formData.price) : null,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      location: formData.location,
      is_free: formData.is_free,
      is_negotiable: formData.is_negotiable,
      delivery_available: formData.delivery_available,
      event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
      images: imagesArray,
      status: "available" as const,
    };

    let error;

    if (listing) {
      // Update existing listing
      const { error: updateError } = await supabase
        .from("listings")
        .update(listingData)
        .eq("id", listing.id);
      error = updateError;
    } else {
      // Create new listing
      const { error: insertError } = await supabase
        .from("listings")
        .insert(listingData);
      error = insertError;
    }

    if (error) {
      toast({
        title: listing ? "Error updating listing" : "Error creating listing",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: listing ? "Listing updated!" : "Listing created!",
        description: "Your listing is now live.",
      });
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Listing Type */}
      <div className="space-y-2">
        <Label>Listing Type *</Label>
        <Select
          value={formData.listing_type}
          onValueChange={(value) => handleChange("listing_type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="event">Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter a descriptive title"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe your listing in detail"
          rows={4}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleChange("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories[formData.listing_type as keyof typeof categories]?.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (KES)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="0"
            disabled={formData.is_free}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="original_price">Original Price (optional)</Label>
          <Input
            id="original_price"
            type="number"
            value={formData.original_price}
            onChange={(e) => handleChange("original_price", e.target.value)}
            placeholder="0"
            disabled={formData.is_free}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="e.g., Nairobi, Westlands"
          required
        />
      </div>

      {/* Event Date (only for events) */}
      {formData.listing_type === "event" && (
        <div className="space-y-2">
          <Label htmlFor="event_date">Event Date & Time</Label>
          <Input
            id="event_date"
            type="datetime-local"
            value={formData.event_date}
            onChange={(e) => handleChange("event_date", e.target.value)}
          />
        </div>
      )}

      {/* Images */}
      <div className="space-y-2">
        <Label htmlFor="images">Image URLs (comma-separated)</Label>
        <Input
          id="images"
          value={formData.images}
          onChange={(e) => handleChange("images", e.target.value)}
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
        />
        <p className="text-xs text-muted-foreground">
          Enter image URLs separated by commas. Maximum 5 images.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="is_free"
            checked={formData.is_free}
            onCheckedChange={(checked) => handleChange("is_free", checked)}
          />
          <Label htmlFor="is_free" className="cursor-pointer">
            This is free
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="is_negotiable"
            checked={formData.is_negotiable}
            onCheckedChange={(checked) => handleChange("is_negotiable", checked)}
          />
          <Label htmlFor="is_negotiable" className="cursor-pointer">
            Price is negotiable
          </Label>
        </div>

        {formData.listing_type === "product" && (
          <div className="flex items-center gap-3">
            <Checkbox
              id="delivery_available"
              checked={formData.delivery_available}
              onCheckedChange={(checked) => handleChange("delivery_available", checked)}
            />
            <Label htmlFor="delivery_available" className="cursor-pointer">
              Delivery available
            </Label>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {listing ? "Update Listing" : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}
