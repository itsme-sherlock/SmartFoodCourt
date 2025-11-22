'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, TrendingUp, Cloud, Calendar, BarChart3, LineChart } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';
import AIBadge from '@/components/ui/AIBadge';
import { VendorAnalytics, DayPatternData, WeatherData, CampusEvent, AIPrediction } from '@/lib/types';

export default function VendorForecasting() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Mock data for vendor analytics
  const mockAnalyticsData: VendorAnalytics = {
    vendorId: user?.stall || 'vendor_1',
    period: '30days',
    totalOrders: 847,
    totalRevenue: 84700,
    avgOrderValue: 100,
    bestDay: 'Wednesday',
    peakHour: '12:30 PM - 1:30 PM',
    weeklyPattern: [
      { day: 'Monday', orders: 95, revenue: 9500, avgOrderValue: 100, peakHour: '12:45 PM' },
      { day: 'Tuesday', orders: 110, revenue: 11000, avgOrderValue: 100, peakHour: '1:00 PM' },
      { day: 'Wednesday', orders: 155, revenue: 15500, avgOrderValue: 100, peakHour: '12:30 PM' },
      { day: 'Thursday', orders: 130, revenue: 13000, avgOrderValue: 100, peakHour: '1:15 PM' },
      { day: 'Friday', orders: 145, revenue: 14500, avgOrderValue: 100, peakHour: '12:50 PM' },
      { day: 'Saturday', orders: 125, revenue: 12500, avgOrderValue: 100, peakHour: '2:00 PM' },
      { day: 'Sunday', orders: 87, revenue: 8700, avgOrderValue: 100, peakHour: '1:30 PM' },
    ],
    weatherCorrelation: [
      { date: '2025-11-16', condition: 'sunny', temperature: 28, humidity: 65, orders: 120, revenue: 12000 },
      { date: '2025-11-15', condition: 'cloudy', temperature: 26, humidity: 70, orders: 105, revenue: 10500 },
      { date: '2025-11-14', condition: 'rainy', temperature: 24, humidity: 85, orders: 65, revenue: 6500 },
      { date: '2025-11-13', condition: 'rainy', temperature: 23, humidity: 90, orders: 58, revenue: 5800 },
      { date: '2025-11-12', condition: 'sunny', temperature: 29, humidity: 60, orders: 135, revenue: 13500 },
      { date: '2025-11-11', condition: 'cloudy', temperature: 25, humidity: 75, orders: 98, revenue: 9800 },
      { date: '2025-11-10', condition: 'sunny', temperature: 30, humidity: 55, orders: 142, revenue: 14200 },
    ],
    upcomingEvents: [
      {
        id: 'event_1',
        name: 'Annual Sports Day',
        date: '2025-11-22',
        expectedCrowd: 'very-high',
        predictedOrderIncrease: 45,
        category: 'sports',
      },
      {
        id: 'event_2',
        name: 'Cultural Fest - Day 1',
        date: '2025-11-25',
        expectedCrowd: 'high',
        predictedOrderIncrease: 35,
        category: 'cultural',
      },
      {
        id: 'event_3',
        name: 'Tech Summit',
        date: '2025-11-28',
        expectedCrowd: 'high',
        predictedOrderIncrease: 30,
        category: 'academic',
      },
    ],
    predictions: [
      {
        date: '2025-11-17',
        predictedOrders: 118,
        predictedRevenue: 11800,
        confidence: 92,
        factors: { dayOfWeek: 0.9, weatherImpact: 0.85, eventImpact: 0.0, historicalTrend: 0.88 },
        recommendation: 'Stock up on popular items. Sunday trend shows steady demand.',
      },
      {
        date: '2025-11-18',
        predictedOrders: 95,
        predictedRevenue: 9500,
        confidence: 88,
        factors: { dayOfWeek: 0.75, weatherImpact: 0.8, eventImpact: 0.0, historicalTrend: 0.85 },
        recommendation: 'Monday typically sees lower orders. Focus on efficient operations.',
      },
      {
        date: '2025-11-19',
        predictedOrders: 108,
        predictedRevenue: 10800,
        confidence: 90,
        factors: { dayOfWeek: 0.85, weatherImpact: 0.82, eventImpact: 0.0, historicalTrend: 0.87 },
        recommendation: 'Tuesday shows moderate growth. Prepare for lunch rush.',
      },
      {
        date: '2025-11-22',
        predictedOrders: 225,
        predictedRevenue: 22500,
        confidence: 85,
        factors: { dayOfWeek: 0.95, weatherImpact: 0.9, eventImpact: 0.95, historicalTrend: 0.85 },
        recommendation: 'Sports Day Event - Increase staff and inventory by 40%. Expected peak crowd.',
      },
    ],
  };

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setAnalytics(mockAnalyticsData);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!user || user.role !== 'vendor') {
    return <div className="p-4">Access denied. Please login as a vendor.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Forecasting & Analytics</h1>
              <AIBadge text="AI Powered" />
            </div>
            <p className="text-gray-600 mt-1">Machine learning insights for {user.stall}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <MobileMenu
        userName={user.stall || 'Vendor'}
        menuLinks={[
          { label: '📊 Forecasting', href: '/vendor/forecasting' },
          { label: '📋 Menu Manager', href: '/vendor/menu' },
        ]}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Total Orders (30 days)</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.totalOrders}</p>
                <p className="text-green-600 text-sm mt-2">↑ 12% from previous month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Total Revenue (30 days)</p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-green-600 text-sm mt-2">↑ 15% from previous month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Best Day</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{analytics.bestDay}</p>
                <p className="text-gray-600 text-sm mt-2">Avg 155 orders</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Peak Hour</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{analytics.peakHour}</p>
                <p className="text-gray-600 text-sm mt-2">~40% of daily orders</p>
              </div>
            </div>

            {/* Day of Week Pattern */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Day of Week Patterns</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Day</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Order Value</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Peak Hour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.weeklyPattern.map((day) => (
                      <tr key={day.day} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{day.day}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            day.orders > 130 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {day.orders}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">₹{day.revenue.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-900">₹{day.avgOrderValue}</td>
                        <td className="py-3 px-4 text-gray-900">{day.peakHour}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Insight:</strong> Wednesday shows the highest order volume (155 orders). Consider
                  increasing staff and inventory on Wednesdays to maximize efficiency.
                </p>
              </div>
            </div>

            {/* Weather Impact Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Cloud className="text-cyan-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Weather Impact on Orders</h2>
                </div>
                <AIBadge text="ML Analysis" size="sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm font-medium">☀️ Sunny Days</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-2">~133 orders</p>
                  <p className="text-yellow-700 text-sm mt-1">Highest order volume</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm font-medium">🌧️ Rainy Days</p>
                  <p className="text-2xl font-bold text-red-900 mt-2">~62 orders</p>
                  <p className="text-red-700 text-sm mt-1">50% drop in orders</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Condition</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Temp</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Humidity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.weatherCorrelation.map((data) => (
                      <tr key={data.date} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{data.date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            data.condition === 'sunny'
                              ? 'bg-yellow-100 text-yellow-800'
                              : data.condition === 'rainy'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {data.condition.charAt(0).toUpperCase() + data.condition.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{data.temperature}°C</td>
                        <td className="py-3 px-4 text-gray-900">{data.humidity}%</td>
                        <td className="py-3 px-4 text-gray-900">{data.orders}</td>
                        <td className="py-3 px-4 text-gray-900">₹{data.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-cyan-800">
                  <strong>Recommendation:</strong> Rainy days show a 50% drop in orders. Plan accordingly by
                  reducing staff or offering special rainy day deals to boost sales.
                </p>
              </div>
            </div>

            {/* Upcoming Campus Events */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="text-purple-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Campus Events</h2>
                </div>
                <AIBadge text="Smart Predict" size="sm" />
              </div>
              <div className="space-y-4">
                {analytics.upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">📅 {event.date}</p>
                        <p className="text-sm text-gray-600 mt-1">Category: {event.category}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            event.expectedCrowd === 'very-high'
                              ? 'bg-red-100 text-red-800'
                              : event.expectedCrowd === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {event.expectedCrowd === 'very-high'
                            ? '👥👥👥 Very High'
                            : event.expectedCrowd === 'high'
                            ? '👥👥 High'
                            : '👥 Medium'}
                        </span>
                        <p className="text-green-600 font-bold mt-2">+{event.predictedOrderIncrease}% orders</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Prep Alert:</strong> Annual Sports Day on Nov 22 expects very high crowd. Increase
                  inventory by 40-50% and consider hiring temporary staff.
                </p>
              </div>
            </div>

            {/* AI Predictions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <LineChart className="text-green-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">AI-Powered Predictions</h2>
                </div>
                <AIBadge text="Neural Network" size="sm" />
              </div>
              <div className="space-y-4">
                {analytics.predictions.map((pred) => (
                  <div
                    key={pred.date}
                    className={`p-4 rounded-lg border ${
                      pred.predictedOrders > 150
                        ? 'border-green-300 bg-green-50'
                        : pred.predictedOrders < 100
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-blue-300 bg-blue-50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date</p>
                        <p className="text-lg font-bold text-gray-900">{pred.date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Predicted Orders</p>
                        <p className="text-lg font-bold text-gray-900">{pred.predictedOrders}</p>
                        <p className="text-sm text-gray-600">Revenue: ₹{pred.predictedRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Confidence Level</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                pred.confidence > 90 ? 'bg-green-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${pred.confidence}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-gray-900">{pred.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-sm font-medium text-gray-700 mb-2">Factors:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-600">Day of Week</p>
                          <p className="font-bold text-gray-900">{(pred.factors.dayOfWeek * 100).toFixed(0)}%</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-600">Weather</p>
                          <p className="font-bold text-gray-900">{(pred.factors.weatherImpact * 100).toFixed(0)}%</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-600">Events</p>
                          <p className="font-bold text-gray-900">{(pred.factors.eventImpact * 100).toFixed(0)}%</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-600">Trend</p>
                          <p className="font-bold text-gray-900">{(pred.factors.historicalTrend * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-white rounded">
                      <p className="text-sm text-gray-700">
                        <strong>Recommendation:</strong> {pred.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 justify-center">
              <Link
                href="/vendor/dashboard"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600">Failed to load analytics data</div>
        )}
      </main>
    </div>
  );
}
