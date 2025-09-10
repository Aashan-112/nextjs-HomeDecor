-- Add customer email and phone fields to orders table for anonymous users
-- This allows storing contact info separately from notes for better data organization

ALTER TABLE orders 
ADD COLUMN customer_email TEXT,
ADD COLUMN customer_phone TEXT;

-- Add indexes for better query performance
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
