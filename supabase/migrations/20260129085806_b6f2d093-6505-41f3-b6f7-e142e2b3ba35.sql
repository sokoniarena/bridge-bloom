-- Add reaction types enum
CREATE TYPE public.story_reaction_type AS ENUM ('like', 'love', 'laugh', 'wow', 'sad', 'angry');

-- Replace story_likes with story_reactions
DROP TABLE IF EXISTS public.fun_circle_story_likes;

CREATE TABLE public.fun_circle_story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type story_reaction_type NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Story mentions/tags table
CREATE TABLE public.fun_circle_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, mentioned_user_id)
);

-- Comments table for stories
CREATE TABLE public.fun_circle_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fun_circle_story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_comments ENABLE ROW LEVEL SECURITY;

-- Reactions RLS
CREATE POLICY "Users can view reactions on visible stories"
ON public.fun_circle_story_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fun_circle_stories s
    WHERE s.id = story_id
    AND (s.user_id = auth.uid() OR public.are_friends(auth.uid(), s.user_id))
  )
);

CREATE POLICY "Users can add reactions to visible stories"
ON public.fun_circle_story_reactions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.fun_circle_stories s
    WHERE s.id = story_id
    AND (s.user_id = auth.uid() OR public.are_friends(auth.uid(), s.user_id))
  )
);

CREATE POLICY "Users can update their own reactions"
ON public.fun_circle_story_reactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
ON public.fun_circle_story_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Mentions RLS
CREATE POLICY "Users can view mentions on visible stories"
ON public.fun_circle_mentions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fun_circle_stories s
    WHERE s.id = story_id
    AND (s.user_id = auth.uid() OR public.are_friends(auth.uid(), s.user_id))
  )
  OR mentioned_user_id = auth.uid()
);

CREATE POLICY "Story owners can add mentions"
ON public.fun_circle_mentions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fun_circle_stories s
    WHERE s.id = story_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Story owners can remove mentions"
ON public.fun_circle_mentions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.fun_circle_stories s
    WHERE s.id = story_id AND s.user_id = auth.uid()
  )
);

-- Comments RLS
CREATE POLICY "Users can view comments on visible stories"
ON public.fun_circle_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fun_circle_stories s
    WHERE s.id = story_id
    AND (s.user_id = auth.uid() OR public.are_friends(auth.uid(), s.user_id))
  )
);

CREATE POLICY "Users can add comments to visible stories"
ON public.fun_circle_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.fun_circle_stories s
    WHERE s.id = story_id
    AND (s.user_id = auth.uid() OR public.are_friends(auth.uid(), s.user_id))
  )
);

CREATE POLICY "Users can delete their own comments"
ON public.fun_circle_comments FOR DELETE
USING (auth.uid() = user_id);

-- Update stories table to track reaction counts per type
ALTER TABLE public.fun_circle_stories 
  DROP COLUMN IF EXISTS likes_count,
  ADD COLUMN reactions_count JSONB DEFAULT '{"like":0,"love":0,"laugh":0,"wow":0,"sad":0,"angry":0}'::jsonb;

-- Trigger to update reaction counts
CREATE OR REPLACE FUNCTION public.update_story_reactions_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reaction_counts JSONB;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Calculate new counts
    SELECT jsonb_object_agg(
      reaction_type::text,
      COALESCE(cnt, 0)
    ) INTO reaction_counts
    FROM (
      SELECT reaction_type, COUNT(*) as cnt
      FROM public.fun_circle_story_reactions
      WHERE story_id = COALESCE(NEW.story_id, OLD.story_id)
      GROUP BY reaction_type
    ) counts;
    
    -- Merge with default values
    reaction_counts := '{"like":0,"love":0,"laugh":0,"wow":0,"sad":0,"angry":0}'::jsonb || COALESCE(reaction_counts, '{}'::jsonb);
    
    UPDATE public.fun_circle_stories 
    SET reactions_count = reaction_counts
    WHERE id = COALESCE(NEW.story_id, OLD.story_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_story_reaction_change
AFTER INSERT OR UPDATE OR DELETE ON public.fun_circle_story_reactions
FOR EACH ROW EXECUTE FUNCTION public.update_story_reactions_count();

-- Trigger to notify mentioned users
CREATE OR REPLACE FUNCTION public.notify_mentioned_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  poster_username TEXT;
BEGIN
  SELECT p.username INTO poster_username 
  FROM public.fun_circle_stories s
  JOIN public.profiles p ON p.user_id = s.user_id
  WHERE s.id = NEW.story_id;
  
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.mentioned_user_id,
    'fun_circle_mention',
    'You were mentioned!',
    poster_username || ' mentioned you in a story',
    jsonb_build_object('story_id', NEW.story_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_mentioned
AFTER INSERT ON public.fun_circle_mentions
FOR EACH ROW EXECUTE FUNCTION public.notify_mentioned_user();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_story_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_comments;

-- Indexes
CREATE INDEX idx_reactions_story ON public.fun_circle_story_reactions(story_id);
CREATE INDEX idx_mentions_story ON public.fun_circle_mentions(story_id);
CREATE INDEX idx_mentions_user ON public.fun_circle_mentions(mentioned_user_id);
CREATE INDEX idx_comments_story ON public.fun_circle_comments(story_id);