// pages/api/recipes/history.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock user database - replace with your actual database
const mockUsers = {
  'user1': { is_premium: false, free_recipes_used: 2 },
  'user2': { is_premium: true, free_recipes_used: 0 }
};

// Mock recipe history data
const mockRecipeHistory = [
  {
    id: '1',
    condition: 'Diabetes',
    region: 'North America',
    ingredients: ['chicken', 'broccoli', 'brown rice', 'olive oil'],
    created_at: new Date().toISOString(),
    recipes_generated: [
      {
        name: 'Grilled Chicken with Steamed Broccoli',
        ingredients: ['chicken breast', 'broccoli', 'brown rice', 'olive oil', 'garlic'],
        portion: '1 serving',
        healthBenefit: 'Low glycemic index, high in protein'
      },
      {
        name: 'Chicken and Vegetable Stir Fry', 
        ingredients: ['chicken breast', 'mixed vegetables', 'soy sauce', 'ginger'],
        portion: '1 serving',
        healthBenefit: 'Balanced meal with lean protein and fiber'
      }
    ]
  },
  {
    id: '2', 
    condition: 'Hypertension',
    region: 'Mediterranean',
    ingredients: ['salmon', 'spinach', 'quinoa', 'lemon'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    recipes_generated: [
      {
        name: 'Baked Salmon with Quinoa',
        ingredients: ['salmon fillet', 'quinoa', 'spinach', 'lemon', 'herbs'],
        portion: '1 serving',
        healthBenefit: 'Rich in omega-3 fatty acids, supports heart health'
      }
    ]
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // In a real app, you would verify the token and get user data from your database
    // For now, we'll use mock user data
    const user = mockUsers.user1; // Default to free user
    
    // If user is not premium and has used all free recipes, return limited history
    if (!user.is_premium && user.free_recipes_used >= 2) {
      // Return only the first recipe history item for free users
      const limitedHistory = [mockRecipeHistory[0]];
      return res.status(200).json({ 
        history: limitedHistory,
        user_status: {
          is_premium: false,
          free_recipes_used: user.free_recipes_used,
          free_recipe_limit: 2,
          message: 'Upgrade to premium to access your full recipe history'
        }
      });
    }

    // Return full history for premium users or free users who haven't reached limit
    return res.status(200).json({ 
      history: mockRecipeHistory,
      user_status: {
        is_premium: user.is_premium,
        free_recipes_used: user.free_recipes_used,
        free_recipe_limit: 2,
        message: user.is_premium ? 'Premium member - unlimited access' : 'Free trial active'
      }
    });

  } catch (error) {
    console.error('Recipe history API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}