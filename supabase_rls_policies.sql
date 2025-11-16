-- This script sets up Row Level Security (RLS) for the 'orders' and 'vendor_orders' tables.
-- It includes policies that allow Supabase Realtime to function correctly with RLS enabled.
-- Execute this entire script in your Supabase SQL Editor.

-- Drop existing policies to avoid conflicts.
DROP POLICY IF EXISTS "Allow employees to see their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow employees to create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow vendors to see their stall orders" ON public.orders;
DROP POLICY IF EXISTS "Allow vendors to update their order status" ON public.orders;
DROP POLICY IF EXISTS "Allow realtime access to orders" ON public.orders; -- New policy

DROP POLICY IF EXISTS "Allow employees to create vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow vendors to see their vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Allow realtime access to vendor_orders" ON public.vendor_orders; -- New policy

-- Helper function to get the user's role from their JWT metadata.
-- This assumes you have a 'role' field in the user's app_metadata.
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'app_metadata'::text, '')::jsonb ->> 'role'
$$ LANGUAGE sql STABLE;

-- Helper function to get the user's stall ID from their JWT metadata.
-- This assumes you have a 'stall' field in the user's app_metadata for vendors.
CREATE OR REPLACE FUNCTION auth.get_user_stall_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'app_metadata'::text, '')::jsonb ->> 'stall'
$$ LANGUAGE sql STABLE;


-- ------------------------------------------------
-- Policies for the 'orders' table
-- ------------------------------------------------

-- 1. Enable RLS on the 'orders' table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

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

-- 4. Policy for Vendors: Allow them to see orders that are linked to their stall.
CREATE POLICY "Allow vendors to see their stall orders"
ON public.orders
FOR SELECT
USING (
  auth.get_user_role() = 'vendor' AND
  EXISTS (
    SELECT 1
    FROM public.vendor_orders
    WHERE public.vendor_orders.order_id = public.orders.order_id
    AND public.vendor_orders.vendor_id = auth.get_user_stall_id()
  )
);

-- 5. Policy for Vendors: Allow them to update the status of their orders.
CREATE POLICY "Allow vendors to update their order status"
ON public.orders
FOR UPDATE
USING (
  auth.get_user_role() = 'vendor' AND
  EXISTS (
    SELECT 1
    FROM public.vendor_orders
    WHERE public.vendor_orders.order_id = public.orders.order_id
    AND public.vendor_orders.vendor_id = auth.get_user_stall_id()
  )
);

-- 6. NEW POLICY FOR REALTIME
-- This policy allows the internal Supabase postgres user to read all orders.
-- This is REQUIRED for Realtime to broadcast changes when RLS is forced.
CREATE POLICY "Allow realtime access to orders"
ON public.orders
FOR SELECT
USING ( session_user = 'postgres' );


-- ------------------------------------------------
-- Policies for the 'vendor_orders' table
-- ------------------------------------------------

-- 1. Enable RLS on the 'vendor_orders' table
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_orders FORCE ROW LEVEL SECURITY;

-- 2. Policy for Employees: Allow them to insert entries when creating a new order.
CREATE POLICY "Allow employees to create vendor_orders"
ON public.vendor_orders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE public.orders.order_id = public.vendor_orders.order_id
    AND public.orders.user_id = auth.uid()
  )
);

-- 3. Policy for Vendors: Allow them to see the records related to their stall.
CREATE POLICY "Allow vendors to see their vendor_orders"
ON public.vendor_orders
FOR SELECT
USING (
  auth.get_user_role() = 'vendor' AND
  vendor_id = auth.get_user_stall_id()
);

-- 4. NEW POLICY FOR REALTIME
-- This policy allows the internal Supabase postgres user to read all vendor_orders.
-- This is REQUIRED for Realtime to broadcast changes when RLS is forced.
CREATE POLICY "Allow realtime access to vendor_orders"
ON public.vendor_orders
FOR SELECT
USING ( session_user = 'postgres' );
