-- Fix overly permissive INSERT policy on notifications
-- Drop the old policy and create a more restrictive one
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Only allow admins and the system (via triggers) to insert notifications
-- The trigger runs with SECURITY DEFINER so it bypasses RLS
CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));