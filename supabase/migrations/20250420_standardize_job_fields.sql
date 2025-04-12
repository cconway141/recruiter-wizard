
-- Backup tables first (in case we need to revert)
CREATE TABLE IF NOT EXISTS flavors_backup AS SELECT * FROM flavors;
CREATE TABLE IF NOT EXISTS jobs_backup AS SELECT * FROM jobs;

-- Alter the flavors table to remove the redundant label column
ALTER TABLE flavors
DROP COLUMN IF EXISTS label;

-- Update jobs table to ensure status is always a string
-- If status is stored as a JSON object, extract the name field
UPDATE jobs 
SET status = status->>'name' 
WHERE json_typeof(status) = 'object';

-- Update jobs table to ensure flavor is always a string
-- If flavor is stored as a JSON object, extract the name field
UPDATE jobs 
SET flavor = flavor->>'name' 
WHERE json_typeof(flavor) = 'object';

-- Update work_details and pay_details to match locale structure
UPDATE jobs AS j
SET 
  work_details = l.work_details,
  pay_details = l.pay_details
FROM locales AS l
WHERE j.locale = l.name AND (j.work_details IS NULL OR j.work_details = '');

-- Add a comment to document the standardized structure
COMMENT ON TABLE jobs IS 'Job records with standardized fields. Status and flavor are strings, locale references locales table.';
