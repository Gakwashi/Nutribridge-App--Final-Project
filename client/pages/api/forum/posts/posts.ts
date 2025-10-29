// pages/api/forum/posts.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Fetching forum posts...');
    
    // Get posts from database
    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(`
        id,
        title,
        content,
        category,
        created_at,
        users:user_id (name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Posts fetched:', posts?.length || 0);
    
    res.status(200).json({ 
      posts: posts || [],
      message: 'Posts fetched successfully'
    });

  } catch (error) {
    console.error('Posts error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      posts: []
    });
  }
}