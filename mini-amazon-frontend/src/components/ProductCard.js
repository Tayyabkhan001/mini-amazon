'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Loader2, ImageOff, Heart, Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
      {/* Image Section */}
      <div className="relative h-60 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
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
              className={`h-full w-full object-contain transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
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
          <div className="flex flex-col items-center justify-center text-gray-300 p-4">
            <ImageOff size={40} className="mb-2" />
            <span className="text-sm font-medium text-center">No image available</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors duration-200"
        >
          <Heart
            size={18}
            className={isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}
          />
        </button>

        {/* Category Badge */}
        {product.category && product.category !== 'uncategorized' && (
          <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium capitalize">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Product Name */}
        <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Product Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Rating (if available) */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={`${star <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mb-3 font-medium bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-green-700">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-0"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShoppingCart size={18} />
            )}
            <span className="font-medium">{loading ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}