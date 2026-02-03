-- Add images column to fun_circle_stories if it doesn't exist
ALTER TABLE public.fun_circle_stories 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add reactions_count column to fun_circle_stories
ALTER TABLE public.fun_circle_stories 
ADD COLUMN IF NOT EXISTS reactions_count JSONB DEFAULT '{"like": 0, "love": 0, "laugh": 0, "wow": 0, "sad": 0, "angry": 0}'::jsonb;

-- Create fun_circle_story_reactions table
CREATE TABLE IF NOT EXISTS public.fun_circle_story_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Create fun_circle_mentions table
CREATE TABLE IF NOT EXISTS public.fun_circle_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, mentioned_user_id)
);

-- Create fun_circle_comments table (separate from story_comments for this feature)
CREATE TABLE IF NOT EXISTS public.fun_circle_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fun_circle_story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_comments ENABLE ROW LEVEL SECURITY;

-- Policies for reactions
CREATE POLICY "Users can view reactions" ON public.fun_circle_story_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can add their reactions" ON public.fun_circle_story_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reactions" ON public.fun_circle_story_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions" ON public.fun_circle_story_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for mentions
CREATE POLICY "Users can view mentions" ON public.fun_circle_mentions
  FOR SELECT USING (true);

CREATE POLICY "Story owners can add mentions" ON public.fun_circle_mentions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.fun_circle_stories s WHERE s.id = story_id AND s.user_id = auth.uid())
  );

-- Policies for comments
CREATE POLICY "Users can view comments" ON public.fun_circle_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can add comments" ON public.fun_circle_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments" ON public.fun_circle_comments
  FOR DELETE USING (auth.uid() = user_id);