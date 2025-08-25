// components/Navigation.js
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, User, LogOut, UserCircle, Plus, Settings, Search, Menu, X, Bell } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowMobileSearch(false);
    }
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowMobileSearch(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg border-b border-gray-200' : 'bg-white border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link
              href="/"
              className="flex items-center space-x-2 group"
              onClick={() => setShowMobileMenu(false)}
            >
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:shadow-md transition-shadow">
                <span className="text-white text-lg">🛒</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                Mini Amazon
              </h1>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products..."
            />
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200 relative">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                    3
                  </span>
                </button>

                {/* Admin Links */}
                {(user?.email === 'admin@example.com' || user?.email?.includes('admin')) && (
                  <>
                    <Link
                      href="/admin"
                      className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                      title="Admin Dashboard"
                    >
                      <Settings size={20} />
                    </Link>
                    <Link
                      href="/admin/add-product"
                      className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                      title="Add Product"
                    >
                      <Plus size={20} />
                    </Link>
                  </>
                )}

                {/* Cart Link */}
                <Link
                  href="/cart"
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200 relative"
                  title="Shopping Cart"
                >
                  <ShoppingCart size={22} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  title="User Profile"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">Hi, {user?.name?.split(' ')[0]}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 py-2 px-3 rounded-lg hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Search and Cart */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleMobileSearch}
              className="p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
              title="Search"
              aria-label="Search"
            >
              <Search size={22} />
            </button>

            {isAuthenticated && (
              <Link
                href="/cart"
                className="p-2 text-gray-700 hover:text-blue-600 relative rounded-lg hover:bg-gray-100 transition-all duration-200"
                title="Shopping Cart"
                onClick={() => setShowMobileMenu(false)}
              >
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden pb-3 px-2 transition-all duration-300">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products..."
            />
          </div>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 pt-3 pb-3 bg-white transition-all duration-300">
            <div className="space-y-2 px-2">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1 bg-gray-50 rounded-lg p-2">
                    {/* Profile Link */}
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 p-3 text-gray-700 rounded-lg hover:bg-white transition-all duration-200 hover:shadow-sm text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <UserCircle size={18} className="text-blue-600" />
                      <span>Profile</span>
                    </Link>

                    {/* Admin Links */}
                    {(user?.email === 'admin@example.com' || user?.email?.includes('admin')) && (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center space-x-3 p-3 text-gray-700 rounded-lg hover:bg-white transition-all duration-200 hover:shadow-sm text-sm"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <Settings size={18} className="text-blue-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/add-product"
                          className="flex items-center space-x-3 p-3 text-gray-700 rounded-lg hover:bg-white transition-all duration-200 hover:shadow-sm text-sm"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <Plus size={18} className="text-blue-600" />
                          <span>Add Product</span>
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center space-x-3 p-3 text-red-600 w-full rounded-lg hover:bg-white transition-all duration-200 hover:shadow-sm text-sm"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-lg">
                  <Link
                    href="/login"
                    className="text-center text-blue-600 hover:text-blue-700 p-2 rounded-lg bg-white border border-blue-100 hover:border-blue-200 transition-all duration-200 hover:shadow-sm text-sm"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-center bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}