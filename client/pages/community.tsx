import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  source: 'internal' | 'community' | 'external';
  url: string;
  published_at: string;
  category: string;
  featured_image?: string;
}

export default function Community() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [previewPosts, setPreviewPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forum' | 'blogs'>('forum');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);

  useEffect(() => {
    checkUserStatus();
    fetchCategories();
    fetchPreviewPosts();
    fetchFeaturedBlogs();
  }, []);

  useEffect(() => {
    if (user?.is_premium) {
      fetchPosts();
    }
  }, [user, selectedCategory]);

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.error('Profile fetch failed:', response.status);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔄 Fetching categories from API...');
      
      const response = await fetch('/api/forum/categories');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Categories API response:', data);

      // Your API returns { success: true, categories: [...] }
      if (data.success && data.categories && Array.isArray(data.categories)) {
        console.log(`✅ Successfully loaded ${data.categories.length} categories`);
        setCategories(data.categories);
      } else if (data.categories && Array.isArray(data.categories)) {
        // Fallback in case success flag is missing
        console.log(`✅ Successfully loaded ${data.categories.length} categories`);
        setCategories(data.categories);
      } else {
        console.warn('⚠️ Unexpected response format, using mock data');
        setCategories(getMockCategories());
      }
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      console.log('🔄 Falling back to mock categories...');
      setCategories(getMockCategories());
    }
  };

  const getMockCategories = (): Category[] => [
    { id: 'general', name: 'General Discussion', description: 'General topics and introductions' },
    { id: 'recipes', name: 'Recipe Sharing', description: 'Share and discuss recipes' },
    { id: 'support', name: 'Support & Advice', description: 'Get help and share experiences' },
    { id: 'nutrition', name: 'Nutrition Tips', description: 'Nutrition advice and tips' }
  ];

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token available for fetching posts');
        return;
      }

      const endpoint = selectedCategory === 'all' 
        ? '/api/forum/posts'
        : `/api/forum/posts/category/${selectedCategory}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts:', response.status);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
  };

  const fetchPreviewPosts = async () => {
    try {
      const response = await fetch('/api/forum/posts/preview');
      
      if (response.ok) {
        const data = await response.json();
        setPreviewPosts(data.posts || []);
      } else {
        console.error('Failed to fetch preview posts:', response.status);
        setPreviewPosts(getMockPreviewPosts());
      }
    } catch (error) {
      console.error('Error fetching preview posts:', error);
      setPreviewPosts(getMockPreviewPosts());
    }
  };

  const fetchFeaturedBlogs = async () => {
    setBlogLoading(true);
    try {
      const response = await fetch('/api/blogs/featured');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      } else {
        setBlogs(getMockBlogs());
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs(getMockBlogs());
    } finally {
      setBlogLoading(false);
    }
  };

  const searchBlogs = async (query: string) => {
    if (!query.trim()) {
      fetchFeaturedBlogs();
      return;
    }

    setBlogLoading(true);
    try {
      const response = await fetch(`/api/blogs/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      } else {
        console.error('Failed to search blogs:', response.status);
      }
    } catch (error) {
      console.error('Error searching blogs:', error);
    } finally {
      setBlogLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to create a post');
        return;
      }

      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPost)
      });

      if (response.ok) {
        setNewPost({ title: '', content: '', category: 'general' });
        setShowNewPostForm(false);
        fetchPosts();
        alert('Post created successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    }
  };

  // Mock data functions
  const getMockPreviewPosts = (): ForumPost[] => [
    {
      id: '1',
      title: 'Welcome to Our Community! 🌟',
      content: 'This is a supportive space where we share recipes, tips, and encouragement on our health journeys.',
      category: 'general',
      created_at: new Date().toISOString(),
      users: { name: 'Community Admin', email: 'admin@nutribridge.com' }
    },
    {
      id: '2',
      title: 'Quick Healthy Breakfast Ideas',
      content: 'Looking for fast, nutritious breakfast options? Here are some favorites...',
      category: 'recipes',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      users: { name: 'Health Enthusiast', email: 'user@example.com' }
    }
  ];

  const getMockBlogs = (): BlogPost[] => [
    {
      id: '1',
      title: '10 Mediterranean Diet Recipes for Heart Health',
      excerpt: 'Discover delicious Mediterranean-inspired meals that support cardiovascular health and overall wellness.',
      content: '',
      author: 'NutriBridge Team',
      source: 'internal',
      url: '/blog/mediterranean-diet-recipes',
      published_at: new Date().toISOString(),
      category: 'nutrition',
      featured_image: '/images/mediterranean-diet.jpg'
    },
    {
      id: '2',
      title: 'Managing Diabetes Through Diet: A Practical Guide',
      excerpt: 'Learn how to make smart food choices that help maintain stable blood sugar levels.',
      content: '',
      author: 'Dr. Sarah Chen',
      source: 'external',
      url: 'https://healthblog.example.com/diabetes-diet-guide',
      published_at: new Date(Date.now() - 86400000).toISOString(),
      category: 'conditions'
    },
    {
      id: '3',
      title: 'My Journey with Food Allergies - Tips & Recipes',
      excerpt: 'A community member shares their experience managing multiple food allergies while maintaining a balanced diet.',
      content: '',
      author: 'Alex Johnson',
      source: 'community',
      url: '/community/posts/3',
      published_at: new Date(Date.now() - 172800000).toISOString(),
      category: 'personal-stories'
    },
    {
      id: '4',
      title: 'The Science Behind Intermittent Fasting',
      excerpt: 'Exploring the research on intermittent fasting and its potential health benefits.',
      content: '',
      author: 'Health Research Institute',
      source: 'external',
      url: 'https://nutritionresearch.org/intermittent-fasting',
      published_at: new Date(Date.now() - 259200000).toISOString(),
      category: 'research'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading community...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access community</h2>
            <a href="/login" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Log In
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  // PREVIEW MODE - Free users
  if (!user.is_premium) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-8 text-white">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Community & Health Resources</h1>
                  <p className="text-green-100">
                    Connect with others and access valuable health information
                  </p>
                </div>
                <a 
                  href="/payment" 
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Upgrade to Join
                </a>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('blogs')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'blogs'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Health Blogs & Articles
              </button>
              <button
                onClick={() => setActiveTab('forum')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'forum'
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Community Forum
              </button>
            </div>

            {/* BLOGS TAB */}
            {activeTab === 'blogs' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Health Blogs & Resources</h2>
                  <p className="text-gray-600">
                    Access curated health articles from our team, community members, and trusted external sources.
                  </p>
                </div>

                {/* Blog Search */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Search health topics..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      onChange={(e) => searchBlogs(e.target.value)}
                    />
                    <button 
                      onClick={() => searchBlogs('')}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Blog Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['All', 'Nutrition', 'Recipes', 'Conditions', 'Wellness', 'Research'].map(category => (
                    <button
                      key={category}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Blog Posts */}
                <div className="space-y-6">
                  {blogLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <div className="text-gray-600">Loading blogs...</div>
                    </div>
                  ) : (
                    blogs.map(blog => (
                      <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            {blog.featured_image && (
                              <div className="sm:w-32 sm:h-32 bg-gray-200 rounded-lg flex-shrink-0">
                                <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                                  📷
                                </div>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  blog.source === 'internal' 
                                    ? 'bg-green-100 text-green-800'
                                    : blog.source === 'community'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {blog.source === 'internal' ? 'Official' : 
                                   blog.source === 'community' ? 'Community' : 'External'}
                                </span>
                                <span className="text-sm text-gray-500">{blog.category}</span>
                              </div>
                              
                              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {blog.title}
                              </h3>
                              
                              <p className="text-gray-600 mb-3">
                                {blog.excerpt}
                              </p>
                              
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                  By {blog.author} • {new Date(blog.published_at).toLocaleDateString()}
                                </div>
                                <a
                                  href={blog.url}
                                  target={blog.source === 'external' ? '_blank' : '_self'}
                                  rel={blog.source === 'external' ? 'noopener noreferrer' : ''}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                  Read {blog.source === 'external' && '→'}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* FORUM TAB - Preview for free users */}
            {activeTab === 'forum' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Community Forum Preview</h2>
                  <p className="text-gray-600 mb-6">
                    Here's a glimpse of what our community members are discussing. Upgrade to join conversations.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {previewPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                        <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                          Preview
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {post.content.length > 150 
                          ? post.content.substring(0, 150) + '...' 
                          : post.content
                        }
                      </p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>By {post.users.name}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <p className="text-yellow-800 text-sm">
                            <strong>Join the conversation!</strong> Upgrade to read full posts and participate.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade Benefits */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">What You Get with Premium:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <span className="text-green-600">💬</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Join Discussions</h4>
                    <p className="text-gray-600 text-sm">Participate in community conversations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <span className="text-green-600">📝</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Create Posts</h4>
                    <p className="text-gray-600 text-sm">Share your experiences and questions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <span className="text-green-600">📚</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Exclusive Content</h4>
                    <p className="text-gray-600 text-sm">Access premium articles and resources</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <span className="text-green-600">🔍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Advanced Search</h4>
                    <p className="text-gray-600 text-sm">Find specific health information</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <a 
                  href="/payment" 
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
                >
                  Upgrade Now to Access Everything
                </a>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // PREMIUM USER VIEW - Full access to both forums and blogs
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Community & Health Resources</h1>
              <p className="text-gray-600 mt-2">
                Connect with others and access valuable health information
              </p>
            </div>
            <button
              onClick={() => setShowNewPostForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              New Post
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('forum')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'forum'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Community Forum
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'blogs'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Health Blogs & Articles
            </button>
          </div>

          {/* FORUM TAB - Premium users */}
          {activeTab === 'forum' && (
            <div>
              {/* Categories Filter */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category:
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Posts List */}
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-4">No posts found in this category</div>
                    <button
                      onClick={() => setShowNewPostForm(true)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create the first post!
                    </button>
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">{post.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <span>By {post.users.name}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {categories.find(cat => cat.id === post.category)?.name || post.category}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* BLOGS TAB - Premium users */}
          {activeTab === 'blogs' && (
            <div>
              {/* Blog Search and Filter */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search health topics, conditions, recipes..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onChange={(e) => searchBlogs(e.target.value)}
                  />
                  <button 
                    onClick={() => searchBlogs('')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
                
                {/* Blog Categories */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['All', 'Nutrition', 'Recipes', 'Diabetes', 'Heart Health', 'Weight Management', 'Mental Wellness', 'Research'].map(category => (
                    <button
                      key={category}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blog Posts */}
              <div className="space-y-6">
                {blogLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <div className="text-gray-600">Loading health resources...</div>
                  </div>
                ) : (
                  blogs.map(blog => (
                    <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {blog.featured_image && (
                            <div className="sm:w-32 sm:h-32 bg-gray-200 rounded-lg flex-shrink-0">
                              <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                                📷
                              </div>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                blog.source === 'internal' 
                                  ? 'bg-green-100 text-green-800'
                                  : blog.source === 'community'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {blog.source === 'internal' ? 'Official' : 
                                 blog.source === 'community' ? 'Community' : 'External Source'}
                              </span>
                              <span className="text-sm text-gray-500">{blog.category}</span>
                              {blog.source === 'external' && (
                                <span className="text-xs text-gray-400"> External</span>
                              )}
                            </div>
                            
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {blog.title}
                            </h3>
                            
                            <p className="text-gray-600 mb-3">
                              {blog.excerpt}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                              <div className="text-sm text-gray-500">
                                By {blog.author} • {new Date(blog.published_at).toLocaleDateString()}
                              </div>
                              <a
                                href={blog.url}
                                target={blog.source === 'external' ? '_blank' : '_self'}
                                rel={blog.source === 'external' ? 'noopener noreferrer' : ''}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                              >
                                Read Article {blog.source === 'external' && '↗'}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Submit Blog Suggestion */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Have a health blog to share?</h3>
                <p className="text-blue-700 mb-4">
                  Found a great health resource or want to share your own blog post? Submit it for review and we'll consider adding it to our curated list.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Suggest a Blog
                </button>
              </div>
            </div>
          )}

          {/* New Post Form */}
          {showNewPostForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
                <form onSubmit={handleCreatePost}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      placeholder="Enter post title..."
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      placeholder="Share your thoughts, questions, or experiences..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNewPostForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Post
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}