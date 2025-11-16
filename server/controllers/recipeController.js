import supabase from '../config/db.js';

export const upgradeToPremium = async (req, res) => {
  const { error } = await supabase
    .from('users')
    .update({ is_premium: true })
    .eq('id', userId);
};

export const getSubscriptionInfo = async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
};

const HEALTH_CONDITIONS = {
  diabetes: {
    focus: 'blood sugar control',
    avoid: ['sugar', 'refined carbs', 'sweet fruits'],
    emphasize: ['fiber', 'lean protein', 'complex carbs']
  },
  hypertension: {
    focus: 'blood pressure control',
    avoid: ['salt', 'processed foods', 'high-sodium ingredients'],
    emphasize: ['potassium', 'magnesium', 'fiber']
  },
  anemia: {
    focus: 'iron absorption',
    avoid: ['calcium-rich foods with iron', 'tea/coffee with meals'],
    emphasize: ['iron', 'vitamin C', 'folate']
  },
  obesity: {
    focus: 'weight management',
    avoid: ['high-calorie foods', 'sugary drinks', 'fried foods'],
    emphasize: ['fiber', 'lean protein', 'vegetables']
  },
  celiac: {
    focus: 'gluten-free diet',
    avoid: ['wheat', 'barley', 'rye'],
    emphasize: ['gluten-free grains', 'whole foods']
  },
  ibs: {
    focus: 'digestive health',
    avoid: ['high-FODMAP foods', 'spicy foods'],
    emphasize: ['soluble fiber', 'low-FODMAP foods']
  },
  heart_disease: {
    focus: 'heart health',
    avoid: ['saturated fats', 'trans fats', 'cholesterol'],
    emphasize: ['omega-3', 'fiber', 'antioxidants']
  },
  kidney_disease: {
    focus: 'kidney function',
    avoid: ['potassium', 'phosphorus', 'sodium'],
    emphasize: ['controlled protein', 'low-potassium foods']
  },
  arthritis: {
    focus: 'inflammation reduction',
    avoid: ['processed foods', 'sugar', 'saturated fats'],
    emphasize: ['omega-3', 'antioxidants', 'anti-inflammatory foods']
  },
  osteoporosis: {
    focus: 'bone health',
    avoid: ['excess sodium', 'caffeine', 'alcohol'],
    emphasize: ['calcium', 'vitamin D', 'magnesium']
  }
};

// Regional cuisine patterns
const REGIONAL_CUISINES = {
  'east africa': {
    staples: ['maize flour', 'beans', 'plantains', 'sweet potatoes'],
    common: ['sukuma wiki', 'tomatoes', 'onions', 'spinach']
  },
  'west africa': {
    staples: ['rice', 'yams', 'cassava', 'plantains'],
    common: ['peppers', 'tomatoes', 'okra', 'fish']
  },
  'south asia': {
    staples: ['rice', 'wheat flour', 'lentils', 'chickpeas'],
    common: ['spices', 'vegetables', 'yogurt', 'coconut']
  },
  'east asia': {
    staples: ['rice', 'noodles', 'tofu', 'soy sauce'],
    common: ['vegetables', 'ginger', 'garlic', 'sesame oil']
  },
  'latin america': {
    staples: ['corn', 'beans', 'rice', 'plantains'],
    common: ['tomatoes', 'avocado', 'lime', 'chili peppers']
  },
  'middle east': {
    staples: ['wheat', 'rice', 'lentils', 'chickpeas'],
    common: ['olive oil', 'herbs', 'yogurt', 'nuts']
  },
  'europe': {
    staples: ['wheat', 'potatoes', 'rice', 'oats'],
    common: ['vegetables', 'cheese', 'herbs', 'olive oil']
  },
  'north america': {
    staples: ['wheat', 'corn', 'potatoes', 'rice'],
    common: ['vegetables', 'lean meats', 'dairy', 'fruits']
  }
};

const generatePortionRecommendation = (condition, ageGroup = 'adult') => {
  const portions = {
    diabetes: {
      adult: "1 medium portion of complex carbs, 2 palms of protein, 2 fists of non-starchy vegetables",
      child: "3/4 portion of complex carbs, 1.5 palms of protein, 1.5 fists of non-starchy vegetables",
      elderly: "1 small portion of complex carbs, 1.5 palms of protein, 2 fists of non-starchy vegetables"
    },
    hypertension: {
      adult: "Focus on vegetables (3+ fists), moderate lean protein (2 palms), limited sodium",
      child: "2 fists of vegetables, 1.5 palms of protein, emphasize potassium-rich foods",
      elderly: "2-3 fists of vegetables, 1.5 palms of protein, ensure adequate hydration"
    },
    anemia: {
      adult: "Iron-rich foods (2 palms), vitamin C sources (1 fist), avoid calcium interference",
      child: "1.5 palms iron-rich foods, 1 fist vitamin C sources, small frequent meals",
      elderly: "2 palms iron-rich foods, 1 fist vitamin C, consider digestive tolerance"
    },
    obesity: {
      adult: "High volume vegetables (3+ fists), lean protein (2 palms), controlled carbs (1 fist)",
      child: "Balanced portions for growth, 2 fists vegetables, 1.5 palms protein",
      elderly: "Nutrient-dense smaller portions, 2 fists vegetables, 1.5 palms protein"
    },
    heart_disease: {
      adult: "Lean protein (2 palms), whole grains (1 fist), vegetables (3+ fists), healthy fats",
      child: "Balanced portions, 1.5 palms protein, 1 fist whole grains, 2 fists vegetables",
      elderly: "Smaller, frequent meals, 1.5 palms protein, 1 fist whole grains, 2 fists vegetables"
    },
    kidney_disease: {
      adult: "Controlled protein (1 palm), limited potassium foods, controlled fluids",
      child: "Medical supervision required for portion control",
      elderly: "Medical supervision required for portion control"
    }
  };

  return portions[condition]?.[ageGroup] || "Standard balanced portions recommended";
};

