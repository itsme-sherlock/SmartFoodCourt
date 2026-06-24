-- This script sets up Row Level Security (RLS) for real-time updates.
-- Execute this in your Supabase SQL Editor.

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow realtime access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to read vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow authenticated users to update vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow realtime access to vendor_orders" ON public.vendor_orders;

-- ================================================
-- ORDERS TABLE POLICIES
-- ================================================

-- 1. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Allow all authenticated and anon users to SELECT (read)
CREATE POLICY "Enable read access for all users"
  ON public.orders
  FOR SELECT
  USING (true);

-- 3. Allow all authenticated and anon users to INSERT (create orders)
CREATE POLICY "Enable insert access for all users"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- 4. Allow all authenticated and anon users to UPDATE (update status)
CREATE POLICY "Enable update access for all users"
  ON public.orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. CRITICAL: Allow postgres user for Realtime broadcasts
CREATE POLICY "Enable realtime for postgres"
  ON public.orders
  FOR SELECT
  USING (session_user = 'postgres');

-- ================================================
-- VENDOR_ORDERS TABLE POLICIES
-- ================================================

-- 1. Enable RLS
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;

-- 2. Allow all authenticated and anon users to SELECT
CREATE POLICY "Enable read access for all users"
  ON public.vendor_orders
  FOR SELECT
  USING (true);

-- 3. Allow all authenticated and anon users to INSERT
CREATE POLICY "Enable insert access for all users"
  ON public.vendor_orders
  FOR INSERT
  WITH CHECK (true);

-- 4. Allow all authenticated and anon users to UPDATE
CREATE POLICY "Enable update access for all users"
  ON public.vendor_orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. CRITICAL: Allow postgres user for Realtime broadcasts
CREATE POLICY "Enable realtime for postgres"
  ON public.vendor_orders
  FOR SELECT
  USING (session_user = 'postgres');

-- ================================================
-- VERIFY SETUP
-- ================================================
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('orders', 'vendor_orders') 
AND schemaname = 'public';
