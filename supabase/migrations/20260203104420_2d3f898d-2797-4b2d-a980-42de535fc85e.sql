-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Create fun_circle_profiles table for social features
CREATE TABLE IF NOT EXISTS public.fun_circle_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fun_circle_friends table
CREATE TABLE IF NOT EXISTS public.fun_circle_friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Create fun_circle_stories table
CREATE TABLE IF NOT EXISTS public.fun_circle_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fun_circle_story_views table
CREATE TABLE IF NOT EXISTS public.fun_circle_story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Create fun_circle_story_comments table
CREATE TABLE IF NOT EXISTS public.fun_circle_story_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fun_circle_messages table
CREATE TABLE IF NOT EXISTS public.fun_circle_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.fun_circle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_messages ENABLE ROW LEVEL SECURITY;

-- Fun circle profiles policies
CREATE POLICY "Users can view public profiles" ON public.fun_circle_profiles
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.fun_circle_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.fun_circle_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Fun circle friends policies
CREATE POLICY "Users can view their friendships" ON public.fun_circle_friends
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests" ON public.fun_circle_friends
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their friendships" ON public.fun_circle_friends
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete their friendships" ON public.fun_circle_friends
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Fun circle stories policies
CREATE POLICY "Users can view stories from friends or public" ON public.fun_circle_stories
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own stories" ON public.fun_circle_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON public.fun_circle_stories
  FOR DELETE USING (auth.uid() = user_id);

-- Story views policies
CREATE POLICY "Users can view story views" ON public.fun_circle_story_views
  FOR SELECT USING (true);

CREATE POLICY "Users can record their views" ON public.fun_circle_story_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Story comments policies
CREATE POLICY "Users can view story comments" ON public.fun_circle_story_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can add comments" ON public.fun_circle_story_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.fun_circle_story_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Fun circle messages policies
CREATE POLICY "Users can view their messages" ON public.fun_circle_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.fun_circle_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON public.fun_circle_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Enable realtime for stories and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_messages;