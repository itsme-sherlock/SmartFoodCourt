// Mock data for demonstrating potential impact to judges
// Based on industry benchmarks and system capabilities

export const DEMO_SCENARIO = {
  impact: {
    wasteReduction: {
      before: "38%",
      after: "6%",
      improvement: "85% Reduction",
      calculation: "Traditional: 3000 meals × 38% waste × ₹200/meal = ₹2,28,000/day waste\nWith System: 3000 meals × 6% waste × ₹200/meal = ₹36,000/day waste\nSavings: ₹1,92,000/day × 30 days = ₹57.6L/month potential",
      explanation: "Industry average food waste is 30-40%. Our AI prediction reduces this to <8% by forecasting demand accurately."
    },
    monthlySavings: {
      value: "₹4,32,000",
      breakdown: {
        food: "₹2,80,000",
        labor: "₹1,20,000",
        utilities: "₹32,000"
      },
      calculation: "Food: Reduced waste (₹1.92L) + Better procurement (₹0.88L)\nLabor: Optimized staffing based on predictions (₹1.2L)\nUtilities: Less cooking/storage waste (₹0.32L)",
      explanation: "Based on 3000 meals/day cafeteria with ₹200 average meal cost."
    },
    revenueUplift: {
      value: "+28%",
      extra: "₹1,45,000",
      calculation: "Faster service (8 min vs 25 min) = 3× more peak hour capacity\nQR-based ordering eliminates queue bottleneck\n3000 meals × ₹200 × 28% increase = ₹1.68L extra/month",
      explanation: "Quick turnover during peak hours allows serving more customers in same time window."
    }
  },
  
  predictions: {
    todayAttendance: 3200,
    accuracy: "94%",
    weatherImpact: "Rainy → Comfort food demand +15%",
    eventImpact: "Board Meeting → Premium meals +20%",
    trend: "Monday typically 15% below average"
  },
  
  comparison: [
    { 
      metric: "Average Wait Time", 
      traditional: "25 min", 
      withSystem: "8 min",
      improvement: "68% faster"
    },
    { 
      metric: "Daily Food Waste", 
      traditional: "45 kg", 
      withSystem: "4 kg",
      improvement: "91% less waste"
    },
    { 
      metric: "Order Accuracy", 
      traditional: "78%", 
      withSystem: "98%",
      improvement: "+20 points"
    },
    { 
      metric: "Peak Hour Capacity", 
      traditional: "180 orders/hr", 
      withSystem: "280 orders/hr",
      improvement: "+55%"
    },
    { 
      metric: "Vendor Utilization", 
      traditional: "62%", 
      withSystem: "89%",
      improvement: "+27 points"
    }
  ],

  sampleDay: {
    date: "Monday, Nov 25, 2025",
    prediction: "2850 meals expected",
    factors: [
      "Weather: Rainy (Comfort food +15%)",
      "Day: Monday (Typically -15% attendance)",
      "Events: No major events",
      "Historical: Last 4 Mondays averaged 2820"
    ],
    recommendations: [
      "Increase South Indian vendor prep by 20%",
      "Stock extra chai/pakoras for rainy day",
      "North Indian vendor can reduce prep by 10%",
      "Schedule 2 fewer staff for evening shift"
    ],
    outcome: "Actual attendance: 2890 (98.6% accuracy)"
  },

  industryBenchmarks: {
    wastePercentage: "30-40% (Industry) vs 6% (Our Target)",
    waitTime: "20-30 min (Industry) vs 8 min (Our Target)",
    orderAccuracy: "75-80% (Industry) vs 98% (Our Target)",
    source: "National Restaurant Association, Food Waste Index 2024"
  }
};

export const VENDOR_PERFORMANCE_DEMO = [
  {
    id: "1",
    name: "South Indian Delights",
    totalOrders: 1240,
    revenue: 2.8,
    rating: 4.8,
    wastePercentage: 4,
    efficiency: 94,
    prediction: "High demand expected tomorrow (+18%)"
  },
  {
    id: "2",
    name: "North Indian Spice",
    totalOrders: 980,
    revenue: 2.3,
    rating: 4.6,
    wastePercentage: 7,
    efficiency: 88,
    prediction: "Normal demand expected"
  },
  {
    id: "3",
    name: "Chinese Corner",
    totalOrders: 750,
    revenue: 1.8,
    rating: 4.5,
    wastePercentage: 5,
    efficiency: 91,
    prediction: "Rainy day → Low demand (-12%)"
  },
  {
    id: "4",
    name: "Healthy Bites",
    totalOrders: 620,
    revenue: 1.5,
    rating: 4.7,
    wastePercentage: 3,
    efficiency: 95,
    prediction: "Gym crowd spike on Monday (+22%)"
  }
];
