import { useState } from 'react';
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

export default function Home() {
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

  const generateRecipes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in first');
        return;
      }

      console.log('🔵 Making recipe generation request...');
      console.log('🔵 Ingredients:', ingredients);
      console.log('🔵 Token exists:', !!token);
      
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
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('🔴 Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server error: ${response.status} - ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log('🔵 Response data:', data);
      
      if (response.status === 402) {
        alert(data.error);
        window.location.href = '/payment';
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setRecipes(data.recipes);
    } catch (error: any) {
      console.error('🔴 Recipe generation error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-green-800 mb-4">
              NutriBridge
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Generate personalized, culturally-relevant recipes based on your available ingredients and health needs
            </p>
          </div>

          {/* RECIPE GENERATOR FORM */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create Your Recipe
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Ingredients Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Ingredients (comma-separated)
                </label>
                <input
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g., chicken, rice, tomatoes, spinach"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                  Cultural Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              disabled={loading || !ingredients.trim()}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating Recipes...' : 'Generate Recipes'}
            </button>
          </div>

          {/* RECIPES DISPLAY */}
          {recipes.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 text-center">
                Your Generated Recipes
              </h2>
              {recipes.map((recipe, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-green-800 mb-4">
                    {recipe.name}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <strong>Portion:</strong> {recipe.portion}
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <strong>Time:</strong> {recipe.cookingTime}
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <strong>Difficulty:</strong> {recipe.difficulty}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-gray-800">
                        Ingredients
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {recipe.ingredients.map((ingredient, idx) => (
                          <li key={idx}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-gray-800">
                        Preparation
                      </h4>
                      <p className="text-gray-600 whitespace-pre-line">
                        {recipe.preparation}
                      </p>
                    </div>
                  </div>

                  {recipe.healthBenefit && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">
                        Health Benefit
                      </h4>
                      <p className="text-green-700">{recipe.healthBenefit}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* DEBUG INFO (remove after testing) */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
            <p className="text-yellow-700 text-sm">
              Check browser console for detailed request/response logs
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}