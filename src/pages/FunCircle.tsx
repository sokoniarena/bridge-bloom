import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { CreateStoryForm } from "@/components/fun-circle/CreateStoryForm";
import { StoryCard } from "@/components/fun-circle/StoryCard";
import { FriendsPanel } from "@/components/fun-circle/FriendsPanel";
import { MessagesDrawer } from "@/components/fun-circle/MessagesDrawer";
import { MobileFriendsSheet } from "@/components/fun-circle/MobileFriendsSheet";
import { ProfileHeader } from "@/components/fun-circle/ProfileHeader";
import { FunCircleSettingsSheet } from "@/components/fun-circle/FunCircleSettingsSheet";
import { ThemeToggle } from "@/components/fun-circle/ThemeToggle";
import { FunCircleSettingsProvider } from "@/contexts/FunCircleSettingsContext";
import { useFunCircleStories, ReactionType } from "@/hooks/useFunCircleStories";
import { useFunCircleMessages } from "@/hooks/useFunCircleMessages";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Users, Sparkles, LogIn, Bell, X } from "lucide-react";
import { Link } from "react-router-dom";

function FunCircleContent() {
  const { user } = useAuth();
  const { stories, isLoading, addReaction, deleteStory } = useFunCircleStories();
  const { 
    startConversation, 
    conversations, 
    openConversation,
    currentConversation 
  } = useFunCircleMessages();
  const [showMessages, setShowMessages] = useState(false);
  const [showMobileFriends, setShowMobileFriends] = useState(false);

  const unreadCount = conversations.reduce(
    (sum, c) => sum + (c.unread_count || 0),
    0
  );

  const handleStartChat = async (userId: string) => {
    const conv = await startConversation(userId);
    if (conv) {
      // Find the full conversation with other_user info
      const fullConv = conversations.find(c => c.id === conv.id);
      if (fullConv) {
        await openConversation(fullConv);
      } else {
        await openConversation(conv);
      }
      setShowMessages(true);
    }
  };

  const handleReact = (storyId: string, reactionType: ReactionType) => {
    addReaction(storyId, reactionType);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Sokoni Fun Circle</h1>
            <p className="text-muted-foreground mb-6">
              Connect with friends, share stories, and have fun! Sign in to join the community.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sokoni Fun Circle</h1>
              <p className="text-sm text-muted-foreground">
                Share stories with friends • Stories disappear in 24 hours
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <ThemeToggle />
            <FunCircleSettingsSheet />
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link to="/fun-circle/notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setShowMessages(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Feed */}
          <div className="space-y-6">
            {/* Profile Header with Avatar Update */}
            <ProfileHeader />
            
            {/* Create Story */}
            <CreateStoryForm />

            {/* Stories Feed */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No stories yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Add friends to see their stories, or be the first to share something!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onReact={handleReact}
                    onDelete={deleteStory}
                    onStartChat={handleStartChat}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            <FriendsPanel onStartChat={handleStartChat} />
          </div>
        </div>

        {/* Desktop Messages Drawer */}
        {showMessages && (
          <div className="hidden lg:block fixed inset-y-0 right-0 w-[380px] z-50 shadow-xl bg-background border-l">
            <MessagesDrawer
              isOpen={showMessages}
              onClose={() => setShowMessages(false)}
            />
            <button
              className="absolute top-4 left-4 p-2 rounded-full bg-background shadow hover:bg-accent"
              onClick={() => setShowMessages(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Mobile Friends & Messages */}
        <div className="lg:hidden fixed bottom-20 right-4 flex flex-col gap-2 z-40">
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={() => setShowMobileFriends(true)}
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg relative"
            onClick={() => setShowMessages(true)}
          >
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Mobile Friends Sheet */}
        <MobileFriendsSheet
          isOpen={showMobileFriends}
          onClose={() => setShowMobileFriends(false)}
          onStartChat={(userId) => {
            setShowMobileFriends(false);
            handleStartChat(userId);
          }}
        />

        {/* Mobile Messages Drawer */}
        {showMessages && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <MessagesDrawer isOpen={showMessages} onClose={() => setShowMessages(false)} />
            <button
              className="absolute top-4 right-4 p-2 hover:bg-accent rounded-lg"
              onClick={() => setShowMessages(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function FunCircle() {
  return (
    <FunCircleSettingsProvider>
      <FunCircleContent />
    </FunCircleSettingsProvider>
  );
}