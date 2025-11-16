// pages/generate.tsx - UPDATED WITH PROPER FREE RECIPE LIMIT ENFORCEMENT
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

interface GeneratedRecipe {
  name: string;
  ingredients: string[];
  preparation: string;
  healthBenefit: string;
  portion: string;
  cookingTime: string;
  difficulty: string;
}

export default function GenerateRecipes() {
  const router = useRouter();
  const { user, updateUserRecipes } = useAuth();
  const [ingredients, setIngredients] = useState('');
  const [condition, setCondition] = useState('');
  const [region, setRegion] = useState('');
  const [ageGroup, setAgeGroup] = useState('adult');
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [loading, setLoading] = useState(false);

  const healthConditions = [
    'diabetes', 'hypertension', 'anemia', 'obesity', 
    'celiac', 'ibs', 'heart_disease', 'kidney_disease',
    'arthritis', 'osteoporosis'
  ];

  const regions = [
    'East Africa', 'West Africa', 'South Asia', 'East Asia',
    'Latin America', 'Middle East', 'Europe', 'North America'
  ];

  // Check if user has reached free recipe limit
  const hasReachedFreeLimit = user && !user.is_premium && user.free_recipes_used >= user.free_recipe_limit;

  const generateRecipes = async () => {
    // DOUBLE-CHECK free recipe limit before generating
    if (user && !user.is_premium && user.free_recipes_used >= user.free_recipe_limit) {
      if (confirm(`❌ You've used all ${user.free_recipe_limit} free recipes!\n\nUpgrade to premium for unlimited recipe generation.\n\nGo to upgrade page now?`)) {
        router.push('/payment');
      }
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in first');
        router.push('/login');
        return;
      }

      console.log('🔵 Making recipe generation request...');
      
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ingredients: ingredients.split(',').map(i => i.trim()),
          condition,
          region,
          ageGroup
        })
      });

      console.log('🔵 Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('🔴 Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server error: ${response.status} - ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log('🔵 Response data:', data);
      
      // Handle free recipe limit reached response from server
      if (response.status === 402) {
        alert(`❌ ${data.error}\n\nUpgrade to premium for unlimited recipes!`);
        router.push('/payment');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setRecipes(data.recipes);
      
      // Update user's recipe count
      updateUserRecipes();
      
      // Refresh the recipe history page data
      if (typeof window !== 'undefined') {
        const event = new Event('recipesGenerated');
        window.dispatchEvent(event);
      }
    } catch (error: any) {
      console.error('🔴 Recipe generation error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-4">
              Generate Recipes
            </h1>
            <p className="text-lg text-gray-600">
              Create personalized recipes based on your ingredients and preferences
            </p>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/recipes')}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                ← View Your Recipe History
              </button>
            </div>
          </div>

          {/* FREE RECIPE LIMIT WARNING */}
          {hasReachedFreeLimit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <span className="text-2xl mr-2">⚠️</span>
                <h3 className="text-xl font-bold text-yellow-800">Free Recipes Used Up!</h3>
              </div>
              <p className="text-yellow-700 mb-4">
                You've used all {user.free_recipe_limit} free recipes. Upgrade to premium for unlimited recipe generation!
              </p>
              <button
                onClick={() => router.push('/payment')}
                className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          {/* RECIPE COUNTER */}
          {user && !user.is_premium && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-blue-800 font-semibold">
                {user.free_recipe_limit - user.free_recipes_used} free recipes remaining
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${(user.free_recipes_used / user.free_recipe_limit) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* RECIPE GENERATOR FORM */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Recipe Preferences
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Ingredients Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Ingredients (comma-separated) *
                </label>
                <input
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g., chicken, rice, tomatoes, spinach, garlic, olive oil"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  disabled={hasReachedFreeLimit}
                />
                <p className="text-sm text-gray-500 mt-1">Separate ingredients with commas</p>
              </div>

              {/* Health Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Condition (optional)
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={hasReachedFreeLimit}
                >
                  <option value="">Select a condition</option>
                  {healthConditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond.charAt(0).toUpperCase() + cond.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultural Region (optional)
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={hasReachedFreeLimit}
                >
                  <option value="">Select a region</option>
                  {regions.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={hasReachedFreeLimit}
                >
                  <option value="child">Child (1-12)</option>
                  <option value="teen">Teen (13-19)</option>
                  <option value="adult">Adult (20-64)</option>
                  <option value="senior">Senior (65+)</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateRecipes}
              disabled={loading || !ingredients.trim() || hasReachedFreeLimit}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {hasReachedFreeLimit ? (
                '❌ Free Recipes Used Up - Upgrade Required'
              ) : loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Recipes...
                </div>
              ) : (
                `Generate Recipes (${user ? `${user.free_recipe_limit - user.free_recipes_used} free remaining` : ''})`
              )}
            </button>

            {/* Upgrade Prompt */}
            {hasReachedFreeLimit && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push('/payment')}
                  className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  🚀 Upgrade to Premium - Unlimited Recipes
                </button>
              </div>
            )}
          </div>

          {/* RECIPES DISPLAY */}
          {recipes.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Your Generated Recipes
                </h2>
                <p className="text-gray-600">
                  {recipes.length} recipe{recipes.length > 1 ? 's' : ''} generated successfully!
                </p>
                {user && !user.is_premium && (
                  <p className="text-sm text-green-600 mt-2">
                    You have {user.free_recipe_limit - user.free_recipes_used} free recipes remaining
                  </p>
                )}
              </div>
              
              {recipes.map((recipe, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
                  <h3 className="text-2xl font-bold text-green-800 mb-4">{recipe.name}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Ingredients:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {recipe.ingredients.map((ingredient, idx) => (
                          <li key={idx} className="text-gray-600">{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold">Cooking Time:</span> {recipe.cookingTime}
                      </div>
                      <div>
                        <span className="font-semibold">Difficulty:</span> {recipe.difficulty}
                      </div>
                      <div>
                        <span className="font-semibold">Portion:</span> {recipe.portion}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Preparation:</h4>
                    <p className="text-gray-600 whitespace-pre-line">{recipe.preparation}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Health Benefits:</h4>
                    <p className="text-green-700">{recipe.healthBenefit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
