import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, CheckCircle, MessageCircle, UserPlus } from "lucide-react";
import { UserProfile } from "@/hooks/useUserProfile";

interface ProfileCardPreviewProps {
  profile: UserProfile;
  open: boolean;
  onClose: () => void;
}

export function ProfileCardPreview({ profile, open, onClose }: ProfileCardPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center">How Others See Your Profile</DialogTitle>
        </DialogHeader>

        <Card className="p-6 bg-muted/30">
          <div className="text-center">
            {/* Avatar */}
            <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-primary/10">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Name & Verified Badge */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{profile.username}</h3>
              {profile.is_verified && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </div>

            {/* Verified Seller Badge */}
            {profile.is_verified && (
              <Badge variant="secondary" className="mb-3">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Seller
              </Badge>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-muted-foreground mb-4 max-w-[280px] mx-auto">
                {profile.bio}
              </p>
            )}

            {/* Location */}
            {profile.location && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}

            {/* Action Buttons (preview - non-functional) */}
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline" disabled>
                <UserPlus className="h-4 w-4 mr-1" />
                Add Friend
              </Button>
              <Button size="sm" disabled>
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4 pt-4 border-t">
            This is how your profile appears to other Fun Circle users
          </p>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
