// pages/api/blogs/featured.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real app, you would fetch from your database or external APIs
    const featuredBlogs = [
      {
        id: '1',
        title: '10 Mediterranean Diet Recipes for Heart Health',
        excerpt: 'Discover delicious Mediterranean-inspired meals that support cardiovascular health.',
        content: '',
        author: 'NutriBridge Team',
        source: 'internal',
        url: '/blog/mediterranean-diet-recipes',
        published_at: new Date().toISOString(),
        category: 'nutrition'
      },
      {
        id: '2',
        title: 'Understanding Food Allergies and Intolerances',
        excerpt: 'A comprehensive guide to identifying and managing food allergies.',
        content: '',
        author: 'Health & Wellness Blog',
        source: 'external',
        url: 'https://example-health-blog.com/food-allergies-guide',
        published_at: new Date(Date.now() - 86400000).toISOString(),
        category: 'conditions'
      },
      // Add more blog posts...
    ];

    res.status(200).json({ blogs: featuredBlogs });
  } catch (error) {
    console.error('Blog API error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
}