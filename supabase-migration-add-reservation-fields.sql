-- Migration: Add reservation fields to orders table
-- Run this SQL in your Supabase SQL Editor

-- Add reservation_type column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS reservation_type TEXT CHECK (reservation_type IN ('late-meal', 'pre-order'));

-- Add reservation_date column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS reservation_date TEXT;

-- Add reservation_time column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS reservation_time TEXT;

-- Add comment for documentation
COMMENT ON COLUMN orders.reservation_type IS 'Type of reservation: late-meal or pre-order';
COMMENT ON COLUMN orders.reservation_date IS 'Date of the reservation (YYYY-MM-DD format)';
COMMENT ON COLUMN orders.reservation_time IS 'Time of the reservation (HH:MM format)';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('reservation_type', 'reservation_date', 'reservation_time');