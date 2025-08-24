'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, User, LogOut, UserCircle, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">
                🛒 Mini Amazon
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* ✅ Admin Links - Show only to admin users */}
                {(user?.email === 'admin@example.com' || user?.email?.includes('admin')) && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Settings size={18} />
                      <span>Admin Dashboard</span>
                    </Link>
                    <Link
                      href="/admin/add-product"
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Plus size={18} />
                      <span>Add Product</span>
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
                  <span className="text-gray-700">Welcome, {user?.name}</span>
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
        </div>
      </div>
    </header>
  );
}