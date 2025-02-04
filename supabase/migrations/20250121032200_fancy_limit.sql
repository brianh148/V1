-- Add photos column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS photos text[] NOT NULL DEFAULT '{}';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS image text;

-- Update image column to use first photo from photos array
UPDATE properties 
SET image = photos[1]
WHERE image IS NULL AND array_length(photos, 1) > 0;

-- Add default image for properties without photos
UPDATE properties
SET image = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
WHERE image IS NULL;