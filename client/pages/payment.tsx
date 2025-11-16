// pages/payment.tsx - COMPLETE UPDATED VERSION
import { useState } from 'react';
import Layout from '../components/Layout';

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currency, setCurrency] = useState('USD');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Exchange rate (use real API in production)
  const exchangeRates = {
    USD: 1,
    KES: 150 // Example rate - replace with real API
  };

  const baseAmount = 4.99;
  const convertedAmount = currency === 'KES' 
    ? (baseAmount * exchangeRates.KES).toFixed(0) // Round to whole KES
    : baseAmount.toFixed(2);

  const displayAmount = currency === 'USD' 
    ? `$${convertedAmount}` 
    : `KES ${convertedAmount}`;

  const handlePayment = async () => {
    // Validate M-Pesa phone number
    if (paymentMethod === 'mpesa' && !phoneNumber) {
      alert('Please enter your M-Pesa phone number');
      return;
    }

    if (paymentMethod === 'mpesa' && !phoneNumber.match(/^(?:254|\+254|0)?(7\d{8})$/)) {
      alert('Please enter a valid Kenyan phone number');
      return;
    }

    // M-PESA PAYMENT (TEST MODE)
    if (paymentMethod === 'mpesa') {
      alert(`TEST MODE: Simulating M-Pesa payment of ${displayAmount}`);
      
      setLoading(true);
      try {
        const upgradeResponse = await fetch('/api/payments/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Check if response is JSON
        const contentType = upgradeResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
        
        const upgradeData = await upgradeResponse.json();
        
        if (!upgradeResponse.ok) {
          throw new Error(upgradeData.error || 'Upgrade failed');
        }
        
        if (upgradeData.success) {
          alert('TEST: Payment successful! Premium access activated.');
          window.location.href = '/';
        } else {
          alert('Upgrade failed: ' + upgradeData.error);
        }
      } catch (error) {
        alert('Upgrade error: ' + error.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // CARD PAYMENT (REAL STRIPE INTEGRATION)
    if (paymentMethod === 'card') {
      setLoading(true);
      try {
        console.log(' Starting card payment process...');
        
        const response = await fetch('/api/payments/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            paymentMethod: 'card', // Explicitly set to 'card'
            currency,
            amount: parseFloat(convertedAmount)
            // No phoneNumber for card payments
          })
        });

        console.log(' Payment API response status:', response.status);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error(' Non-JSON response:', text.substring(0, 200));
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log(' Payment response data:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Payment initiation failed');
        }

        if (data.success && data.checkoutUrl) {
          console.log(' Redirecting to Stripe checkout:', data.checkoutUrl);
          // Redirect to Stripe Checkout
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error('No checkout URL received from server');
        }
      } catch (error: any) {
        console.error(' Card payment error:', error);
        alert('Payment failed: ' + error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback for unknown payment methods
    alert('Unknown payment method selected');
  };

  // Format phone number to 254 format for M-Pesa
  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Convert to 254 format
    if (digits.startsWith('0')) {
      return '254' + digits.substring(1);
    } else if (digits.startsWith('254')) {
      return digits;
    } else if (digits.startsWith('7') && digits.length === 9) {
      return '254' + digits;
    }
    
    return digits;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Upgrade to Premium</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Premium Benefits:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li> Unlimited recipe generations</li>
              <li> Access to community forums</li>
              <li> Personalized portion recommendations</li>
              <li> Priority support</li>
              <li>Advanced nutrition insights</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              <option value="USD">USD ($)</option>
              <option value="KES">KES (Kenyan Shilling)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              <option value="card"> Credit/Debit Card</option>
              <option value="mpesa"> M-Pesa (Kenya)</option>
            </select>
          </div>

          {paymentMethod === 'mpesa' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 0712345678 or 254712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Safaricom phone number
              </p>
            </div>
          )}

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-center text-green-800">
              Amount: {displayAmount}/month
            </h3>
            {currency === 'KES' && (
              <p className="text-sm text-green-600 text-center mt-1">
                (Approximately ${baseAmount})
              </p>
            )}
            <p className="text-xs text-green-600 text-center mt-2">
              Cancel anytime • No hidden fees
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-semibold transition duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              ` Upgrade Now - ${displayAmount}/month`
            )}
          </button>

          <div className="mt-4 text-xs text-gray-500 text-center">
            {paymentMethod === 'mpesa' && (
              <p>TEST MODE: No real payment will be processed</p>
            )}
            {paymentMethod === 'card' && (
              <p> Secure payment powered by Stripe</p>
            )}
            <p className="mt-1">256-bit SSL encryption • Your data is safe</p>
          </div>

          {/* Payment Method Instructions */}
          {paymentMethod === 'card' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-semibold text-blue-800 text-sm mb-1">💡 Test Card</h4>
              <p className="text-xs text-blue-600">
                Use: <strong>4242 4242 4242 4242</strong> • Any future date • Any CVC
              </p>
            </div>
          )}

          {paymentMethod === 'mpesa' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-semibold text-yellow-800 text-sm mb-1">💡 Test Mode</h4>
              <p className="text-xs text-yellow-600">
                M-Pesa payments are in test mode. No real money will be deducted.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}