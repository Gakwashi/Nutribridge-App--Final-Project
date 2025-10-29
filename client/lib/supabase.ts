// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

console.log('=== SUPABASE CONFIGURATION ===');
console.log('URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Test if the URL is accessible
const testUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (testUrl) {
  console.log('Testing URL accessibility...');
  fetch(testUrl)
    .then(response => console.log('URL test response:', response.status))
    .catch(error => console.log('URL test error:', error.message));
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);