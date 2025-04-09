
-- Create a new table for storing Gmail oauth tokens
CREATE TABLE IF NOT EXISTS public.gmail_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  token_type TEXT,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own tokens
CREATE POLICY "Users can only view their own tokens" 
  ON public.gmail_tokens FOR SELECT 
  USING (auth.uid() = user_id);

-- Only allow users to insert/update their own tokens
CREATE POLICY "Users can only insert their own tokens" 
  ON public.gmail_tokens FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own tokens" 
  ON public.gmail_tokens FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own tokens" 
  ON public.gmail_tokens FOR DELETE 
  USING (auth.uid() = user_id);
