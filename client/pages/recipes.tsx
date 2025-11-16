import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

interface Recipe {
  name: string;
  ingredients: string[];
  portion: string;
  healthBenefit: string;
}

interface RecipeHistory {
  id: string;
  condition: string;
  region: string;
  ingredients: string[];
  created_at: string;
  recipes_generated: Recipe[];
}

interface UserStatus {
  is_premium: boolean;
  free_recipes_used: number;
  free_recipe_limit: number;
  message: string;
}

export default function Recipes() {
  const [recipeHistory, setRecipeHistory] = useState<RecipeHistory[]>([]);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipeHistory();
    
    // Listen for new recipe generations
    const handleRecipesGenerated = () => {
      fetchRecipeHistory();
    };
    
    window.addEventListener('recipesGenerated', handleRecipesGenerated);
    return () => {
      window.removeEventListener('recipesGenerated', handleRecipesGenerated);
    };
  }, []);

  const fetchRecipeHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your recipe history');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/recipes/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      setRecipeHistory(data.history || []);
      setUserStatus(data.user_status);
      
    } catch (error) {
      console.error('Error fetching recipe history:', error);
      setError('Failed to load recipe history');
      // Fallback to mock data
      setRecipeHistory(getMockRecipeHistory());
      setUserStatus({
        is_premium: false,
        free_recipes_used: 2,
        free_recipe_limit: 5,
        message: 'Using demo data - upgrade for full access'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
  const getMockRecipeHistory = (): RecipeHistory[] => [
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
          name: 'Lemon Herb Salmon with Quinoa',
          ingredients: ['salmon fillet', 'fresh spinach', 'quinoa', 'lemon', 'herbs'],
          portion: '2 servings',
          healthBenefit: 'Rich in omega-3, supports heart health'
        }
      ]
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <div className="text-lg">Loading your recipe history...</div>
            <div className="text-sm text-gray-500 mt-2">This may take a moment</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HEADER WITH ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Your Recipe History</h1>
              <p className="text-gray-600 mt-2">View and manage all your generated recipes</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/generate-recipes">
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center">
                  <span className="mr-2">+</span>
                  Generate New Recipes
                </button>
              </Link>
              
              {userStatus && !userStatus.is_premium && (
                <Link href="/payment">
                  <button className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-center flex items-center justify-center">
                    <span className="mr-2">⭐</span>
                    Upgrade to Premium
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* USER STATUS BANNER */}
          {userStatus && (
            <div className={`rounded-xl p-6 mb-8 shadow-sm ${
              userStatus.is_premium 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center mb-4 lg:mb-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    userStatus.is_premium ? 'bg-green-400' : 'bg-blue-400'
                  }`}>
                    <span className="text-xl">
                      {userStatus.is_premium ? '⭐' : '👤'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {userStatus.is_premium ? 'Premium Member' : 'Free Account'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {userStatus.is_premium 
                        ? 'Unlimited recipe generations and full history access' 
                        : `${userStatus.free_recipes_used}/${userStatus.free_recipe_limit} free recipes used`
                      }
                    </p>
                  </div>
                </div>
                {!userStatus.is_premium && (
                  <div className="text-center lg:text-right">
                    <p className="text-sm font-medium mb-2">
                      {userStatus.free_recipes_used >= userStatus.free_recipe_limit 
                        ? '🎉 All free recipes used!' 
                        : `${userStatus.free_recipe_limit - userStatus.free_recipes_used} free recipes remaining`
                      }
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${(userStatus.free_recipes_used / userStatus.free_recipe_limit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <span className="text-yellow-600 text-lg mr-3">⚠️</span>
                <div>
                  <p className="text-yellow-800 font-medium">{error}</p>
                  <p className="text-yellow-700 text-sm mt-1">Showing sample data for demonstration purposes</p>
                </div>
              </div>
            </div>
          )}
          
          {/* RECIPE HISTORY CONTENT */}
          {recipeHistory.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🍳</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Recipes Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven't generated any recipes yet. Start by creating your first personalized recipe!
              </p>
              <Link href="/generate-recipes">
                <button className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg">
                  Generate Your First Recipe
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PREMIUM UPGRADE PROMPT */}
              {userStatus && !userStatus.is_premium && userStatus.free_recipes_used >= userStatus.free_recipe_limit && (
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-center shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">✨ Unlock Unlimited Recipes!</h3>
                  <p className="text-gray-800 mb-4">
                    You've used all {userStatus.free_recipe_limit} free recipes. Upgrade to premium for unlimited access to recipe generation!
                  </p>
                  <Link href="/payment">
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                      Upgrade to Premium
                    </button>
                  </Link>
                </div>
              )}

              {/* RECIPE HISTORY LIST */}
              <div className="grid gap-6">
                {recipeHistory.map((history) => (
                  <div key={history.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {history.condition || 'General'} Recipes - {history.region || 'Any Region'}
                          </h3>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {history.recipes_generated?.length || 0} recipe{history.recipes_generated?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium">Available ingredients:</span>{' '}
                          {history.ingredients.join(', ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Generated on {new Date(history.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {history.recipes_generated?.map((recipe, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors">
                          <h4 className="font-semibold text-gray-800 mb-3 text-lg">{recipe.name}</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-sm text-gray-700">Ingredients:</span>
                              <p className="text-sm text-gray-600 mt-1">{recipe.ingredients.join(', ')}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm text-gray-700">Portion: {recipe.portion}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <span className="font-medium text-sm text-green-700">Health Benefit:</span>
                              <p className="text-sm text-green-600 mt-1">{recipe.healthBenefit}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTTOM CTA */}
              <div className="text-center mt-12">
                <div className="bg-white rounded-xl shadow-md p-8 border border-green-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to create more recipes?</h3>
                  <p className="text-gray-600 mb-6">Generate new personalized recipes based on your current ingredients and preferences.</p>
                  <Link href="/generate-recipes">
                    <button className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg">
                      Generate New Recipes
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}