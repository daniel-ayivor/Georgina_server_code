-- Migration to change serviceType from ENUM to VARCHAR
-- Run this on your PostgreSQL database

-- Step 1: Add a temporary column
ALTER TABLE bookings ADD COLUMN serviceType_temp VARCHAR(255);

-- Step 2: Copy data from old column to temp column
UPDATE bookings SET serviceType_temp = serviceType::text;

-- Step 3: Drop the old column (this will also drop the enum type if not used elsewhere)
ALTER TABLE bookings DROP COLUMN serviceType;

-- Step 4: Rename temp column to serviceType
ALTER TABLE bookings RENAME COLUMN serviceType_temp TO serviceType;

-- Step 5: Make it NOT NULL
ALTER TABLE bookings ALTER COLUMN serviceType SET NOT NULL;

-- Optional: Drop the enum type if it exists and is not used anywhere else
-- DROP TYPE IF EXISTS "enum_bookings_serviceType";
