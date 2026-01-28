-- Create sponsor requests table for admin-approved sponsored ads
CREATE TABLE public.sponsor_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  duration_days INTEGER NOT NULL DEFAULT 7,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsor_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own sponsor requests
CREATE POLICY "Users can view their own sponsor requests"
ON public.sponsor_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create sponsor requests for their own listings
CREATE POLICY "Users can create sponsor requests"
ON public.sponsor_requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid())
);

-- Admins can view all sponsor requests
CREATE POLICY "Admins can view all sponsor requests"
ON public.sponsor_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update sponsor requests (approve/reject)
CREATE POLICY "Admins can update sponsor requests"
ON public.sponsor_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_sponsor_requests_status ON public.sponsor_requests(status);
CREATE INDEX idx_sponsor_requests_listing ON public.sponsor_requests(listing_id);
CREATE INDEX idx_sponsor_requests_user ON public.sponsor_requests(user_id);