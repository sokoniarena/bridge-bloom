import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserPlus,
  MapPin,
  Sparkles,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFriendSuggestions, SuggestedFriend } from "@/hooks/useFriendSuggestions";

interface FriendSuggestionsProps {
  onSendRequest: (userId: string) => Promise<{ error: Error | null }>;
  excludeIds: Set<string>;
}

const REASON_CONFIG = {
  location: {
    icon: MapPin,
    label: "Near you",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
  },
  new_member: {
    icon: Sparkles,
    label: "New member",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
  },
  mutual: {
    icon: Users,
    label: "Mutual friends",
    color: "text-green-600 bg-green-50 dark:bg-green-950/50",
  },
  active: {
    icon: TrendingUp,
    label: "Active poster",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-950/50",
  },
  popular: {
    icon: Clock,
    label: "Suggested",
    color: "text-muted-foreground bg-muted",
  },
};

export function FriendSuggestions({ onSendRequest, excludeIds }: FriendSuggestionsProps) {
  const { suggestions, isLoading } = useFriendSuggestions();

  const filteredSuggestions = suggestions.filter(s => !excludeIds.has(s.user_id));

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredSuggestions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground px-4">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="font-medium">No suggestions right now</p>
        <p className="text-sm mt-1">Check back later or search for friends above</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 max-h-[300px]">
      <div className="p-2">
        <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
          People you may know
        </p>
        <div className="space-y-1">
          {filteredSuggestions.map(suggestion => (
            <SuggestionCard
              key={suggestion.user_id}
              suggestion={suggestion}
              onAdd={onSendRequest}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function SuggestionCard({
  suggestion,
  onAdd,
}: {
  suggestion: SuggestedFriend;
  onAdd: (userId: string) => Promise<{ error: Error | null }>;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  
  const config = REASON_CONFIG[suggestion.suggestion_reason];
  const ReasonIcon = config.icon;

  const handleAdd = async () => {
    setIsAdding(true);
    const result = await onAdd(suggestion.user_id);
    setIsAdding(false);
    if (!result.error) {
      setAdded(true);
    }
  };

  if (added) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <Link to={`/profile/${suggestion.user_id}`} className="shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={suggestion.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {suggestion.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link 
          to={`/profile/${suggestion.user_id}`}
          className="flex items-center gap-1.5 hover:underline"
        >
          <span className="font-medium truncate">{suggestion.username}</span>
          {suggestion.is_verified && (
            <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
        </Link>
        
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`inline-flex items-center text-xs px-1.5 py-0.5 rounded-md font-medium ${config.color}`}>
            <ReasonIcon className="h-3 w-3 mr-1" />
            {config.label}
            {suggestion.suggestion_reason === "mutual" && suggestion.mutual_friends_count && (
              <span className="ml-1">({suggestion.mutual_friends_count})</span>
            )}
          </span>
        </div>
        
        {suggestion.location && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            {suggestion.location}
          </p>
        )}
      </div>
      
      <Button
        size="sm"
        onClick={handleAdd}
        disabled={isAdding}
        className="shrink-0"
      >
        {isAdding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-1" />
            Add
          </>
        )}
      </Button>
    </div>
  );
}
