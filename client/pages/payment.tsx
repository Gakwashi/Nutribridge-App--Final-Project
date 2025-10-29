import { useState } from 'react';
import Layout from '../components/Layout';

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentMethod,
          region: 'Kenya' // You can get this from user profile
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Upgrade user to premium
        const upgradeResponse = await fetch('/api/payments/upgrade', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const upgradeData = await upgradeResponse.json();
        
        if (upgradeData.success) {
          alert('Payment successful! You now have premium access.');
          window.location.href = '/';
        }
      }
    } catch (error) {
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Upgrade to Premium</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Benefits:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Unlimited recipe generations</li>
              <li>Access to community forums</li>
              <li>Personalized portion recommendations</li>
              <li>Priority support</li>
            </ul>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="mpesa">M-Pesa (Kenya)</option>
            </select>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Processing...' : 'Upgrade Now - $4.99/month'}
          </button>
        </div>
      </div>
    </Layout>
  );
}