// pages/api/recipes/generate.ts - UPDATED WITH FREE RECIPE LIMIT
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini only if API key exists
const genAI = process.env.GOOGLE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { ingredients, condition, region, ageGroup } = req.body;

    console.log('🔵 Generating recipes for:', ingredients);

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    // 🔥 NEW: Check free recipe limit before generating
    const userCheck = await checkUserRecipeLimit(token);
    if (!userCheck.allowed) {
      return res.status(402).json({ 
        error: userCheck.error || 'Free recipe limit reached',
        user_status: userCheck.user_status
      });
    }

    // Generate recipes using Gemini AI or fallback
    const recipes = await generateRecipes(ingredients, condition, region, ageGroup);

    // 🔥 NEW: Update user's recipe count after successful generation
    try {
      await updateUserRecipeCount(token, userCheck.user_id);
      console.log('🔵 Recipe count updated for user:', userCheck.user_id);
    } catch (dbError) {
      console.error('Database error updating recipe count:', dbError);
      // Don't fail the request if tracking fails
    }

    res.status(200).json({ 
      success: true,
      recipes: recipes,
      user_status: {
        free_recipes_used: (userCheck.user_status?.free_recipes_used || 0) + 1,
        free_recipe_limit: userCheck.user_status?.free_recipe_limit || 2,
        is_premium: userCheck.user_status?.is_premium || false
      }
    });

  } catch (error: any) {
    console.error('🔴 Recipe generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recipes',
      details: error.message 
    });
  }
}

// 🔥 NEW: Function to check user's recipe limit
async function checkUserRecipeLimit(token: string): Promise<{
  allowed: boolean;
  error?: string;
  user_id?: string;
  user_status?: any;
}> {
  try {
    // Get user from Supabase using the token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('🔴 Auth error:', error);
      return { allowed: false, error: 'Invalid authentication' };
    }

    // Get user profile from your profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('🔴 Profile fetch error:', profileError);
      // If no profile exists, create one with default limits
      return { 
        allowed: true, 
        user_id: user.id,
        user_status: {
          free_recipes_used: 0,
          free_recipe_limit: 2,
          is_premium: false
        }
      };
    }

    // Check if user is premium or within free limit
    const freeRecipesUsed = profile.free_recipes_used || 0;
    const freeRecipeLimit = profile.free_recipe_limit || 2;
    const isPremium = profile.is_premium || false;

    console.log(`🔵 User ${user.id} recipe stats:`, {
      freeRecipesUsed,
      freeRecipeLimit,
      isPremium,
      allowed: isPremium || freeRecipesUsed < freeRecipeLimit
    });

    if (!isPremium && freeRecipesUsed >= freeRecipeLimit) {
      return {
        allowed: false,
        error: `You have used all ${freeRecipeLimit} free recipes. Please upgrade to premium to generate more recipes.`,
        user_id: user.id,
        user_status: {
          free_recipes_used: freeRecipesUsed,
          free_recipe_limit: freeRecipeLimit,
          is_premium: isPremium
        }
      };
    }

    return {
      allowed: true,
      user_id: user.id,
      user_status: {
        free_recipes_used: freeRecipesUsed,
        free_recipe_limit: freeRecipeLimit,
        is_premium: isPremium
      }
    };

  } catch (error) {
    console.error('🔴 Error checking user limit:', error);
    // Allow generation if check fails (fail-open for better UX)
    return { allowed: true };
  }
}

// 🔥 NEW: Function to update user's recipe count
async function updateUserRecipeCount(token: string, userId: string) {
  try {
    // Increment the free_recipes_used count in the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('free_recipes_used, is_premium')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('🔴 Profile fetch error:', profileError);
      return;
    }

    // Only increment if user is not premium
    if (!profile.is_premium) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          free_recipes_used: (profile.free_recipes_used || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('🔴 Update recipe count error:', updateError);
      } else {
        console.log('✅ Recipe count updated for user:', userId);
      }
    }
  } catch (error) {
    console.error('🔴 Error updating recipe count:', error);
  }
}

