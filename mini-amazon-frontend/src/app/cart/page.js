// src/app/cart/page.js
'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Package, CreditCard } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, loading } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Shopping Cart</h1>
        <div className="bg-yellow-50 border border-yellow-300 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-yellow-800">Please log in</h2>
          <p className="mb-4 text-yellow-700 text-sm sm:text-base">You need to be logged in to view your cart.</p>
          <Link href="/login" className="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base inline-block">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Shopping Cart</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Shopping Cart</h1>
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md text-center border border-gray-200">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800">Your cart is empty</h2>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Start shopping to add items to your cart!</p>
          <Link href="/" className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center w-full sm:w-48 mx-auto text-sm sm:text-base">
            <ArrowLeft size={18} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-gray-800 flex items-center">
        <ShoppingCart size={24} className="mr-2 sm:mr-3 text-blue-600" />
        Shopping Cart
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 sm:mb-6 md:mb-8 border border-gray-200">
        {cartItems.map((item) => (
          <div key={item.productId} className="border-b last:border-b-0 p-3 sm:p-4 md:p-6 flex items-start sm:items-center hover:bg-gray-50 transition-colors">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg mr-3 sm:mr-4 md:mr-6 flex items-center justify-center border border-gray-200 flex-shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-gray-400 text-xs">No image</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
              <p className="text-green-700 font-bold text-sm sm:text-base">${item.price}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">${item.price} × {item.quantity}</p>
            </div>

            <div className="flex flex-col items-end space-y-2 ml-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors border border-gray-300"
                  title="Decrease quantity"
                >
                  <Minus size={14} className="text-gray-700" />
                </button>
                <span className="w-6 text-center font-bold text-sm sm:text-base md:text-lg text-gray-800">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors border border-gray-300"
                  title="Increase quantity"
                >
                  <Plus size={14} className="text-gray-700" />
                </button>
              </div>

              <p className="font-bold text-sm sm:text-base md:text-lg text-green-700">${(item.price * item.quantity).toFixed(2)}</p>
            </div>

            <button
              onClick={() => removeFromCart(item.productId)}
              className="text-red-500 hover:text-red-700 p-2 transition-colors rounded-lg hover:bg-red-50 ml-2"
              title="Remove item from cart"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <span className="text-lg sm:text-xl font-semibold text-gray-800">Subtotal:</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">${cartTotal.toFixed(2)}</span>
        </div>

        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
          <div className="flex items-center text-blue-700">
            <Package size={16} className="mr-2" />
            <span className="text-xs sm:text-sm">Free shipping on all orders</span>
          </div>
        </div>

        <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
          Shipping and taxes calculated at checkout.
        </p>

        <div className="space-y-3 sm:space-y-4">
          <Link
            href="/checkout"
            className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center text-base sm:text-lg transition-colors shadow-md"
          >
            <CreditCard size={18} className="mr-2" />
            Proceed to Checkout
          </Link>

          <Link
            href="/"
            className="w-full bg-gray-100 text-gray-800 py-2 sm:py-3 rounded-lg hover:bg-gray-200 font-semibold flex items-center justify-center transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}