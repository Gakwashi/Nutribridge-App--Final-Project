// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

console.log('=== SUPABASE CONFIGURATION ===');
console.log('URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Missing Supabase environment variables. Check your .env.local file.';
  console.error(errorMessage);
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
  throw new Error(errorMessage);
}

console.log('Supabase URL looks valid:', supabaseUrl.startsWith('https://'));
console.log('Creating Supabase client...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

console.log('Supabase client created successfully!');