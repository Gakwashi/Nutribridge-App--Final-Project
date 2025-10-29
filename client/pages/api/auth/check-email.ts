// pages/api/auth/check-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if email exists in Supabase
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    // If we find a user, email exists
    const exists = !!data;
    
    res.status(200).json({ exists });

  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}