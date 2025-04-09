
-- Add thread_ids column to candidates table to store mapping between job IDs and email thread IDs
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS thread_ids JSONB DEFAULT '{}'::jsonb;

-- This column will store a JSON object mapping job IDs to thread IDs
-- Example: {"job-id-1": "thread-id-1", "job-id-2": "thread-id-2"}
