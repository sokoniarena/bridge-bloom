import { useState, memo, useCallback } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MessageCircle, MoreHorizontal, Trash2, Clock, Heart, SmilePlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Story, ReactionType } from "@/hooks/useFunCircleStories";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { StoryComments } from "./StoryComments";

interface StoryCardProps {
  story: Story;
  onReact: (storyId: string, reactionType: ReactionType) => void;
  onDelete: (storyId: string) => void;
  onStartChat?: (userId: string) => void;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Laugh" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😠", label: "Angry" },
];

export const StoryCard = memo(function StoryCard({ story, onReact, onDelete, onStartChat }: StoryCardProps) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const isOwner = user?.id === story.user_id;

  const expiresIn = formatDistanceToNow(new Date(story.expires_at), { addSuffix: true });
  const postedAt = formatDistanceToNow(new Date(story.created_at), { addSuffix: true });

  const totalReactions = Object.values(story.reactions_count).reduce((a, b) => a + b, 0);
  const currentReaction = REACTIONS.find(r => r.type === story.user_reaction);

  const topReactions = REACTIONS
    .filter(r => story.reactions_count[r.type] > 0)
    .sort((a, b) => story.reactions_count[b.type] - story.reactions_count[a.type])
    .slice(0, 3);

  const handleReact = useCallback((reactionType: ReactionType) => {
    onReact(story.id, reactionType);
    setShowReactionPicker(false);
  }, [story.id, onReact]);

  const handleDelete = useCallback(() => {
    onDelete(story.id);
  }, [story.id, onDelete]);

  const handleStartChat = useCallback(() => {
    onStartChat?.(story.user_id);
  }, [story.user_id, onStartChat]);

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
            {isOwner && (
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                Expires {expiresIn}
              </Badge>
            )}
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
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
                  loading="lazy"
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

        {/* Reactions summary */}
        {totalReactions > 0 && (
          <div className="px-4 pt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <span className="flex -space-x-1">
              {topReactions.map(r => (
                <span key={r.type} className="text-base">{r.emoji}</span>
              ))}
            </span>
            <span>{totalReactions}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 p-3 pt-2 border-t mt-2">
          <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 flex-1",
                  story.user_reaction && "text-primary"
                )}
              >
                {currentReaction ? (
                  <>
                    <span className="text-lg">{currentReaction.emoji}</span>
                    {currentReaction.label}
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    React
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="flex gap-1">
                {REACTIONS.map(reaction => (
                  <button
                    key={reaction.type}
                    onClick={() => handleReact(reaction.type)}
                    className={cn(
                      "p-2 rounded-full hover:bg-muted transition-transform hover:scale-125",
                      story.user_reaction === reaction.type && "bg-primary/10"
                    )}
                    title={reaction.label}
                  >
                    <span className="text-2xl">{reaction.emoji}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2 flex-1"
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </Button>

          {!isOwner && onStartChat && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartChat}
              className="gap-2 flex-1"
            >
              <SmilePlus className="h-4 w-4" />
              Message
            </Button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <StoryComments storyId={story.id} />
        )}
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
});
