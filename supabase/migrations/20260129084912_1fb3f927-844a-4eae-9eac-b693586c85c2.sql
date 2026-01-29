-- Create storage bucket for Fun Circle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('fun-circle', 'fun-circle', true);

-- Storage policies for Fun Circle bucket
CREATE POLICY "Anyone can view fun circle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'fun-circle');

CREATE POLICY "Authenticated users can upload fun circle images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fun-circle' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own fun circle images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fun-circle' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);