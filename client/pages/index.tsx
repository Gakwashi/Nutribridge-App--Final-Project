// pages/index.tsx - UPDATED (No testimonials)
import Layout from '../components/Layout';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* HERO SECTION */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-green-800 mb-6">
              NutriBridge
            </h1>
            <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your ingredients into personalized, culturally-relevant recipes tailored to your health needs
            </p>
            <div className="flex gap-4 justify-center mb-12 flex-wrap">
              {user ? (
                <>
                  <Link href="/generate">
                    <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                      Generate New Recipes
                    </button>
                  </Link>
                  <Link href="/recipes">
                    <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
                      View Recipe History
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                      Get Started Free
                    </button>
                  </Link>
                  <Link href="/login">
                    <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
                      Login
                    </button>
                  </Link>
                </>
              )}
            </div>
            {user && !user.is_premium && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
                <p className="text-yellow-800 font-semibold">
                  🎉 You have {user.free_recipe_limit - user.free_recipes_used} free recipes remaining!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-16 bg-white px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
              Why Choose NutriBridge?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🍳</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Recipe Generation</h3>
                <p className="text-gray-600">
                  Create personalized recipes based on your available ingredients, dietary needs, and cultural preferences
                </p>
              </div>
              
              <div className="text-center p-6 hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❤️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Health-Focused</h3>
                <p className="text-gray-600">
                  Tailored recipes for specific health conditions like diabetes, hypertension, and more
                </p>
              </div>
              
              <div className="text-center p-6 hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Cultural Relevance</h3>
                <p className="text-gray-600">
                  Recipes adapted to different cultural regions and traditional cooking styles
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
                <h3 className="font-semibold mb-2">Enter Ingredients</h3>
                <p className="text-sm text-gray-600">List what you have available</p>
              </div>
              <div className="text-center hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
                <h3 className="font-semibold mb-2">Set Preferences</h3>
                <p className="text-sm text-gray-600">Choose health needs & region</p>
              </div>
              <div className="text-center hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
                <h3 className="font-semibold mb-2">Generate</h3>
                <p className="text-sm text-gray-600">AI creates custom recipes</p>
              </div>
              <div className="text-center hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">4</div>
                <h3 className="font-semibold mb-2">Cook & Enjoy</h3>
                <p className="text-sm text-gray-600">Follow step-by-step instructions</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 bg-green-600 text-white px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Cooking?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start generating personalized recipes today
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {user ? (
                <Link href="/generate">
                  <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
                    Generate Recipes
                  </button>
                </Link>
              ) : (
                <Link href="/signup">
                  <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
                    Start Free Trial
                  </button>
                </Link>
              )}
              <Link href="/about">
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}