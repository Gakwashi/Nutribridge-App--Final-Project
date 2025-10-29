// components/Layout.tsx - FIXED VERSION
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
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
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setIsMobileMenuOpen(false);
    router.push('/');
    alert('You have been logged out successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main Navigation Bar */}
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="text-xl sm:text-2xl font-bold truncate">
              NutriBridge
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link href="/" className="hover:text-green-200 transition-colors whitespace-nowrap">
                Home
              </Link>
              <Link href="/about" className="hover:text-green-200 transition-colors whitespace-nowrap">
                About
              </Link>
              <Link href="/recipes" className="hover:text-green-200 transition-colors whitespace-nowrap">
                Recipes
              </Link>
              <Link href="/community" className="hover:text-green-200 transition-colors whitespace-nowrap">
                Community
              </Link>
              
              {/* Conditional rendering based on login status */}
              {isLoggedIn ? (
                <>
                  {/* User menu dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-1 hover:text-green-200 whitespace-nowrap">
                      <span className="max-w-[100px] truncate">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium truncate">{user?.name}</p>
                        <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                        <p className={`text-xs ${user?.is_premium ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {user?.is_premium ? ' Premium Member' : 'Free Account'}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>

                  <Link 
                    href="/payment" 
                    className={`px-3 py-2 rounded-lg hover:bg-opacity-90 transition-colors whitespace-nowrap text-sm ${
                      user?.is_premium ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-gray-900'
                    }`}
                  >
                    {user?.is_premium ? ' Premium' : 'Upgrade'}
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-green-200 hover:text-white transition-colors whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="bg-green-600 px-3 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap text-sm"
                  >
                    Sign Up
                  </Link>
                  <Link 
                    href="/payment" 
                    className="bg-yellow-500 px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors whitespace-nowrap text-sm"
                  >
                    Upgrade
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-green-700">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="hover:text-green-200 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/about" 
                  className="hover:text-green-200 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/recipes" 
                  className="hover:text-green-200 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Recipes
                </Link>
                <Link 
                  href="/community" 
                  className="hover:text-green-200 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Community
                </Link>
                
                {/* Mobile Auth Links */}
                {isLoggedIn ? (
                  <>
                    <div className="pt-2 border-t border-green-700">
                      <p className="text-green-200 text-sm">Welcome, {user?.name}</p>
                      <p className="text-green-300 text-xs">{user?.email}</p>
                      <p className={`text-xs ${user?.is_premium ? 'text-yellow-300' : 'text-green-300'}`}>
                        {user?.is_premium ? ' Premium Member' : 'Free Account'}
                      </p>
                    </div>
                    <Link 
                      href="/payment" 
                      className={`px-3 py-2 rounded-lg text-center ${
                        user?.is_premium ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-gray-900'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {user?.is_premium ? ' Premium Account' : 'Upgrade to Premium'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-center"
                    >
                       Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-green-200 hover:text-white transition-colors py-2 text-center border border-green-600 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      className="bg-green-600 px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                    <Link 
                      href="/payment" 
                      className="bg-yellow-500 px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Upgrade to Premium
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="w-full overflow-x-hidden">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm sm:text-base">
            &copy; 2025 NutriBridge. Supporting Sustainable Development Goals - Zero Hunger & Good Health.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white text-sm"
              >
                Logout
              </button>
            )}
            <Link href="/privacy" className="text-gray-300 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}