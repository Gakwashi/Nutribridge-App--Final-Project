// pages/privacy.tsx
import Layout from '../components/Layout';
import Head from 'next/head';

export default function Privacy() {
  return (
    <Layout>
      <Head>
        <title>Privacy Policy - NutriBridge</title>
        <meta name="description" content="NutriBridge Privacy Policy" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().getFullYear()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
                <p className="text-gray-700 mb-4">
                  We collect information you provide directly to us, such as when you create an account, update your profile, or use our services.
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Account information (name, email, password)</li>
                  <li>Profile information (dietary preferences, health goals)</li>
                  <li>Community posts and interactions</li>
                  <li>Payment information for premium services</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Personalize your experience</li>
                  <li>Process your transactions</li>
                  <li>Send you technical notices and support messages</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Your Rights</h2>
                <p className="text-gray-700 mb-4">
                  You have the right to access, correct, or delete your personal data. You can also object to or restrict certain processing of your data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Community Data</h2>
                <p className="text-gray-700 mb-4">
                  Posts and interactions in our community forums are visible to other members. Please be mindful of the personal information you share publicly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy, please contact us at privacy@nutribridge.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}