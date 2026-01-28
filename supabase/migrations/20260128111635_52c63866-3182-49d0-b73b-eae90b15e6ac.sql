-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for sponsor_requests (for admin notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.sponsor_requests;

-- Enable realtime for listings updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;

-- Create function to send notification on sponsor approval
CREATE OR REPLACE FUNCTION public.notify_sponsor_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'sponsor_' || NEW.status,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Sponsorship Approved!'
        WHEN NEW.status = 'rejected' THEN 'Sponsorship Rejected'
        ELSE 'Sponsorship Update'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Your listing has been approved for sponsorship and is now promoted!'
        WHEN NEW.status = 'rejected' THEN 'Your sponsorship request was not approved. ' || COALESCE(NEW.admin_notes, '')
        ELSE 'Your sponsorship status has been updated.'
      END,
      jsonb_build_object('listing_id', NEW.listing_id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for sponsor status changes
CREATE TRIGGER on_sponsor_status_change
  AFTER UPDATE ON public.sponsor_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_sponsor_status_change();