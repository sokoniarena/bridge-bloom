-- Sokoni Fun Circle: Stories, Friends, and Social Messaging

-- Stories table (posts that disappear after 24 hours)
CREATE TABLE public.fun_circle_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0
);

-- Story likes
CREATE TABLE public.fun_circle_story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.fun_circle_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Friend requests and friendships
CREATE TYPE public.friend_request_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE public.fun_circle_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status friend_request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Fun Circle messages (separate from marketplace messaging)
CREATE TABLE public.fun_circle_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(participant_one, participant_two),
  CHECK (participant_one != participant_two)
);

CREATE TABLE public.fun_circle_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.fun_circle_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.fun_circle_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_circle_messages ENABLE ROW LEVEL SECURITY;

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION public.are_friends(_user_id_1 uuid, _user_id_2 uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fun_circle_friends
    WHERE status = 'accepted'
      AND (
        (requester_id = _user_id_1 AND addressee_id = _user_id_2)
        OR (requester_id = _user_id_2 AND addressee_id = _user_id_1)
      )
  )
$$;

-- Function to count images posted today
CREATE OR REPLACE FUNCTION public.count_user_images_today(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(array_length(images, 1)), 0)::integer
  FROM public.fun_circle_stories
  WHERE user_id = _user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + interval '1 day'
$$;

-- Stories RLS policies
CREATE POLICY "Users can view stories from friends or own stories"
ON public.fun_circle_stories FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.are_friends(auth.uid(), user_id)
);

CREATE POLICY "Users can create their own stories"
ON public.fun_circle_stories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
ON public.fun_circle_stories FOR DELETE
USING (auth.uid() = user_id);

-- Story likes RLS policies
CREATE POLICY "Users can view likes on visible stories"
ON public.fun_circle_story_likes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fun_circle_stories s
    WHERE s.id = story_id
    AND (s.user_id = auth.uid() OR public.are_friends(auth.uid(), s.user_id))
  )
);

CREATE POLICY "Users can like stories they can see"
ON public.fun_circle_story_likes FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.fun_circle_stories s
    WHERE s.id = story_id
    AND (s.user_id = auth.uid() OR public.are_friends(auth.uid(), s.user_id))
  )
);

CREATE POLICY "Users can unlike stories"
ON public.fun_circle_story_likes FOR DELETE
USING (auth.uid() = user_id);

-- Friends RLS policies
CREATE POLICY "Users can view their own friend requests"
ON public.fun_circle_friends FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests"
ON public.fun_circle_friends FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friend requests they received"
ON public.fun_circle_friends FOR UPDATE
USING (auth.uid() = addressee_id);

CREATE POLICY "Users can delete their own friend connections"
ON public.fun_circle_friends FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Conversations RLS policies
CREATE POLICY "Participants can view their conversations"
ON public.fun_circle_conversations FOR SELECT
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can create conversations with friends"
ON public.fun_circle_conversations FOR INSERT
WITH CHECK (
  (auth.uid() = participant_one OR auth.uid() = participant_two)
  AND public.are_friends(participant_one, participant_two)
);

CREATE POLICY "Participants can update their conversations"
ON public.fun_circle_conversations FOR UPDATE
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Messages RLS policies
CREATE POLICY "Participants can view messages"
ON public.fun_circle_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fun_circle_conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

CREATE POLICY "Participants can send messages"
ON public.fun_circle_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.fun_circle_conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

CREATE POLICY "Recipients can mark messages as read"
ON public.fun_circle_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.fun_circle_conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
  AND sender_id != auth.uid()
);

-- Trigger to update likes count
CREATE OR REPLACE FUNCTION public.update_story_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fun_circle_stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fun_circle_stories SET likes_count = likes_count - 1 WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_story_like_change
AFTER INSERT OR DELETE ON public.fun_circle_story_likes
FOR EACH ROW EXECUTE FUNCTION public.update_story_likes_count();

-- Trigger to notify friends when user posts a story
CREATE OR REPLACE FUNCTION public.notify_friends_new_story()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  friend_id UUID;
  poster_username TEXT;
BEGIN
  -- Get poster's username
  SELECT username INTO poster_username FROM public.profiles WHERE user_id = NEW.user_id;
  
  -- Notify all friends
  FOR friend_id IN
    SELECT CASE 
      WHEN requester_id = NEW.user_id THEN addressee_id 
      ELSE requester_id 
    END
    FROM public.fun_circle_friends
    WHERE status = 'accepted'
    AND (requester_id = NEW.user_id OR addressee_id = NEW.user_id)
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      friend_id,
      'fun_circle_story',
      'New Story',
      poster_username || ' posted a new story',
      jsonb_build_object('story_id', NEW.id, 'poster_id', NEW.user_id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_story
AFTER INSERT ON public.fun_circle_stories
FOR EACH ROW EXECUTE FUNCTION public.notify_friends_new_story();

-- Trigger for friend request notifications
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_username TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT username INTO requester_username FROM public.profiles WHERE user_id = NEW.requester_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.addressee_id,
      'friend_request',
      'New Friend Request',
      requester_username || ' wants to be your friend',
      jsonb_build_object('request_id', NEW.id, 'requester_id', NEW.requester_id)
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT username INTO requester_username FROM public.profiles WHERE user_id = NEW.addressee_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.requester_id,
      'friend_accepted',
      'Friend Request Accepted',
      requester_username || ' accepted your friend request',
      jsonb_build_object('friend_id', NEW.addressee_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_friend_request_change
AFTER INSERT OR UPDATE ON public.fun_circle_friends
FOR EACH ROW EXECUTE FUNCTION public.notify_friend_request();

-- Enable realtime for stories and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_friends;

-- Create index for faster expired story queries
CREATE INDEX idx_stories_expires_at ON public.fun_circle_stories(expires_at);
CREATE INDEX idx_stories_user_id ON public.fun_circle_stories(user_id);
CREATE INDEX idx_friends_status ON public.fun_circle_friends(status);
CREATE INDEX idx_fc_messages_conversation ON public.fun_circle_messages(conversation_id);