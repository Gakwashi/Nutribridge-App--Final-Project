// pages/api/forum/categories.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers to prevent any cross-origin issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    console.log(' [API] Fetching forum categories...');
    
    // Mock categories data - this is what your frontend expects
    const mockCategories = [
      { 
        id: 'general', 
        name: 'General Discussion', 
        description: 'General topics and introductions',
        color: 'bg-blue-100 text-blue-800',
        icon: '💬',
        postCount: 24
      },
      { 
        id: 'recipes', 
        name: 'Recipe Sharing', 
        description: 'Share and discuss recipes',
        color: 'bg-green-100 text-green-800',
        icon: '🍳',
        postCount: 18
      },
      { 
        id: 'support', 
        name: 'Support & Advice', 
        description: 'Get help and share experiences',
        color: 'bg-purple-100 text-purple-800',
        icon: '🤝',
        postCount: 32
      },
      { 
        id: 'nutrition', 
        name: 'Nutrition Tips', 
        description: 'Nutrition advice and tips',
        color: 'bg-orange-100 text-orange-800',
        icon: '🥗',
        postCount: 15
      },
      { 
        id: 'success-stories', 
        name: 'Success Stories', 
        description: 'Share your health journey and achievements',
        color: 'bg-pink-100 text-pink-800',
        icon: '🌟',
        postCount: 12
      },
      { 
        id: 'fitness', 
        name: 'Fitness & Exercise', 
        description: 'Workout routines and fitness tips',
        color: 'bg-red-100 text-red-800',
        icon: '💪',
        postCount: 8
      }
    ];

    console.log(` [API] Returning ${mockCategories.length} categories`);
    
    // Return the response in the exact format your frontend expects
    res.status(200).json({ 
      success: true,
      categories: mockCategories,
      message: 'Categories fetched successfully',
      count: mockCategories.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[API] Categories error:', error);
    
    // Return error response in consistent format
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch categories',
      message: error.message || 'Internal server error',
      categories: [],
      count: 0,
      timestamp: new Date().toISOString()
    });
  }
}