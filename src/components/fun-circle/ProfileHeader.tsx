import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Loader2, CheckCircle, Eye } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { ImageCropper } from "./ImageCropper";
import { ProfileCardPreview } from "./ProfileCardPreview";

export function ProfileHeader() {
  const { profile, isLoading, updateAvatar } = useUserProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create a URL for the cropper
    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropperImage(null);
    setIsUploading(true);

    // Convert blob to file
    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
    const result = await updateAvatar(file);

    setIsUploading(false);

    if (result) {
      toast({
        title: "Profile updated",
        description: "Your profile picture has been updated successfully!",
      });
    } else {
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCropCancel = () => {
    setCropperImage(null);
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {profile.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 h-7 w-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
              title="Update profile picture"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-primary-foreground" />
              )}
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{profile.username}</h3>
              {profile.is_verified && (
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
            {profile.location && (
              <p className="text-xs text-muted-foreground mt-1">{profile.location}</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(true)}
            className="shrink-0"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
        
        {profile.bio && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{profile.bio}</p>
        )}
      </Card>

      {/* Image Cropper Dialog */}
      {cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={!!cropperImage}
        />
      )}

      {/* Profile Preview Dialog */}
      {profile && (
        <ProfileCardPreview
          profile={profile}
          open={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
