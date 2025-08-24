'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Loader2, ImageOff } from 'lucide-react';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addToCart(product);
      alert('Product added to cart successfully! 🛒');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add to cart. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col h-full">
      {/* Enhanced Image Section */}
      <div className="h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {product.imageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse bg-gray-200 h-full w-full"></div>
              </div>
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`h-full w-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                setImageError(true);
                if (product.imageUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(product.imageUrl);
                }
              }}
              loading="lazy"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-4">
            <ImageOff size={32} className="mb-2" />
            <span className="text-sm font-medium text-center">No image available</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-2 flex-grow">
            {product.description}
          </p>
        )}

        {product.category && product.category !== 'uncategorized' && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3 font-medium self-start">
            {product.category}
          </span>
        )}

        {error && (
          <div className="text-red-600 text-sm mb-2 font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="text-2xl font-bold text-green-700">
            ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors duration-200 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShoppingCart size={16} />
            )}
            <span className="font-medium">{loading ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}