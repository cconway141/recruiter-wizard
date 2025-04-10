
-- Update the thread_ids structure in candidates table to properly store both thread IDs and message IDs
COMMENT ON COLUMN public.candidates.thread_ids IS 'JSON structure storing both thread IDs and message IDs: {"job-id": {"threadId": "gmail-thread-id", "messageId": "gmail-message-id"}}';
