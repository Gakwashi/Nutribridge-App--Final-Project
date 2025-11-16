// pages/api/payments/initiate.ts - COMPLETE FIXED VERSION
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// OPTION 3: Remove apiVersion entirely - Stripe will use your account's default version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Payment initiation called');
    
    const { amount, currency, paymentMethod } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    console.log('Request data:', { amount, currency, paymentMethod });

    // Validate required fields
    if (!amount || !currency) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing amount or currency' 
      });
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'No authentication token' 
      });
    }

    // Only handle card payments in this endpoint
    if (paymentMethod !== 'card') {
      return res.status(400).json({ 
        success: false,
        error: 'This endpoint only handles card payments' 
      });
    }

    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error(' STRIPE_SECRET_KEY is missing');
      return res.status(500).json({ 
        success: false,
        error: 'Payment system not configured'
      });
    }

    // Create Stripe checkout session
    console.log('Creating Stripe session for:', amount, currency);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'NutriBridge Premium Subscription',
              description: 'Unlimited recipe generation - Monthly plan',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Changed from 'subscription' to 'payment' for one-time payments
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment_cancel`,
      metadata: {
        user_token: token,
        currency: currency
      },
    });

    console.log(' Stripe session created:', session.id);
    console.log(' Checkout URL available:', !!session.url);

    // RETURN THE EXPECTED FORMAT THAT YOUR FRONTEND NEEDS
    return res.status(200).json({ 
      success: true,
      checkoutUrl: session.url, // ← This is what your frontend expects
      sessionId: session.id
    });

  } catch (error: any) {
    console.error(' Stripe API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Payment initiation failed'
    });
  }
}