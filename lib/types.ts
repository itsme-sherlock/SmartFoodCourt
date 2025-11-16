
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

export interface DayPatternData {
  day: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
  peakHour: string;
}

export interface WeatherData {
  date: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temperature: number;
  humidity: number;
  orders: number;
  revenue: number;
}

export interface CampusEvent {
  id: string;
  name: string;
  date: string;
  expectedCrowd: 'low' | 'medium' | 'high' | 'very-high';
  predictedOrderIncrease: number;
  category: 'sports' | 'cultural' | 'academic' | 'festival' | 'other';
}

export interface AIPrediction {
  date: string;
  predictedOrders: number;
  predictedRevenue: number;
  confidence: number;
  factors: {
    dayOfWeek: number;
    weatherImpact: number;
    eventImpact: number;
    historicalTrend: number;
  };
  recommendation: string;
}

export interface VendorAnalytics {
  vendorId: string;
  period: '7days' | '30days' | '90days';
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  bestDay: string;
  peakHour: string;
  weeklyPattern: DayPatternData[];
  weatherCorrelation: WeatherData[];
  upcomingEvents: CampusEvent[];
  predictions: AIPrediction[];
}

export interface ItemRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  vendorId: string;
  vendorName: string;
  itemName: string;
  description: string;
  requestCount: number;
  timestamp: Date;
  status: 'pending' | 'approved' | 'declined' | 'added';
  votes: number;
}

export interface DiscoveryItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  vendorId: string;
  vendorName: string;
  category: string;
  price: number;
  rating: number;
  isNew: boolean;
  discoverCount: number;
  shares: number;
}

export interface ShareDiscovery {
  id: string;
  itemId: string;
  shareById: string;
  shareByName: string;
  message: string;
  sharedWith: 'friends' | 'all' | 'specific';
  timestamp: Date;
  reactions: number;
  comments: number;
}
