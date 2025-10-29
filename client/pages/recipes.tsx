import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

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
        free_recipe_limit: 2,
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
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Your Recipe History</h1>
            
            {userStatus && !userStatus.is_premium && (
              <a 
                href="/payment" 
                className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-center"
              >
                ⭐ Upgrade to Premium
              </a>
            )}
          </div>

          {/* User Status Banner */}
          {userStatus && (
            <div className={`rounded-lg p-4 mb-6 ${
              userStatus.is_premium 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {userStatus.is_premium ? '⭐ Premium Member' : 'Free Account'}
                  </h3>
                  <p className="text-sm opacity-90">
                    {userStatus.is_premium 
                      ? 'Unlimited recipe generations and full history access' 
                      : `${userStatus.free_recipes_used}/${userStatus.free_recipe_limit} free recipes used`
                    }
                  </p>
                </div>
                {!userStatus.is_premium && (
                  <div className="mt-2 sm:mt-0">
                    <p className="text-sm font-medium">
                      {userStatus.free_recipes_used >= userStatus.free_recipe_limit 
                        ? 'Free recipes exhausted' 
                        : `${userStatus.free_recipe_limit - userStatus.free_recipes_used} free recipes remaining`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">{error}</p>
              <p className="text-yellow-700 text-sm mt-1">Showing sample data for demonstration</p>
            </div>
          )}
          
          {recipeHistory.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">No recipes generated yet.</p>
              <a 
                href="/" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Generate Your First Recipe
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Premium Upgrade Prompt for Free Users */}
              {userStatus && !userStatus.is_premium && userStatus.free_recipes_used >= userStatus.free_recipe_limit && (
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">✨ Unlock Unlimited Recipes!</h3>
                  <p className="text-gray-800 mb-4">
                    You've used all {userStatus.free_recipe_limit} free recipes. Upgrade to premium for unlimited access!
                  </p>
                  <a 
                    href="/payment" 
                    className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold inline-block"
                  >
                    Upgrade Now
                  </a>
                </div>
              )}

              {recipeHistory.map((history) => (
                <div key={history.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Generated for {history.condition} in {history.region}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Available ingredients:</span>{' '}
                        {history.ingredients.join(', ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Generated on {new Date(history.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.recipes_generated?.map((recipe, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold text-gray-700 mb-2">{recipe.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Ingredients:</span>{' '}
                          {recipe.ingredients.join(', ')}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Portion:</span> {recipe.portion}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          <span className="font-medium">Health Benefit:</span> {recipe.healthBenefit}
                        </p>
                      </div>
                    ))}
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