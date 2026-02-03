import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Bell, UserPlus, Heart, AtSign, Check, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFunCircleFriends } from "@/hooks/useFunCircleFriends";

interface Notification {
  id: string;
  type: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function FunCircleNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pendingRequests, acceptRequest, rejectRequest } = useFunCircleFriends();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .in("type", ["fun_circle_story", "fun_circle_mention", "friend_request", "friend_accepted"])
        .order("created_at", { ascending: false })
        .limit(50);

      setNotifications((data as Notification[]) || []);
      setIsLoading(false);
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    const { type } = notification;
    
    switch (type) {
      case "friend_request":
        // Stay on this page
        break;
      case "friend_accepted":
        navigate("/fun-circle");
        break;
      case "fun_circle_story":
      case "fun_circle_mention":
      default:
        navigate("/fun-circle");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "friend_request":
      case "friend_accepted":
        return <UserPlus className="h-5 w-5" />;
      case "fun_circle_mention":
        return <AtSign className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  return (
    <Layout>
      <div className="container py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/fun-circle">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Fun Circle Notifications</h1>
            <p className="text-sm text-muted-foreground">Friend requests and activity</p>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Friend Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <div className="divide-y">
                      {notifications.map(notification => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors ${
                            !notification.is_read ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            {getIcon(notification.type || "")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Pending Friend Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4">
                        <Link
                          to={`/profile/${request.requester_id}`}
                          className="flex items-center gap-3"
                        >
                          <Avatar>
                            <AvatarImage src={request.profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {request.profile?.username?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.profile?.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </Link>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => acceptRequest(request.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => rejectRequest(request.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}