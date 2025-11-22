import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    /* Temporary: Return mock response until API key is properly configured
    const mockResponses = [
      'I recommend trying North Indian Delights for their Butter Chicken today!',
      'The South Indian Express Masala Dosa is a popular choice right now.',
      'Have you tried the Grill Master Chicken Biryani? It\'s highly rated!',
      'The Happy Bites Buddha Bowl is perfect for a healthy lunch option.',
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return NextResponse.json({ response: randomResponse });
    */

    //  Commented out until API key is configured for Gemini models
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY not found in environment');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    // Using gemini-2.0-flash as it is available for this key
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Full mock data context for the AI
    const foodCourtContext = {
      vendors: [
        { id: 'vendor_1', name: 'North Indian Delights', cuisine: ['North Indian', 'Vegetarian'], rating: 4.5, status: 'Open', operatingHours: '11:00 AM - 3:00 PM, 6:00 PM - 9:00 PM' },
        { id: 'vendor_2', name: 'South Indian Express', cuisine: ['South Indian', 'Vegetarian'], rating: 4.2, status: 'Open', operatingHours: '11:00 AM - 3:00 PM' },
        { id: 'vendor_3', name: 'Grill Master', cuisine: ['Grilled', 'Non-Vegetarian'], rating: 4.7, status: 'Open', operatingHours: '12:00 PM - 3:00 PM' },
        { id: 'vendor_4', name: 'Happy Bites Pop-up', cuisine: ['Continental'], rating: 4.0, status: 'Open', operatingHours: '11:30 AM - 2:30 PM', isPopup: true }
      ],
      menuItems: {
        vendor_1: [
          { name: 'Butter Chicken', description: 'Creamy tomato-based curry', price: 250, status: 'Ready', popularity: 'High (1020 orders)', allergens: ['dairy'] },
          { name: 'Dal Makhani', description: 'Slow-cooked lentils', price: 180, status: 'Ready', popularity: 'High (980 orders)', allergens: ['dairy'] },
          { name: 'Paneer Tikka Masala', description: 'Grilled cottage cheese', price: 220, status: 'Preparing', popularity: 'Medium (740 orders)', allergens: ['dairy'] },
          { name: 'Seasonal Veg Curry', description: 'Chef special seasonal vegetables', price: 170, status: 'Scheduled', popularity: 'Low (120 orders)' },
          { name: 'Kulfi Dessert', description: 'Creamy cardamom kulfi', price: 90, status: 'Sold Out', popularity: 'Medium (600 orders)', allergens: ['dairy'] }
        ],
        vendor_2: [
          { name: 'Masala Dosa', description: 'Crispy rice crepe', price: 120, status: 'Ready', popularity: 'High (980 orders)' },
          { name: 'Idli with Sambar', description: 'Steamed rice cakes', price: 80, status: 'Ready', popularity: 'Medium (360 orders)' },
          { name: 'Special Coconut Chutney', description: 'Fresh coconut chutney', price: 40, status: 'Scheduled', popularity: 'Low (180 orders)' }
        ],
        vendor_3: [
          { name: 'Tandoori Chicken', description: 'Smoky grilled chicken', price: 280, status: 'Ready', popularity: 'Medium (450 orders)' },
          { name: 'Grill Platter', description: 'Assorted grilled items', price: 520, status: 'Sold Out', popularity: 'High (800 orders)' }
        ],
        vendor_4: [
          { name: 'Margherita Pizza', description: 'Classic cheese pizza', price: 150, status: 'Ready', popularity: 'Medium (540 orders)', allergens: ['dairy'] }
        ]
      },
      timeSlots: [
        { time: '12:00 PM', capacity: 500, filled: 480, status: 'Almost Full' },
        { time: '12:30 PM', capacity: 500, filled: 320, status: 'Available' },
        { time: '1:00 PM', capacity: 500, filled: 150, status: 'Available' },
        { time: '1:30 PM', capacity: 500, filled: 80, status: 'Available' }
      ]
    };

    const systemPrompt = `You are FoodGenie, an AI assistant for the Infosys Smart Food Court system. 
    
    Here is the LIVE data from the food court:
    ${JSON.stringify(foodCourtContext, null, 2)}

    Your goal is to help users with:
    1. Food recommendations based on their preferences (spicy, veg/non-veg, budget).
    2. Checking if items are available or sold out.
    3. Finding the best time to eat (based on time slot availability).
    4. Identifying popular items (high order counts).
    5. Allergen warnings.

    Current user context: ${context || 'No specific user context provided'}

    Be friendly, concise, and helpful. If an item is 'Sold Out', suggest alternatives. If a time slot is 'Almost Full', suggest a later one.`;

    try {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `User: ${message}` }
      ]);

      const response = result.response;
      const text = response.text().trim();

      return NextResponse.json({ response: text });
    } catch (apiError) {
      console.error('Gemini API Error (falling back to mock):', apiError);
      
      // Fallback to mock responses if API fails (e.g. quota exceeded)
      const mockResponses = [
        'I recommend trying North Indian Delights for their Butter Chicken today! (AI Offline)',
        'The South Indian Express Masala Dosa is a popular choice right now. (AI Offline)',
        'Have you tried the Grill Master Chicken Biryani? It\'s highly rated! (AI Offline)',
        'The Happy Bites Buddha Bowl is perfect for a healthy lunch option. (AI Offline)',
      ];
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      return NextResponse.json({ response: randomResponse });
    }
    
  } catch (err) {
    console.error('Error in FoodGenie API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}