// Keep your existing generateRecipes and getEnhancedFallbackRecipes functions unchanged
async function generateRecipes(ingredients: string[], condition: string, region: string, ageGroup: string) {
  // If Gemini is not configured, use enhanced fallback
  if (!genAI) {
    console.log('🔵 Gemini not configured, using enhanced fallback recipes');
    return getEnhancedFallbackRecipes(ingredients, condition, region, ageGroup);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
Create 2 unique, detailed, and culturally appropriate recipes using primarily these ingredients: ${ingredients.join(', ')}.

Context:
- Health considerations: ${condition || 'General health'}
- Cultural preference: ${region || 'Universal'} 
- Age group: ${ageGroup}

For each recipe, provide EXACTLY this JSON format:
[
  {
    "name": "Creative and descriptive recipe name",
    "ingredients": ["specific ingredient 1", "specific ingredient 2", "specific ingredient 3", "specific ingredient 4", "seasoning", "cooking oil"],
    "preparation": "Detailed, step-by-step cooking instructions with specific techniques, temperatures, and times. Make it clear and easy to follow.",
    "healthBenefit": "Specific health benefits explaining how this recipe supports ${condition || 'overall health'}",
    "portion": "Realistic serving size",
    "cookingTime": "Accurate time estimate",
    "difficulty": "Easy/Medium/Hard"
  },
  {
    "name": "Another creative and descriptive recipe name", 
    "ingredients": ["specific ingredient 1", "specific ingredient 2", "specific ingredient 3", "specific ingredient 4", "seasoning", "cooking oil"],
    "preparation": "Detailed, step-by-step cooking instructions with specific techniques, temperatures, and times. Make it clear and easy to follow.",
    "healthBenefit": "Specific health benefits explaining how this recipe supports ${condition || 'overall health'}",
    "portion": "Realistic serving size",
    "cookingTime": "Accurate time estimate",
    "difficulty": "Easy/Medium/Hard"
  }
]

IMPORTANT: 
- Use primarily the provided ingredients but add common pantry items
- Make recipes culturally appropriate for ${region || 'various cultures'}
- Consider ${ageGroup} nutritional needs
- Return ONLY the JSON array, no other text
`;

  try {
    console.log('🔵 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log('🔵 Gemini raw response length:', text.length);
    
    // Clean and parse JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recipes = JSON.parse(jsonMatch[0]);
      console.log('✅ AI recipes generated successfully');
      return recipes;
    } else {
      console.error('🔴 No valid JSON found in Gemini response');
      throw new Error('AI returned invalid format');
    }
  } catch (error) {
    console.error('🔴 Gemini API error:', error);
    console.log('🔄 Falling back to enhanced recipes');
    return getEnhancedFallbackRecipes(ingredients, condition, region, ageGroup);
  }
}

function getEnhancedFallbackRecipes(ingredients: string[], condition: string, region: string, ageGroup: string) {
  const mainIngredient = ingredients[0]?.toLowerCase() || 'ingredients';
  const secondaryIngredients = ingredients.slice(1);
  
  return [
    {
      name: `Savory ${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} ${region ? region + ' ' : ''}Stir-Fry`,
      ingredients: [
        ...ingredients,
        '2 tbsp cooking oil',
        '2 cloves garlic, minced',
        '1 onion, sliced',
        'Salt and pepper to taste',
        '1 tsp soy sauce or preferred seasoning'
      ],
      preparation: `1. Prepare all ingredients: wash and chop ${ingredients.join(', ')}\n2. Heat oil in a large pan or wok over medium-high heat\n3. Sauté garlic and onion until fragrant (1-2 minutes)\n4. Add ${mainIngredient} and stir-fry for 3-5 minutes until cooked\n5. Add ${secondaryIngredients.length > 0 ? secondaryIngredients.join(', ') : 'remaining ingredients'} and cook for another 2-3 minutes\n6. Season with salt, pepper, and soy sauce\n7. Stir well and serve hot with rice or bread`,
      healthBenefit: `Rich in nutrients from fresh ${ingredients.join(', ')}. ${condition ? `Suitable for ${condition} with its balanced preparation.` : 'Provides essential vitamins and minerals for overall health.'} Perfect for ${ageGroup} nutritional needs.`,
      portion: '2 servings',
      cookingTime: '20 minutes',
      difficulty: 'Easy'
    },
    {
      name: `Hearty ${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} ${region ? region + ' ' : ''}Bowl`,
      ingredients: [
        ...ingredients,
        '1 cup grains (rice, quinoa, or couscous)',
        '2 cups vegetables (carrots, bell peppers, zucchini)',
        '2 tbsp olive oil',
        'Herbs and spices to taste',
        'Lemon juice for serving'
      ],
      preparation: `1. Cook grains according to package instructions\n2. While grains cook, prepare ${ingredients.join(', ')} by washing and cutting\n3. Heat oil in a pan and sauté ${mainIngredient} until golden\n4. Add vegetables and cook until tender but crisp\n5. Combine cooked grains with ${mainIngredient} and vegetables\n6. Season with herbs, spices, and a squeeze of lemon juice\n7. Mix well and serve warm`,
      healthBenefit: `Balanced meal with protein, fiber, and essential nutrients. ${condition ? `Thoughtfully prepared for ${condition} dietary considerations.` : 'Supports digestive health and provides sustained energy.'} Ideal for ${ageGroup} dietary requirements.`,
      portion: '2 servings',
      cookingTime: '25 minutes',
      difficulty: 'Easy'
    }
  ];
}