-- SmartFoodCourt Database Schema Initialization
-- Run this SQL in Supabase SQL Editor to create all tables
-- Execute this ENTIRE script at once

-- 1. Create 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  vendor_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL,
  reservation_type TEXT CHECK (reservation_type IN ('late-meal', 'pre-order', NULL)),
  reservation_date TEXT,
  reservation_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create 'vendor_orders' table
CREATE TABLE IF NOT EXISTS public.vendor_orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'completed')),
  scanned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE,
  UNIQUE(order_id, vendor_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_order_id ON public.vendor_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_vendor_id ON public.vendor_orders(vendor_id);

-- 4. Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL PRIVILEGES ON public.orders TO authenticated, anon;
GRANT ALL PRIVILEGES ON public.vendor_orders TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Done! ✅