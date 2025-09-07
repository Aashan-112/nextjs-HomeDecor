-- Check if payment_method column exists and add it if missing
-- Run this in your Supabase SQL Editor

-- First, let's check the current structure of orders table
-- Run this query first to see what columns exist:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' 
-- ORDER BY ordinal_position;

-- Add missing payment_method column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Verify all essential columns exist (add any that are missing)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_fee DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_provider TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_id TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR';

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT;

-- Address columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_first_name TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_last_name TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_company TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_address_line_1 TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_address_line_2 TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_city TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_state TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'PK';

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_first_name TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_last_name TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_company TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_address_line_1 TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_address_line_2 TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_city TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_state TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_postal_code TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'PK';

-- Final verification: Show all columns in orders table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
