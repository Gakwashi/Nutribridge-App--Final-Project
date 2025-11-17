// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase'; // CHANGED: Import getSupabase instead of supabase
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ADDED: Get supabase client at runtime
  const supabase = getSupabase();
  
  console.log(' === LOGIN API DEBUG START ===');
  console.log(' Request method:', req.method);
  console.log(' Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(' Handling CORS preflight');
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

  console.log(' Login API called with:', { 
    email, 
    password: password ? '***' : 'missing',
    body: req.body
  });

  // Check environment variables
  console.log(' ENVIRONMENT CHECK:', {
    hasJWT: !!JWT_SECRET,
    JWT_LENGTH: JWT_SECRET?.length,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (first 10 chars): ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'MISSING'
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
    console.log('Supabase config:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      table: 'users',
      email: email
    });
    
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log(' SUPABASE RESPONSE:', { 
      userFound: !!user, 
      error: error?.message,
      errorDetails: error,
      userId: user?.id,
      userEmail: user?.email,
      userCreated: user?.created_at
    });

    if (error || !user) {
      console.log('User not found or Supabase error:', error?.message);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('User found in database:', {
      id: user.id,
      email: user.email,
      passwordHash: user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'MISSING',
      hashLength: user.password_hash?.length
    });

    console.log(' Verifying password...');
    console.log(' Input password length:', password.length);
    console.log(' Stored hash length:', user.password_hash?.length);
    console.log(' Hash prefix:', user.password_hash?.substring(0, 10));

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log(' PASSWORD VALIDATION RESULT:', isPasswordValid);

    if (!isPasswordValid) {
      console.log(' Password mismatch for user:', email);
      console.log(' This means:');
      console.log(' - Either the password is wrong');
      console.log(' - Or the hash in database doesnt match bcrypt format');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(' Password correct, generating JWT token...');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(' JWT token generated, length:', token.length);

    // Return user data (without password) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    console.log(' LOGIN SUCCESSFUL for user:', user.email);
    console.log(' User data to return:', {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email
    });
    console.log(' === LOGIN API DEBUG END ===');
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error(' LOGIN ERROR DETAILS:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    console.log(' === LOGIN API DEBUG END ===');
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}