function generateRecipeSuggestions(ingredients, condition, region, ageGroup) {
  const conditionInfo = HEALTH_CONDITIONS[condition] || {};
  const regionInfo = REGIONAL_CUISINES[region.toLowerCase()] || REGIONAL_CUISINES['east africa'];
  
  const recipes = [];
  
  // Recipe 1: Main staple-based meal
  recipes.push({
    name: `Traditional ${region.split(' ')[0]} Nutrient-Boost Meal`,
    ingredients: [...ingredients, ...regionInfo.common.slice(0, 2)],
    preparation: `1. Prepare staple grain/root\n2. Sauté vegetables with available ingredients\n3. Combine and simmer until flavors meld\n4. Serve warm with attention to portion control`,
    healthBenefit: `Specifically formulated for ${condition} management: ${conditionInfo.focus}. Rich in ${conditionInfo.emphasize?.join(', ')}`,
    portion: generatePortionRecommendation(condition, ageGroup),
    cookingTime: '25-35 minutes',
    difficulty: 'Easy'
  });

  // Recipe 2: Quick alternative
  recipes.push({
    name: `Quick ${condition.split(' ')[0]}-Friendly ${region.split(' ')[0]} Bowl`,
    ingredients: ingredients.filter(ing => !regionInfo.staples.includes(ing.toLowerCase())),
    preparation: `1. Chop all vegetables uniformly\n2. Lightly steam or sauté\n3. Season with local herbs/spices\n4. Arrange in bowl format for visual appeal`,
    healthBenefit: `Supports ${condition} through ${conditionInfo.focus}. Avoids ${conditionInfo.avoid?.slice(0,2).join(', ')}`,
    portion: generatePortionRecommendation(condition, ageGroup),
    cookingTime: '15-20 minutes',
    difficulty: 'Very Easy'
  });

  // Recipe 3: Cultural traditional with health twist
  recipes.push({
    name: `Health-Adapted ${region} Classic`,
    ingredients: [...new Set([...ingredients, ...regionInfo.staples.slice(0,1), ...regionInfo.common.slice(1,3)])],
    preparation: `1. Use traditional cooking methods\n2. Modify for health: reduce oil/salt\n3. Incorporate nutrient-preserving techniques\n4. Present in culturally familiar way`,
    healthBenefit: `Cultural satisfaction while addressing ${condition}. Emphasizes ${conditionInfo.emphasize?.slice(0,2).join(' and ')}`,
    portion: generatePortionRecommendation(condition, ageGroup),
    cookingTime: '30-40 minutes',
    difficulty: 'Medium'
  });

  return recipes;
}

export const generateRecipes = async (req, res) => {
  try {
    const { ingredients, condition, region, ageGroup = 'adult' } = req.body;
    const userId = req.userId;

    if (!ingredients || !condition || !region) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('free_recipes_used, is_premium')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User error:', userError);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    // Check free recipe limit
    if (!user.is_premium && user.free_recipes_used >= 2) {
      return res.status(402).json({
        error: 'Free recipe limit reached. Please upgrade to premium.',
        upgradeRequired: true
      });
    }

    // Generate recipes using the enhanced function
    const recipes = generateRecipeSuggestions(ingredients, condition, region, ageGroup);

    // Update user's free recipe count
    if (!user.is_premium) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ free_recipes_used: user.free_recipes_used + 1 })
        .eq('id', userId);

      if (updateError) {
        console.error('Update error:', updateError);
      }
    }

    // Save to history
    try {
      await supabase
        .from('recipe_history')
        .insert({
          user_id: userId,
          ingredients: ingredients,
          condition: condition,
          region: region,
          age_group: ageGroup,
          recipes_generated: recipes
        });
    } catch (historyError) {
      console.log('Recipe history not saved:', historyError.message);
    }

    res.json({
      recipes,
      free_recipes_remaining: user.is_premium ? 'unlimited' : 2 - (user.free_recipes_used + 1),
      is_premium: user.is_premium
    });

  } catch (error) {
    console.error('Generate recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecipeHistory = async (req, res) => {
  try {
    const { data: history, error } = await supabase
      .from('recipe_history')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Additional utility function to get health conditions
export const getHealthConditions = async (req, res) => {
  try {
    const conditions = Object.keys(HEALTH_CONDITIONS).map(key => ({
      id: key,
      name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      ...HEALTH_CONDITIONS[key]
    }));
    
    res.json({ conditions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Additional utility function to get regions
export const getRegions = async (req, res) => {
  try {
    const regions = Object.keys(REGIONAL_CUISINES).map(key => ({
      id: key,
      name: key.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }));
    
    res.json({ regions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};