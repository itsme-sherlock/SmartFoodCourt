
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  vendorId: string;
  vendorName: string;
  selectedPrice: number;
  selectedSize: string;
}

export interface Order {
  orderId: string;
  date: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  orderType?: string;
  selectedSlot?: string;
  reservationType?: 'pre-order' | 'late-meal';
  reservationDate?: string;
  reservationTime?: string;
  id?: string;
  user_id?: string;
  [key: string]: any;
}

export interface VendorPerformance {
  name: string;
  orders: number;
  rating: number;
  waste: string;
  revenue: number;
}

export interface BillingTransaction {
  id: string;
  orderId: string;
  vendorId: string;
  vendorName: string;
  customerName: string;
  amount: number;
  commission: number;
  netAmount: number;
  paymentMethod: string;
  status: string;
  timestamp: Date;
  items: string[];
}
