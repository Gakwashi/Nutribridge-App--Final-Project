import express from 'express';
import auth from '../middleware/auth.js';
import supabase from '../config/db.js';

const router = express.Router();

// Get all forum posts
router.get('/posts', auth, async (req, res) => {
  try {
    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts by category
router.get('/posts/category/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;

    const { data: posts, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new forum post
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.userId;

    // Check if user is premium
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (!user.is_premium) {
      return res.status(403).json({
        error: 'Premium subscription required to access community forums'
      });
    }

    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert([
        {
          user_id: userId,
          title,
          content,
          category: category || 'general'
        }
      ])
      .select(`
        *,
        users:user_id (name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single post with comments
router.get('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get comments for this post
    const { data: comments, error: commentsError } = await supabase
      .from('forum_comments')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    res.json({ post, comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to post
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    // Check if user is premium
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (!user.is_premium) {
      return res.status(403).json({
        error: 'Premium subscription required to participate in community forums'
      });
    }

    const { data: comment, error } = await supabase
      .from('forum_comments')
      .insert([
        {
          post_id: id,
          user_id: userId,
          content
        }
      ])
      .select(`
        *,
        users:user_id (name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get forum categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = [
      { id: 'recipes', name: 'Recipe Sharing', description: 'Share your healthy recipes' },
      { id: 'nutrition', name: 'Nutrition Tips', description: 'Discuss nutrition and diet' },
      { id: 'conditions', name: 'Health Conditions', description: 'Support for specific health issues' },
      { id: 'cooking', name: 'Cooking Techniques', description: 'Share cooking methods and tips' },
      { id: 'general', name: 'General Discussion', description: 'General health and wellness topics' }
    ];

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;