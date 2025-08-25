// components/Navigation.js
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, User, LogOut, UserCircle, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import SearchBar from './SearchBar';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
    // You can implement your search logic here
    console.log('Searching for:', query);
    // For example: router.push(`/search?q=${query}`);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">
                🛒 Mini Amazon
              </h1>
            </Link>
          </div>

          {/* Search Bar - Centered on desktop, full width on mobile */}
          <div className="w-full md:max-w-xl order-3 md:order-2">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products..."
            />
          </div>

          <div className="flex items-center space-x-4 order-2 md:order-3 ml-auto">
            {isAuthenticated ? (
              <>
                {/* ✅ Admin Links - Show only to admin users */}
                {(user?.email === 'admin@example.com' || user?.email?.includes('admin')) && (
                  <>
                    <Link
                      href="/admin"
                      className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Settings size={18} />
                      <span className="hidden lg:inline">Admin Dashboard</span>
                    </Link>
                    <Link
                      href="/admin/add-product"
                      className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
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
                  <span className="hidden sm:inline">Cart</span>
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
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                {/* User Welcome Message - Hidden on mobile */}
                <div className="hidden md:flex items-center space-x-2">
                  <User size={18} className="text-gray-600" />
                  <span className="text-gray-700">Hi, {user?.name?.split(' ')[0]}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
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
        </div>

        {/* Mobile Admin Links */}
        {isAuthenticated && (user?.email === 'admin@example.com' || user?.email?.includes('admin')) && (
          <div className="flex space-x-4 mt-4 md:hidden border-t pt-3">
            <Link
              href="/admin"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 text-sm"
            >
              <Settings size={16} />
              <span>Admin</span>
            </Link>
            <Link
              href="/admin/add-product"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 text-sm"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}