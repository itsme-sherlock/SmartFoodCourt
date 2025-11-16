import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status } = body;
    if (!orderId || !status) return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase service key not configured' }, { status: 500 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update vendor_orders for order and return updated rows
    const { data: vendorUpdateData, error: vendorErr } = await supabaseAdmin
      .from('vendor_orders')
      .update({ status, completed_at: status === 'ready' || status === 'completed' ? new Date() : null })
      .eq('order_id', orderId)
      .select();

    if (vendorErr) {
      console.error('Vendor orders update failed:', vendorErr);
      // Return Supabase error details for easier debugging (dev only)
      return NextResponse.json({ error: 'Failed to update vendor_orders', details: vendorErr }, { status: 500 });
    }

    // Update orders table for the entire order (simplified: set to the new status)
    const { data: mainUpdateData, error: mainErr } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('order_id', orderId)
      .select();

    if (mainErr) {
      console.error('Orders table update failed:', mainErr);
      return NextResponse.json({ error: 'Failed to update orders', details: mainErr }, { status: 500 });
    }

    // Return updated rows to the client so the UI can reconcile state
    const updatedOrder = Array.isArray(mainUpdateData) ? mainUpdateData[0] ?? null : mainUpdateData;
    return NextResponse.json({ success: true, updatedOrder, updatedVendorOrders: vendorUpdateData || [] });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in update-status route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
