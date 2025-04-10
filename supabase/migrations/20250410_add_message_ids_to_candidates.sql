
-- Modify thread_ids column in candidates table to store both message IDs and thread IDs
COMMENT ON COLUMN public.candidates.thread_ids IS 'JSON structure: {"job-id": {"threadId": "thread-id", "messageId": "message-id"}}';
