// pages/terms.tsx
import Layout from '../components/Layout';
import Head from 'next/head';

export default function Terms() {
  return (
    <Layout>
      <Head>
        <title>Terms of Service - NutriBridge</title>
        <meta name="description" content="NutriBridge Terms of Service" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().getFullYear()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using NutriBridge, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Use License</h2>
                <p className="text-gray-700 mb-4">
                  Permission is granted to temporarily use NutriBridge for personal, non-commercial transitory viewing only.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Account</h2>
                <p className="text-gray-700 mb-4">
                  You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Community Guidelines</h2>
                <p className="text-gray-700 mb-4">
                  Our community is built on respect and support. Harassment, hate speech, or inappropriate content will not be tolerated.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Subscription Services</h2>
                <p className="text-gray-700 mb-4">
                  Premium features are available through subscription. Payments are processed securely and subscriptions auto-renew unless canceled.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about these Terms, please contact us at support@nutribridge.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}