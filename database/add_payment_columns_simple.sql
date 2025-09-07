-- Simplified database migration for Pakistani payment integration
-- This version is compatible with all PostgreSQL versions

-- Step 1: Add payment-related columns
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

-- Step 2: Add currency column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR';

-- Step 3: Add comprehensive address fields
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

-- Step 4: Add amount breakdown columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10,2) DEFAULT 0;

-- Step 5: Add order management columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT;

-- Step 6: Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Create webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  webhook_type TEXT,
  order_id TEXT,
  transaction_id TEXT,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_order_id ON webhook_logs(order_id);

-- Step 9: Update existing orders to have order numbers
UPDATE orders 
SET order_number = 'ORD-' || EXTRACT(EPOCH FROM created_at)::bigint || '-' || SUBSTRING(id::text FROM 1 FOR 8)
WHERE order_number IS NULL;

-- Step 10: Add unique constraint to order_number (separate step to avoid conflicts)
-- Note: Only run this if you don't already have this constraint
-- ALTER TABLE orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
