import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-green-800 mb-6">About NutriBridge</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-600 mb-6">
                NutriBridge is a global nutrition application designed to bridge the gap between 
                available ingredients and healthy eating, especially for people with chronic health conditions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold text-green-800 mb-4">Our Mission</h2>
                  <p className="text-gray-700">
                    To make healthy eating accessible and affordable for everyone, regardless of 
                    their location, budget, or health conditions. We support Sustainable Development 
                    Goals for Zero Hunger and Good Health.
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold text-blue-800 mb-4">How It Works</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Input your available ingredients</li>
                    <li>Specify your health condition</li>
                    <li>Select your cultural context</li>
                    <li>Get personalized, culturally-relevant recipes</li>
                  </ul>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold">🌍</span>
                    </div>
                    <h3 className="font-semibold">Global Reach</h3>
                    <p className="text-sm text-gray-600">Recipes tailored to 8+ global regions</p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold">🏥</span>
                    </div>
                    <h3 className="font-semibold">Health Focus</h3>
                    <p className="text-sm text-gray-600">10+ chronic conditions supported</p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold">💸</span>
                    </div>
                    <h3 className="font-semibold">Affordable</h3>
                    <p className="text-sm text-gray-600">Uses locally available ingredients</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Supported Health Conditions</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  {['Diabetes', 'Hypertension', 'Anemia', 'Obesity', 'Celiac', 'IBS', 'Heart Disease', 'Kidney Disease', 'Arthritis', 'Osteoporosis'].map((condition) => (
                    <span key={condition} className="bg-gray-100 px-3 py-1 rounded-full text-center">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}