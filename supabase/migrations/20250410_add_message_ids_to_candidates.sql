
-- Modify thread_ids column in candidates table to store both message IDs and thread IDs
COMMENT ON COLUMN public.candidates.thread_ids IS 'JSON structure: {"job-id": {"threadId": "thread-id", "messageId": "message-id"}}';

-- Update any existing data to ensure it's in the right format
-- This is a safe migration that converts any string values to objects with threadId and messageId
-- Note: This is commented out because it would need to be run manually as a data migration
-- DO NOT RUN THIS AUTOMATICALLY without testing on a staging environment first
/*
UPDATE public.candidates
SET thread_ids = (
  SELECT jsonb_object_agg(
    key,
    CASE 
      WHEN jsonb_typeof(value) = 'string' THEN jsonb_build_object('threadId', value, 'messageId', value)
      WHEN jsonb_typeof(value) = 'object' AND value ? 'threadId' AND NOT (value ? 'messageId') THEN 
        jsonb_set(value, '{messageId}', to_jsonb(value->>'threadId'))
      ELSE value
    END
  )
  FROM jsonb_each(thread_ids)
)
WHERE thread_ids IS NOT NULL;
*/
