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
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Shopping Cart</h1>
        <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-yellow-800">Please log in</h2>
          <p className="mb-4 text-yellow-700">You need to be logged in to view your cart.</p>
          <Link href="/login" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Shopping Cart</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Shopping Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart!</p>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center w-48 mx-auto">
            <ArrowLeft size={20} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
        <ShoppingCart size={32} className="mr-3 text-blue-600" />
        Shopping Cart
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 border border-gray-200">
        {cartItems.map((item) => (
          <div key={item.productId} className="border-b last:border-b-0 p-6 flex items-center hover:bg-gray-50 transition-colors">
            <div className="w-24 h-24 bg-gray-100 rounded-lg mr-6 flex items-center justify-center border border-gray-200">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-gray-400 text-sm">No image</div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-800 mb-1">{item.name}</h3>
              <p className="text-green-700 font-bold text-base">${item.price}</p>
              <p className="text-sm text-gray-600 mt-1">${item.price} × {item.quantity}</p>
            </div>

            <div className="flex items-center space-x-3 mr-6">
              <button
                onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors border border-gray-300"
                title="Decrease quantity"
              >
                <Minus size={18} className="text-gray-700" />
              </button>
              <span className="w-10 text-center font-bold text-lg text-gray-800">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors border border-gray-300"
                title="Increase quantity"
              >
                <Plus size={18} className="text-gray-700" />
              </button>
            </div>

            <div className="text-right mr-6">
              <p className="font-bold text-lg text-green-700">${(item.price * item.quantity).toFixed(2)}</p>
            </div>

            <button
              onClick={() => removeFromCart(item.productId)}
              className="text-red-500 hover:text-red-700 p-3 transition-colors rounded-lg hover:bg-red-50"
              title="Remove item from cart"
            >
              <Trash2 size={22} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-semibold text-gray-800">Subtotal:</span>
          <span className="text-3xl font-bold text-green-600">${cartTotal.toFixed(2)}</span>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <div className="flex items-center text-blue-700">
            <Package size={18} className="mr-2" />
            <span className="text-sm">Free shipping on all orders</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Shipping and taxes calculated at checkout.
        </p>

        <div className="space-y-4">
          <Link
            href="/checkout"
            className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center text-lg transition-colors shadow-md"
          >
            <CreditCard size={22} className="mr-2" />
            Proceed to Checkout
          </Link>

          <Link
            href="/"
            className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 font-semibold flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}