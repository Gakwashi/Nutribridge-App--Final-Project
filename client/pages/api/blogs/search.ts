// pages/api/blogs/search.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;

  try {
    // Mock search results - replace with actual search logic
    const searchResults = [
      {
        id: 'search-1',
        title: `Search results for: ${q}`,
        excerpt: `Articles and resources related to "${q}"`,
        content: '',
        author: 'Various Sources',
        source: 'internal',
        url: '#',
        published_at: new Date().toISOString(),
        category: 'search'
      }
    ];

    res.status(200).json({ blogs: searchResults });
  } catch (error) {
    console.error('Blog search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}