import supabase from '../config/db.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { email, password, name, region, age_group = 'adult' } = req.body;

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          region: region,
          age_group: age_group
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(400).json({ 
        error: authError.message || 'Registration failed' 
      });
    }

    // 2. Create profile in public.profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: email,
          name: name,
          region: region,
          age_group: age_group,
          free_recipes_used: 0,
          is_premium: false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Try to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: 'Profile creation failed' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: authData.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        region: profile.region,
        age_group: profile.age_group,
        free_recipes_used: profile.free_recipes_used,
        is_premium: profile.is_premium
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Error fetching user profile' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: authData.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        region: profile.region,
        age_group: profile.age_group,
        free_recipes_used: profile.free_recipes_used,
        is_premium: profile.is_premium
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        region: profile.region,
        age_group: profile.age_group,
        free_recipes_used: profile.free_recipes_used,
        is_premium: profile.is_premium
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
};