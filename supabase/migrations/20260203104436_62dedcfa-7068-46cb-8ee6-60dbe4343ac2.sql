-- Add user_id and is_verified columns to profiles if they don't exist
-- Note: user_id might be same as id for profiles linked to auth.users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create fun_circle_conversations table
CREATE TABLE IF NOT EXISTS public.fun_circle_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_one UUID NOT NULL,
  participant_two UUID NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_one, participant_two)
);

-- Enable RLS
ALTER TABLE public.fun_circle_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for fun_circle_conversations
CREATE POLICY "Users can view their conversations" ON public.fun_circle_conversations
  FOR SELECT USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can create conversations" ON public.fun_circle_conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can update their conversations" ON public.fun_circle_conversations
  FOR UPDATE USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.fun_circle_conversations;