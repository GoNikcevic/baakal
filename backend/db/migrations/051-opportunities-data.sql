-- Extension: add data JSONB to opportunities for notes, phone, sector, location
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
