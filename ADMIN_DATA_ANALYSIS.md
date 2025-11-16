# Admin Dashboard - Database vs Mock Data Analysis

## Current Admin Dashboard Stats

The admin dashboard currently displays 4 key metrics:
1. **Total Vendors** - 4 (hardcoded)
2. **Active Orders** - 127 (hardcoded)
3. **Today Revenue** - ₹24,500 (hardcoded)
4. **Avg Wait Time** - 8 mins (hardcoded)

Plus a Vendor Performance table with metrics for ratings, waste %, etc.

---

## What We CAN Get from Supabase Database

### From `orders` table:
✅ **Total Orders (today)** - Query orders where `created_at` is today
✅ **Active Orders** - Count orders where `status` IN ('pending', 'preparing', 'ready')
✅ **Today's Revenue** - SUM of `total` where `created_at` is today
✅ **Revenue by Vendor** - GROUP BY vendor_id, SUM(total)
✅ **Order Status Distribution** - COUNT GROUP BY status
✅ **Order Timing Data** - Can calculate avg wait time from `created_at` and `updated_at`

### From `vendor_orders` table:
✅ **Vendor Order Count** - Per vendor from `order_id` records
✅ **Vendor Performance** - Group by vendor_id, count orders
✅ **Order Completion Rate** - COUNT where status='completed' / total

### From `mockVendors` (vendor master data):
✅ **Vendor Names & Info** - Already available in memory
✅ **Vendor Rating** - Currently in mockVendors, could be moved to DB

---

## What We NEED as Mock Data (Not in DB)

❌ **Waste %** - No waste tracking in current DB schema
   - Would need: `waste_items` table or field in orders
   - For now: Keep as mock

❌ **Vendor Ratings** - Currently in mockVendors
   - Would need: `vendor_ratings` table or field
   - For now: Keep in mockVendors

❌ **Average Wait Time** - Calculation possible but needs timestamps
   - Current issue: `created_at` and `updated_at` timestamps needed
   - For now: Keep as mock

---

## Data Transformation Required

### Current Order Interface (AuthContext):
```typescript
export interface Order {
  orderId: string;
  userId: string;
  userName: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  orderType: 'now' | 'slot';
  selectedSlot?: string;
  reservationType?: 'late-meal' | 'pre-order';
  reservationDate?: string;
  reservationTime?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  timestamp: number;  // ← Used as date reference
  date: string;
}
```

### Supabase DBOrder Interface:
```typescript
export interface DBOrder {
  id?: string;
  order_id: string;
  user_id: string;
  user_name: string;
  vendor_id: string;
  vendor_name: string;
  items: any[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  payment_method: string;
  reservation_type?: 'late-meal' | 'pre-order';
  reservation_date?: string;
  reservation_time?: string;
  created_at?: string;  // ← ISO timestamp
  updated_at?: string;
}
```

**Mapping needed:**
- `timestamp` (number) → needs to come from `created_at` (ISO string)
- `orderId` ← `order_id`
- `userName` ← `user_name`
- `total` ← `total`
- `status` ← `status`
- `paymentMethod` ← `payment_method`

---

## Implementation Plan for Admin Dashboard

### Phase 1: Quick Stats (Easy - Use DB)
```typescript
// Functions to add to AuthContext or new AdminService

1. getTodayOrderCount() 
   - Query: SELECT COUNT(*) FROM orders WHERE DATE(created_at) = TODAY

2. getActiveOrderCount()
   - Query: SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'preparing', 'ready')

3. getTodayRevenue()
   - Query: SELECT SUM(total) FROM orders WHERE DATE(created_at) = TODAY

4. getVendorOrderCounts()
   - Query: SELECT vendor_id, COUNT(*) as order_count FROM orders GROUP BY vendor_id
   - Also get vendor names from mockVendors
```

### Phase 2: Vendor Performance (Mix of DB + Mock)
```typescript
// For each vendor from mockVendors:
const vendorPerformance = {
  name: vendor.name,           // ← from mockVendors
  rating: vendor.rating,       // ← from mockVendors (MOCK)
  orders: orderCount,          // ← from DB query
  waste: '8%',                 // ← MOCK (not in DB)
  revenue: totalRevenue,       // ← from DB
  completionRate: 95%          // ← from DB
}
```

### Phase 3: Enhanced Stats (Future - Needs DB Schema Update)
```
These would require additional tables:
- Waste tracking table (items discarded)
- Customer ratings/reviews table (for ratings by customers, not just mock)
- Order timing analytics (for accurate wait times)
```

---

## Recommended Mock Data to Keep (For Now)

```typescript
// In AdminDashboard component
const mockVendorMetrics = {
  wastePercentage: {
    'vendor_1': '8%',
    'vendor_2': '6%',
    'vendor_3': '5%',
    'vendor_4': '10%',
  },
  // This would be replaced once waste tracking is implemented in DB
};

// For ratings - keep from mockVendors
// For wait times - calculate average once we have proper timestamps
```

---

## SQL Queries Needed in Supabase

```sql
-- Get today's orders count
SELECT COUNT(*) as total_orders 
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE;

-- Get active orders
SELECT COUNT(*) as active_orders 
FROM orders 
WHERE status IN ('pending', 'preparing', 'ready');

-- Get today's revenue
SELECT SUM(total) as today_revenue 
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE;

-- Get vendor performance
SELECT 
  vendor_id,
  vendor_name,
  COUNT(*) as order_count,
  SUM(total) as revenue,
  COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / 
    COUNT(*) * 100 as completion_rate
FROM orders
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY vendor_id, vendor_name
ORDER BY revenue DESC;
```

---

## Summary Table

| Metric | Source | Status | Notes |
|--------|--------|--------|-------|
| Total Vendors | mockVendors | ✅ Ready | .length property |
| Total Orders (today) | DB (orders table) | ⏳ Needs query | Query by DATE(created_at) |
| Active Orders | DB (orders table) | ⏳ Needs query | WHERE status IN ('pending', 'preparing', 'ready') |
| Today's Revenue | DB (orders table) | ⏳ Needs query | SUM(total) WHERE DATE = today |
| Avg Wait Time | DB (orders table) | ❌ Mock | Needs created_at → updated_at diff |
| Vendor Count | mockVendors | ✅ Ready | Display order count from DB |
| Vendor Rating | mockVendors | ✅ Ready | Currently mock, not stored in DB |
| Vendor Waste % | MOCK | ❌ Mock | No tracking in current schema |
| Vendor Revenue | DB (orders table) | ⏳ Needs query | GROUP BY vendor_id |

---

## Next Steps

1. **Add query functions to AuthContext** for real-time DB queries
2. **Update Admin Dashboard component** to call these functions
3. **Keep mockData** for waste % and ratings (for now)
4. **Display real data** for orders and revenue
5. **Add Supabase credentials** to .env.local
6. **Create DB tables** in Supabase dashboard (if not already done)
