import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UserPlus,
  Check,
  X,
  Search,
  MessageCircle,
  UserMinus,
  Loader2,
  Users,
} from "lucide-react";
import { useFunCircleFriends, Friend, FriendRequest } from "@/hooks/useFunCircleFriends";
import { Link } from "react-router-dom";

interface FriendsPanelProps {
  onStartChat: (userId: string) => void;
}

export function FriendsPanel({ onStartChat }: FriendsPanelProps) {
  const {
    friends,
    pendingRequests,
    sentRequests,
    isLoading,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
  } = useFunCircleFriends();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    user_id: string;
    username: string;
    avatar_url: string | null;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await searchUsers(query);
    
    // Filter out existing friends and pending requests
    const friendIds = new Set(friends.map(f => f.user_id));
    const sentIds = new Set(sentRequests.map(r => r.addressee_id));
    
    setSearchResults(
      results.filter(u => !friendIds.has(u.user_id) && !sentIds.has(u.user_id))
    );
    setIsSearching(false);
  };

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
    setSearchResults(prev => prev.filter(u => u.user_id !== userId));
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Friends
          {friends.length > 0 && (
            <Badge variant="secondary">{friends.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4" style={{ width: "calc(100% - 2rem)" }}>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Requests
              {pendingRequests.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="find">Find</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-0">
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No friends yet</p>
                  <p className="text-sm">Find and add friends to see their stories!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {friends.map((friend) => (
                    <FriendItem
                      key={friend.user_id}
                      friend={friend}
                      onMessage={() => onStartChat(friend.user_id)}
                      onRemove={() => removeFriend(friend.friendship_id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="requests" className="mt-0">
            <ScrollArea className="h-[300px]">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingRequests.map((request) => (
                    <RequestItem
                      key={request.id}
                      request={request}
                      onAccept={() => acceptRequest(request.id)}
                      onReject={() => rejectRequest(request.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="find" className="mt-0">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="h-[250px]">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery.length < 2 ? (
                    <p>Type at least 2 characters to search</p>
                  ) : (
                    <p>No users found</p>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50"
                    >
                      <Link
                        to={`/profile/${user.user_id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.username}</span>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(user.user_id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function FriendItem({
  friend,
  onMessage,
  onRemove,
}: {
  friend: Friend;
  onMessage: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50">
      <Link
        to={`/profile/${friend.user_id}`}
        className="flex items-center gap-3"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={friend.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {friend.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{friend.username}</span>
      </Link>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onMessage}>
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <UserMinus className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

function RequestItem({
  request,
  onAccept,
  onReject,
}: {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50">
      <Link
        to={`/profile/${request.requester_id}`}
        className="flex items-center gap-3"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={request.profile?.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {request.profile?.username?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{request.profile?.username || "Unknown"}</span>
      </Link>
      <div className="flex gap-1">
        <Button variant="default" size="icon" onClick={onAccept}>
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onReject}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}