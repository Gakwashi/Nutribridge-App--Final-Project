// pages/api/auth/profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Verifying token...');
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Decoded token:', decoded);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, is_premium, free_recipes_used, region')
      .eq('id', decoded.userId)
      .single();

    if (error) {
      console.error(' Supabase error:', error);
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('User found:', user.email);
    
    res.status(200).json({ 
      user,
      message: 'Profile fetched successfully'
    });

  } catch (error) {
    console.error(' Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}