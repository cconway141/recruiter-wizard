
-- Update the thread_ids structure in candidates table to properly store both thread IDs and message IDs
COMMENT ON COLUMN public.candidates.thread_ids IS 'JSON structure storing thread info as {"job-id": {"threadId": "gmail-thread-id", "messageId": "gmail-message-id"}}';

-- This migration doesn't modify data, it just documents the structure for developers
