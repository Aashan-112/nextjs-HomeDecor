-- Run this script in the Supabase SQL Editor to add customer email and phone fields
-- Go to: https://supabase.com/dashboard > Your Project > SQL Editor > New Query

-- Add customer email and phone fields to orders table for anonymous users
-- This allows storing contact info separately from notes for better data organization

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('customer_email', 'customer_phone')
ORDER BY column_name;
