-- Add device_id column to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_stories_device_id ON stories(device_id);
