// pages/payment-success.tsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function PaymentSuccess() {
  const router = useRouter();
  const [upgrading, setUpgrading] = useState(true);

  useEffect(() => {
    // Upgrade user to premium
    const upgradeUser = async () => {
      try {
        const response = await fetch('/api/payments/upgrade', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setUpgrading(false);
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Upgrade error:', error);
      }
    };

    upgradeUser();
  }, [router]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            {upgrading ? 'Upgrading your account...' : 'Your payment was processed successfully.'}
          </p>
          {!upgrading && (
            <p className="text-sm text-gray-500">
              Redirecting you to the home page...
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}