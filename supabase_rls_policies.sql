-- This script sets up Row Level Security (RLS) for the 'orders' and 'vendor_orders' tables.
-- It includes policies that allow Supabase Realtime to function correctly with RLS enabled.
-- Execute this entire script in your Supabase SQL Editor.

-- Drop existing policies to avoid conflicts.
DROP POLICY IF EXISTS "Allow employees to see their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow employees to create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow employees to update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow vendors to see their stall orders" ON public.orders;
DROP POLICY IF EXISTS "Allow vendors to update their order status" ON public.orders;
DROP POLICY IF EXISTS "Allow realtime access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin access to orders" ON public.orders;

DROP POLICY IF EXISTS "Allow employees to create vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow employees to see vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow vendors to see their vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow realtime access to vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow admin access to vendor_orders" ON public.vendor_orders;

-- ------------------------------------------------
-- Policies for the 'orders' table
-- ------------------------------------------------

-- 1. Enable RLS on the 'orders' table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated users to see all orders (for now - permissive for testing)
CREATE POLICY "Allow authenticated users to read orders"
ON public.orders
FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 3. Allow authenticated users to create orders
CREATE POLICY "Allow authenticated users to insert orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 4. Allow authenticated users to update orders
CREATE POLICY "Allow authenticated users to update orders"
ON public.orders
FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 5. POLICY FOR REALTIME (IMPORTANT)
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

-- 2. Allow authenticated users to read vendor_orders
CREATE POLICY "Allow authenticated users to read vendor_orders"
ON public.vendor_orders
FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 3. Allow authenticated users to insert vendor_orders
CREATE POLICY "Allow authenticated users to insert vendor_orders"
ON public.vendor_orders
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 4. Allow authenticated users to update vendor_orders
CREATE POLICY "Allow authenticated users to update vendor_orders"
ON public.vendor_orders
FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 5. POLICY FOR REALTIME (IMPORTANT)
-- This policy allows the internal Supabase postgres user to read all vendor_orders.
-- This is REQUIRED for Realtime to broadcast changes when RLS is enabled.
CREATE POLICY "Allow realtime access to vendor_orders"
ON public.vendor_orders
FOR SELECT
USING ( session_user = 'postgres' );
