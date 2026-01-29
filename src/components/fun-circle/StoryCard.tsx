import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, MessageCircle, MoreHorizontal, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Story } from "@/hooks/useFunCircleStories";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface StoryCardProps {
  story: Story;
  onLike: (storyId: string) => void;
  onUnlike: (storyId: string) => void;
  onDelete: (storyId: string) => void;
  onStartChat?: (userId: string) => void;
}

export function StoryCard({ story, onLike, onUnlike, onDelete, onStartChat }: StoryCardProps) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const isOwner = user?.id === story.user_id;

  const expiresIn = formatDistanceToNow(new Date(story.expires_at), { addSuffix: true });
  const postedAt = formatDistanceToNow(new Date(story.created_at), { addSuffix: true });

  const handleLikeClick = () => {
    if (story.is_liked) {
      onUnlike(story.id);
    } else {
      onLike(story.id);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <Link 
            to={`/profile/${story.user_id}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={story.profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {story.profile?.username?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{story.profile?.username || "Unknown"}</p>
              <p className="text-xs text-muted-foreground">{postedAt}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <Clock className="h-3 w-3" />
              Expires {expiresIn}
            </Badge>
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onDelete(story.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Story
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Content */}
        {story.content && (
          <div className="px-4 py-2">
            <p className="text-sm whitespace-pre-wrap">{story.content}</p>
          </div>
        )}

        {/* Images */}
        {story.images && story.images.length > 0 && (
          <div className={cn(
            "grid gap-1",
            story.images.length === 1 && "grid-cols-1",
            story.images.length === 2 && "grid-cols-2",
            story.images.length >= 3 && "grid-cols-3"
          )}>
            {story.images.slice(0, 6).map((url, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer overflow-hidden"
                onClick={() => setSelectedImage(url)}
              >
                <img
                  src={url}
                  alt={`Story image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                {index === 5 && story.images.length > 6 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      +{story.images.length - 6}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 p-4 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeClick}
            className={cn(
              "gap-2",
              story.is_liked && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("h-4 w-4", story.is_liked && "fill-current")} />
            {story.likes_count > 0 && story.likes_count}
          </Button>

          {!isOwner && onStartChat && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartChat(story.user_id)}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
          )}
        </div>
      </Card>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <span className="text-2xl">&times;</span>
          </Button>
        </div>
      )}
    </>
  );
}