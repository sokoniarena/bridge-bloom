import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useFunCircleStories, Comment } from "@/hooks/useFunCircleStories";
import { Link } from "react-router-dom";

interface StoryCommentsProps {
  storyId: string;
}

export function StoryComments({ storyId }: StoryCommentsProps) {
  const { user } = useAuth();
  const { getComments, addComment } = useFunCircleStories();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadComments = async () => {
    setIsLoading(true);
    const data = await getComments(storyId);
    setComments(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [storyId]);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSending) return;

    setIsSending(true);
    const result = await addComment(storyId, newComment.trim());
    if (result) {
      await loadComments();
      setNewComment("");
    }
    setIsSending(false);
  };

  return (
    <div className="border-t bg-muted/30">
      <ScrollArea className="max-h-[200px] p-3">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <Link to={`/profile/${comment.user_id}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {comment.profile?.username?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="bg-background rounded-lg px-3 py-2">
                    <Link 
                      to={`/profile/${comment.user_id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {comment.profile?.username || "Unknown"}
                    </Link>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-2">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {user && (
        <div className="p-3 pt-0 flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={isSending || !newComment.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}