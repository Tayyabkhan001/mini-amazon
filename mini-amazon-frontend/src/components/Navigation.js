// components/Navigation.js
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, User, LogOut, UserCircle, Plus, Settings, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top Row - Logo and User Actions */}
        <div className="flex items-center justify-between mb-4 md:mb-0">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">
                🛒 Mini Amazon
              </h1>
            </Link>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Admin Links */}
                {(user?.email === 'admin@example.com' || user?.email?.includes('admin')) && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Settings size={18} />
                      <span className="hidden lg:inline">Admin Dashboard</span>
                    </Link>
                    <Link
                      href="/admin/add-product"
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Plus size={18} />
                      <span className="hidden lg:inline">Add Product</span>
                    </Link>
                  </>
                )}

                {/* Cart Link */}
                <Link
                  href="/cart"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 relative transition-colors duration-200"
                >
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  <UserCircle size={20} />
                  <span>Profile</span>
                </Link>

                {/* User Welcome Message */}
                <div className="flex items-center space-x-2">
                  <User size={18} className="text-gray-600" />
                  <span className="text-gray-700">Hi, {user?.name?.split(' ')[0]}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            onClick={toggleMobileSearch}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600"
          >
            <Search size={24} />
          </button>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex justify-center mb-4 md:mb-0">
          <div className="w-full max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products..."
            />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden mb-4">
            <SearchBar
              onSearch={(query) => {
                handleSearch(query);
                setShowMobileSearch(false);
              }}
              placeholder="Search products..."
            />
          </div>
        )}

        {/* Mobile User Actions */}
        <div className="md:hidden flex items-center justify-between pt-3 border-t">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-4">
                {/* Cart Link */}
                <Link
                  href="/cart"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 relative transition-colors duration-200"
                >
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  <UserCircle size={20} />
                  <span>Profile</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Mobile Admin Links */}
              {(user?.email === 'admin@example.com' || user?.email?.includes('admin')) && (
                <div className="flex space-x-3">
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 text-sm p-2 bg-gray-100 rounded-lg"
                  >
                    <Settings size={16} />
                  </Link>
                  <Link
                    href="/admin/add-product"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 text-sm p-2 bg-gray-100 rounded-lg"
                  >
                    <Plus size={16} />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-4 w-full justify-center">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 transition-colors duration-200 flex-1 text-center"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex-1 text-center"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}