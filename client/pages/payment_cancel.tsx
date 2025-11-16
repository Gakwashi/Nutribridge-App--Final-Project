// pages/payment_cancel.tsx
import Layout from '../components/Layout';

export default function PaymentCancel() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">✗</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges were made.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    </Layout>
  );
}