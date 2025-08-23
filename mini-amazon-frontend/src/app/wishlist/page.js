'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, ShoppingCart, Plus } from 'lucide-react';
import { useState } from 'react';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Wishlist</h1>
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p>You need to be logged in to view your wishlist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600">Start adding items you love!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
              <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded mb-4" />
              <h3 className="font-semibold mb-2">{item.name}</h3>
              <p className="text-green-600 font-bold mb-4">${item.price}</p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 text-white py-2 rounded flex items-center justify-center">
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </button>
                <button className="px-3 py-2 bg-red-500 text-white rounded">
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}