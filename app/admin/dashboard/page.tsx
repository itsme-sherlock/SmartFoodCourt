'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, TrendingUp, DollarSign, Trash2, Info, Calculator, Target, Zap, BarChart3, AlertTriangle } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';
import { useEffect, useState } from 'react';
import { VendorPerformance } from '@/lib/types';
import { DEMO_SCENARIO, VENDOR_PERFORMANCE_DEMO } from '@/lib/mockAdminData';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, getAdminStats, getVendorPerformance } = useAuth();
  const [adminStats, setAdminStats] = useState({
    totalVendors: 4,
    todayOrders: 0,
    activeOrders: 0,
    todayRevenue: 0,
    avgWaitTime: '8 mins',
  });
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance[]>([
    { name: 'North Indian Delights', orders: 1_120, rating: 4.5, waste: '8%', revenue: 1_125_000 },
    { name: 'South Indian Express', orders: 980, rating: 4.2, waste: '6%', revenue: 950_000 },
    { name: 'Grill Master', orders: 740, rating: 4.7, waste: '5%', revenue: 875_000 },
    { name: 'Happy Bites', orders: 540, rating: 4.0, waste: '10%', revenue: 375_000 },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [showCalculations, setShowCalculations] = useState<{[key: string]: boolean}>({});
  const [vendorInfoOpen, setVendorInfoOpen] = useState<number | null>(null);
  // High waste alert settings
  const [highWasteThreshold, setHighWasteThreshold] = useState<number>(8);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleCalculation = (key: string) => {
    setShowCalculations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const parseWasteValue = (value: any) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const match = value.match(/([0-9]+\.?[0-9]*)/);
      if (match) return Number(match[1]);
    }
    return 0;
  };

  const getHighWasteVendors = (vendors: any[], threshold: number) => {
    return vendors.filter(v => {
      const wastePercent = isDemoMode ? parseWasteValue(v.wastePercentage ?? v.waste ?? v.wastePercent) : parseWasteValue(v.waste ?? v.wastePercentage ?? v.wastePercent);
      return wastePercent > threshold;
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, performance] = await Promise.all([
          getAdminStats(),
          getVendorPerformance(),
        ]);
        setAdminStats(stats);
        if (performance.length > 0) {
          setVendorPerformance(performance);
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getAdminStats, getVendorPerformance]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu */}
      <MobileMenu
        links={[
          { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/admin/vendors', label: 'Vendors', icon: '🏪' },
          { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
          { href: '/admin/billing', label: 'Billing', icon: '💰' },
          { href: '/admin/hybrid-policies', label: 'Hybrid', icon: '🔄' },
          { href: '/admin/campaigns', label: 'Campaigns', icon: '🎉' }
        ]}
        onLogout={handleLogout}
        user={user}
      />

      {/* Header */}
      <header className="bg-white shadow-sm hidden md:block border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600">⚙️ Admin Control Center</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isDemoMode 
                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isDemoMode ? '🏆 Demo Mode' : '📊 Live Data'}
            </button>
            <Link href="/admin/vendors" className="text-gray-600 hover:text-blue-700 hover:underline">
              🏪 Vendors
            </Link>
            <Link href="/admin/analytics" className="text-blue-700 hover:underline font-medium">
              📊 Analytics
            </Link>
            <Link href="/admin/billing" className="text-blue-700 hover:underline font-medium">
              💳 Billing
            </Link>
            <Link href="/admin/hybrid-policies" className="text-blue-700 hover:underline font-medium">
              🔄 Hybrid
            </Link>
            <Link href="/admin/campaigns" className="text-blue-700 hover:underline font-medium">
              🎉 Campaigns
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 bg-linear-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Potential Impact Demonstration</h3>
                <p className="text-sm text-yellow-800">
                  Showing projected capabilities based on industry benchmarks (3000 meals/day cafeteria). 
                  All calculations are transparent and verifiable. Toggle to "Live Data" to see real metrics.
                </p>
              </div>
            </div>
          </div>
        )}

        {isDemoMode ? (
          <>
            {/* Hero Impact Cards */}
            <div className="grid gap-6 mb-8">
              {/* Waste Reduction Card */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-lg border-2 border-green-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-3 rounded-lg">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Waste Reduction Potential</h3>
                  </div>
                  <button
                    onClick={() => toggleCalculation('waste')}
                    className="text-green-600 hover:text-green-700 transition"
                  >
                    <Info className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <div className="text-5xl font-bold text-green-600">
                    {DEMO_SCENARIO.impact.wasteReduction.before} → {DEMO_SCENARIO.impact.wasteReduction.after}
                  </div>
                  <div className="text-xl text-green-600 font-semibold mb-2">
                    ({DEMO_SCENARIO.impact.wasteReduction.improvement})
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{DEMO_SCENARIO.impact.wasteReduction.explanation}</p>
                {showCalculations.waste && (
                  <div className="mt-4 bg-white/80 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-800">Detailed Calculation:</span>
                    </div>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {DEMO_SCENARIO.impact.wasteReduction.calculation}
                    </pre>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Monthly Savings Card */}
                <div className="bg-linear-to-br from-blue-50 to-cyan-50 p-6 rounded-xl shadow-lg border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-3 rounded-lg">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Monthly Savings</h3>
                    </div>
                    <button
                      onClick={() => toggleCalculation('savings')}
                      className="text-blue-600 hover:text-blue-700 transition"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-3">
                    {DEMO_SCENARIO.impact.monthlySavings.value}
                  </div>
                  <div className="space-y-1 text-sm mb-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Food Savings:</span>
                      <span className="font-semibold">{DEMO_SCENARIO.impact.monthlySavings.breakdown.food}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Labor Savings:</span>
                      <span className="font-semibold">{DEMO_SCENARIO.impact.monthlySavings.breakdown.labor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilities:</span>
                      <span className="font-semibold">{DEMO_SCENARIO.impact.monthlySavings.breakdown.utilities}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{DEMO_SCENARIO.impact.monthlySavings.explanation}</p>
                  {showCalculations.savings && (
                    <div className="mt-4 bg-white/80 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-800 text-sm">Breakdown:</span>
                      </div>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                        {DEMO_SCENARIO.impact.monthlySavings.calculation}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Revenue Uplift Card */}
                <div className="bg-linear-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-lg border-2 border-purple-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500 p-3 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Revenue Increase</h3>
                    </div>
                    <button
                      onClick={() => toggleCalculation('revenue')}
                      className="text-purple-600 hover:text-purple-700 transition"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-end gap-3 mb-3">
                    <div className="text-4xl font-bold text-purple-600">
                      {DEMO_SCENARIO.impact.revenueUplift.value}
                    </div>
                    <div className="text-lg text-purple-600 font-semibold mb-1">
                      (+{DEMO_SCENARIO.impact.revenueUplift.extra}/mo)
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{DEMO_SCENARIO.impact.revenueUplift.explanation}</p>
                  {showCalculations.revenue && (
                    <div className="mt-4 bg-white/80 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-gray-800 text-sm">How it works:</span>
                      </div>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                        {DEMO_SCENARIO.impact.revenueUplift.calculation}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Predictions & Comparison Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* AI Predictions Panel */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-800">AI Prediction Capabilities</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Today's Forecast</p>
                    <p className="text-2xl font-bold text-indigo-600">{DEMO_SCENARIO.predictions.todayAttendance}</p>
                    <p className="text-xs text-gray-500">meals</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Accuracy Rate</p>
                    <p className="text-2xl font-bold text-indigo-600">{DEMO_SCENARIO.predictions.accuracy}</p>
                    <p className="text-xs text-gray-500">historical avg</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-700">{DEMO_SCENARIO.predictions.weatherImpact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">{DEMO_SCENARIO.predictions.trend}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-700">{DEMO_SCENARIO.predictions.eventImpact}</span>
                  </div>
                </div>
              </div>

              {/* Before vs After Comparison */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Traditional vs Smart System</h3>
                <div className="space-y-4">
                  {DEMO_SCENARIO.comparison.slice(0, 3).map((item, index) => (
                    <div key={index}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">{item.metric}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-red-100 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-600">Traditional</p>
                          <p className="font-bold text-red-600">{item.traditional}</p>
                        </div>
                        <div className="text-green-600 font-bold text-xl">→</div>
                        <div className="flex-1 bg-green-100 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-600">Smart</p>
                          <p className="font-bold text-green-600">{item.withSystem}</p>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 font-semibold mt-1 text-center">
                        {item.improvement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sample Day Scenario */}
            <div className="bg-linear-to-br from-amber-50 to-orange-50 p-6 rounded-xl shadow-lg mb-8 border-2 border-amber-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Sample Prediction Scenario</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/80 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">{DEMO_SCENARIO.sampleDay.date}</p>
                  <p className="text-xl font-bold text-amber-600 mb-3">
                    {DEMO_SCENARIO.sampleDay.prediction}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Factors Analyzed:</p>
                    {DEMO_SCENARIO.sampleDay.factors.map((factor, i) => (
                      <p key={i} className="text-xs text-gray-600">• {factor}</p>
                    ))}
                  </div>
                </div>
                <div className="bg-white/80 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">AI Recommendations:</p>
                  {DEMO_SCENARIO.sampleDay.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs text-gray-600 mb-1">✓ {rec}</p>
                  ))}
                </div>
                <div className="bg-green-100 p-4 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-700 mb-1">Actual Result</p>
                    <p className="text-lg font-bold text-green-600">{DEMO_SCENARIO.sampleDay.outcome}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Industry Benchmarks */}
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm mb-8 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Industry Benchmarks Reference</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-gray-700">
                  <span className="font-semibold">Waste:</span> {DEMO_SCENARIO.industryBenchmarks.wastePercentage}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Wait Time:</span> {DEMO_SCENARIO.industryBenchmarks.waitTime}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Accuracy:</span> {DEMO_SCENARIO.industryBenchmarks.orderAccuracy}
                </div>
              </div>
              <p className="text-xs text-gray-500 italic mt-2">Source: {DEMO_SCENARIO.industryBenchmarks.source}</p>
            </div>
          </>
        ) : (
          <>
            {/* Original Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-2xl">🏪</p>
            <p className="text-gray-600 text-sm mt-2">Total Vendors</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {isLoading ? '...' : adminStats.totalVendors}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-2xl">📦</p>
            <p className="text-gray-600 text-sm mt-2">Active Orders</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {isLoading ? '...' : adminStats.activeOrders}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-2xl">💰</p>
            <p className="text-gray-600 text-sm mt-2">Today Revenue</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {isLoading ? '...' : `₹${adminStats.todayRevenue.toLocaleString()}`}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-2xl">⏱️</p>
            <p className="text-gray-600 text-sm mt-2">Avg Wait Time</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {isLoading ? '...' : adminStats.avgWaitTime}
            </p>
          </div>
        </div>
          </>
        )}

        {/* Vendor Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Vendor Performance {isDemoMode && '(Demo)'}
          </h2>
          <div className="overflow-x-auto">
            {/* High Waste Alert Summary */}
            {(() => {
              const activeList = isDemoMode ? VENDOR_PERFORMANCE_DEMO : vendorPerformance;
              const highWasteVendors = getHighWasteVendors(activeList, highWasteThreshold);
              return (
                <div className="flex items-center justify-between mb-4">
                  {highWasteVendors.length > 0 ? (
                    <div className="flex items-center gap-3 text-sm text-yellow-800 bg-yellow-50 px-3 py-2 rounded">
                      <AlertTriangle className="w-4 h-4 text-yellow-700" />
                      <div>
                        <div className="font-semibold">High Waste Alert</div>
                        <div className="text-xs">{highWasteVendors.length} vendor(s) exceed {highWasteThreshold}% waste threshold</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">All vendors within waste thresholds.</div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">Threshold
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={highWasteThreshold}
                        onChange={(e) => setHighWasteThreshold(Number(e.target.value))}
                        className="ml-2 w-20 p-1 rounded border text-sm"
                      />
                    </label>
                    <button onClick={() => toggleCalculation('highWaste')} className="text-sm text-gray-500 hover:text-gray-700">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
            {showCalculations.highWaste && (
              <div className="mb-4 p-3 bg-white/80 rounded border border-yellow-100 text-sm text-gray-700">
                <div className="font-semibold text-yellow-900 mb-1">High Waste Alert Calculation</div>
                <p>Vendors with waste percentage above {highWasteThreshold}% are flagged for attention. High waste indicates overproduction and potential cost savings through better demand forecasting.</p>
              </div>
            )}
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Vendor</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Orders</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Rating</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <span>Waste %</span>
                      <button onClick={() => toggleCalculation('highWaste')} className="text-gray-500 hover:text-gray-700 p-1" aria-label="High waste info">
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const list = isDemoMode ? VENDOR_PERFORMANCE_DEMO : vendorPerformance;
                  return list.map((vendor: any, idx: number) => {
                    const wastePercent = isDemoMode ? parseWasteValue(vendor.wastePercentage) : parseWasteValue(vendor.waste ?? vendor.wastePercentage);
                    const flagged = wastePercent > highWasteThreshold;
                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold">{vendor.name}</p>
                              {vendor.prediction && <p className="text-xs text-indigo-600 mt-1">🔮 {vendor.prediction}</p>}
                            </div>
                            {flagged && (
                              <div className="ml-auto flex items-center gap-2 text-sm text-yellow-700">
                                <AlertTriangle className="w-4 h-4" />
                                <button onClick={() => setVendorInfoOpen(vendorInfoOpen === idx ? null : idx)} className="text-xs font-semibold hover:underline">
                                  High Waste
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        {vendorInfoOpen === idx && (
                          <tr>
                            <td colSpan={5} className="px-6 py-3 bg-yellow-50 text-xs text-yellow-900">
                              <div>
                                <div className="font-semibold">Calculation</div>
                                <div>Reported Waste: {wastePercent}%</div>
                                <div>Threshold: {highWasteThreshold}%</div>
                                <div className="font-semibold mt-1">Formula: waste% = (wasteKg / totalProducedKg) × 100</div>
                              </div>
                            </td>
                          </tr>
                        )}
                        <td className="px-6 py-3">{vendor.totalOrders ?? vendor.orders}</td>
                        <td className="px-6 py-3">⭐ {vendor.rating}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            wastePercent <= 5 ? 'bg-green-100 text-green-700' : wastePercent <= highWasteThreshold ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {wastePercent}%
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {isDemoMode ? `${vendor.efficiency}% Efficient` : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
