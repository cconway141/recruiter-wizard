
-- Add email_signature and google_linked to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_signature TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS google_linked BOOLEAN DEFAULT FALSE;
