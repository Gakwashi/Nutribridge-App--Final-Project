// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== 'POST') {
    console.log(' Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  console.log('Login API called with:', { 
    email, 
    password: password ? '***' : 'missing',
    hasJWT: !!JWT_SECRET,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  if (!email || !password) {
    console.log(' Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check environment variables
  if (!JWT_SECRET) {
    console.error(' JWT_SECRET is missing');
    return res.status(500).json({ error: 'Server configuration error - JWT_SECRET missing' });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error(' Supabase environment variables are missing');
    return res.status(500).json({ error: 'Server configuration error - Supabase vars missing' });
  }

  try {
    console.log(' Searching for user in Supabase...');
    
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Supabase response:', { 
      userFound: !!user, 
      error: error?.message,
      userId: user?.id 
    });

    if (error || !user) {
      console.log(' User not found:', error?.message);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('User found, verifying password...');

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log(' Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Generating JWT token...');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    console.log('Login successful for user:', user.email);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error(' Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}