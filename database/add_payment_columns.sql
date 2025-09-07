-- Add missing columns to the orders table for Pakistani payment integration
-- Run this script in your Supabase SQL Editor

-- Add payment-related columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_provider TEXT,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;

-- Add currency column if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR';

-- Add comprehensive address fields if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_first_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_last_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_company TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_state TEXT,
ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT,
ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'PK',
ADD COLUMN IF NOT EXISTS billing_first_name TEXT,
ADD COLUMN IF NOT EXISTS billing_last_name TEXT,
ADD COLUMN IF NOT EXISTS billing_company TEXT,
ADD COLUMN IF NOT EXISTS billing_address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS billing_address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_state TEXT,
ADD COLUMN IF NOT EXISTS billing_postal_code TEXT,
ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'PK';

-- Add amount breakdown columns if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10,2) DEFAULT 0;

-- Add order management columns if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create payment_transactions table for transaction logging
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  transaction_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webhook_logs table for audit trail
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  webhook_type TEXT,
  order_id TEXT,
  transaction_id TEXT,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_order_id ON webhook_logs(order_id);

-- Update existing orders to have order numbers if they don't have them
UPDATE orders 
SET order_number = 'ORD-' || EXTRACT(EPOCH FROM created_at)::bigint || '-' || SUBSTRING(id::text FROM 1 FOR 8)
WHERE order_number IS NULL;

-- Add constraints (with error handling for existing constraints)
DO $$ 
BEGIN
    -- Add payment status constraint if it doesn't exist
    BEGIN
        ALTER TABLE orders ADD CONSTRAINT chk_payment_status 
        CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Add currency constraint if it doesn't exist
    BEGIN
        ALTER TABLE orders ADD CONSTRAINT chk_currency 
        CHECK (currency IN ('PKR'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Grant permissions (adjust as needed for your setup)
-- These might not be necessary depending on your Supabase setup
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payment_transactions TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_logs TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN orders.payment_fee IS 'Fee charged by the payment provider (in PKR)';
COMMENT ON COLUMN orders.payment_provider IS 'Payment provider used (jazzcash, easypaisa, stripe, cod, bank_transfer)';
COMMENT ON COLUMN orders.payment_status IS 'Current payment status of the order';
COMMENT ON COLUMN orders.transaction_id IS 'Transaction ID from payment provider';
COMMENT ON TABLE payment_transactions IS 'Log of all payment transactions for orders';
COMMENT ON TABLE webhook_logs IS 'Log of all webhook calls from payment providers';
