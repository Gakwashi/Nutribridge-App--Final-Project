// pages/api/forum/posts/preview.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log(' Fetching preview posts...');
    
    // Get limited posts for preview (no auth required)
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
      .limit(3);

    if (error) {
      console.error(' Supabase error:', error);
      throw error;
    }

    console.log(' Preview posts fetched:', posts?.length || 0);
    
    res.status(200).json({ 
      posts: posts || [],
      message: 'Preview posts fetched successfully'
    });

  } catch (error) {
    console.error(' Preview posts error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch preview posts',
      posts: [] // Return empty array so frontend can use mock data
    });
  }
}