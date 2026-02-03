-- Add conversation_id to fun_circle_messages
ALTER TABLE public.fun_circle_messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.fun_circle_conversations(id) ON DELETE CASCADE;

-- Update fun_circle_messages policies to use conversation_id
DROP POLICY IF EXISTS "Users can view their messages" ON public.fun_circle_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.fun_circle_messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.fun_circle_messages;

CREATE POLICY "Users can view their messages" ON public.fun_circle_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM public.fun_circle_conversations c 
      WHERE c.id = conversation_id 
      AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON public.fun_circle_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    (
      receiver_id IS NOT NULL OR
      EXISTS (
        SELECT 1 FROM public.fun_circle_conversations c 
        WHERE c.id = conversation_id 
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update messages" ON public.fun_circle_messages
  FOR UPDATE USING (
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM public.fun_circle_conversations c 
      WHERE c.id = conversation_id 
      AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
  );