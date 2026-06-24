-- This script sets up Row Level Security (RLS) for the 'orders' and 'vendor_orders' tables.
-- It includes policies that allow Supabase Realtime to function correctly with RLS enabled.
-- Execute this entire script in your Supabase SQL Editor.

-- Drop existing policies to avoid conflicts.
DROP POLICY IF EXISTS "Allow employees to see their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow employees to create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow vendors to see their stall orders" ON public.orders;
DROP POLICY IF EXISTS "Allow vendors to update their order status" ON public.orders;
DROP POLICY IF EXISTS "Allow realtime access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin access to orders" ON public.orders;

DROP POLICY IF EXISTS "Allow employees to create vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow vendors to see their vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow realtime access to vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow admin access to vendor_orders" ON public.vendor_orders;

-- ------------------------------------------------
-- Policies for the 'orders' table
-- ------------------------------------------------

-- 1. Enable RLS on the 'orders' table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Policy for Employees: Allow them to see their own orders.
CREATE POLICY "Allow employees to see their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Policy for Employees: Allow them to create new orders for themselves.
CREATE POLICY "Allow employees to create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Policy for Employees: Allow them to update their own orders.
CREATE POLICY "Allow employees to update their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Policy for Service Role (Admin/API): Allow full access
CREATE POLICY "Allow admin access to orders"
ON public.orders
FOR ALL
USING (
  current_setting('request.headers', true)::json->>'x-api-key' IS NOT NULL
)
WITH CHECK (
  current_setting('request.headers', true)::json->>'x-api-key' IS NOT NULL
);

-- 6. POLICY FOR REALTIME (IMPORTANT)
-- This policy allows the internal Supabase postgres user to read all orders.
-- This is REQUIRED for Realtime to broadcast changes when RLS is enabled.
CREATE POLICY "Allow realtime access to orders"
ON public.orders
FOR SELECT
USING ( session_user = 'postgres' );


-- ------------------------------------------------
-- Policies for the 'vendor_orders' table
-- ------------------------------------------------

-- 1. Enable RLS on the 'vendor_orders' table
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;

-- 2. Policy for Employees: Allow them to insert entries when creating a new order.
CREATE POLICY "Allow employees to create vendor_orders"
ON public.vendor_orders
FOR INSERT
WITH CHECK (true);

-- 3. Policy for Employees: Allow them to see vendor_orders
CREATE POLICY "Allow employees to see vendor_orders"
ON public.vendor_orders
FOR SELECT
USING (true);

-- 4. Policy for Service Role (Admin/API): Allow full access
CREATE POLICY "Allow admin access to vendor_orders"
ON public.vendor_orders
FOR ALL
USING (
  current_setting('request.headers', true)::json->>'x-api-key' IS NOT NULL
)
WITH CHECK (
  current_setting('request.headers', true)::json->>'x-api-key' IS NOT NULL
);

-- 5. POLICY FOR REALTIME (IMPORTANT)
-- This policy allows the internal Supabase postgres user to read all vendor_orders.
-- This is REQUIRED for Realtime to broadcast changes when RLS is enabled.
CREATE POLICY "Allow realtime access to vendor_orders"
ON public.vendor_orders
FOR SELECT
USING ( session_user = 'postgres' );
