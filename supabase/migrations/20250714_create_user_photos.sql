-- Create user_photos table to store multiple photos per user
CREATE TABLE IF NOT EXISTS public.user_photos (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON public.user_photos(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own photos
CREATE POLICY "Users can view their own photos"
    ON public.user_photos
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own photos
CREATE POLICY "Users can insert their own photos"
    ON public.user_photos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own photos
CREATE POLICY "Users can update their own photos"
    ON public.user_photos
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
    ON public.user_photos
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create storage bucket for user photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'user-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'user-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'user-photos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public access to read user photos
CREATE POLICY "Public can view user photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'user-photos');
