// components/Navigation.js
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, User, LogOut, UserCircle, Plus, Settings, Search, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();

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
    <header className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="flex items-center space-x-2" onClick={() => setShowMobileMenu(false)}>
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-white text-xl">🛒</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">
                Mini Amazon
              </h1>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products..."
            />
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
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                      title="Admin Dashboard"
                    >
                      <Settings size={20} />
                    </Link>
                    <Link
                      href="/admin/add-product"
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                      title="Add Product"
                    >
                      <Plus size={20} />
                    </Link>
                  </>
                )}

                {/* Cart Link */}
                <Link
                  href="/cart"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 relative transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                  title="Shopping Cart"
                >
                  <ShoppingCart size={22} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                  title="User Profile"
                >
                  <UserCircle size={22} />
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-3 ml-2">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-full pl-3 pr-1 py-1">
                    <span className="text-sm font-medium text-gray-700">Hi, {user?.name?.split(' ')[0]}</span>
                    <button
                      onClick={logout}
                      className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-primary"
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
              className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Search"
            >
              <Search size={24} />
            </button>

            {isAuthenticated && (
              <Link
                href="/cart"
                className="p-2 text-gray-600 hover:text-blue-600 relative rounded-lg hover:bg-gray-100 transition-colors"
                title="Shopping Cart"
                onClick={() => setShowMobileMenu(false)}
              >
                <ShoppingCart size={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden pb-4 px-2 slide-up">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products..."
            />
          </div>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-4 bg-white slide-up">
            <div className="space-y-2 px-2">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <UserCircle size={24} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    {/* Profile Link */}
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <UserCircle size={20} />
                      <span>Profile</span>
                    </Link>

                    {/* Admin Links */}
                    {(user?.email === 'admin@example.com' || user?.email?.includes('admin')) && (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center space-x-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <Settings size={20} />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/add-product"
                          className="flex items-center space-x-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <Plus size={20} />
                          <span>Add Product</span>
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center space-x-3 p-3 text-red-600 w-full rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    className="text-center text-blue-600 hover:text-blue-700 p-3 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-center btn-primary"
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