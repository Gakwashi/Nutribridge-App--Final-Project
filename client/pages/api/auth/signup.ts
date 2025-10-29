// pages/api/auth/signup.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    console.log(' Checking if email exists:', email);
    
    // First check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means "not found"
      console.error(' Email check error:', checkError);
    }

    if (existingUser) {
      console.log(' Email already exists');
      return res.status(409).json({ error: 'Email already registered' });
    }

    console.log(' Email is available, hashing password...');
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log(' Creating user in Supabase...');
    
    // Create user in Supabase
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error(' Supabase create error:', createError);
      console.error(' Error details:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint
      });
      return res.status(500).json({ error: `Failed to create user: ${createError.message}` });
    }

    console.log(' User created successfully:', user.id);
    
    // Return success (don't return password hash)
    const { password_hash, ...userWithoutPassword } = user;
    res.status(201).json({ 
      message: 'User created successfully',
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error(' Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
