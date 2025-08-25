'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Loader2, ImageOff, Heart, Star, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addToCart(product);
      // Show success feedback
      setLoading(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add to cart. Please try again.');
      setTimeout(() => setError(null), 3000);
      setLoading(false);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const quickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement quick view functionality
    console.log('Quick view:', product.name);
  };

  return (
    <div
      className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-60 bg-gray-100 flex items-center justify-center overflow-hidden">
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
              className={`h-full w-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${isHovered ? 'scale-105' : 'scale-100'}`}
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

        {/* Overlay Actions */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center space-x-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={quickView}
            className="bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-all duration-200"
            title="Quick View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={toggleWishlist}
            className="bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-all duration-200"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart
              size={16}
              className={isWishlisted ? 'text-red-500 fill-current' : ''}
            />
          </button>
        </div>

        {/* Category Badge */}
        {product.category && product.category !== 'uncategorized' && (
          <span className="absolute top-3 left-3 bg-white/95 text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium capitalize shadow-sm">
            {product.category}
          </span>
        )}

        {/* Sale Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Sale
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Product Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow leading-relaxed">
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
                  className={`${star <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} mr-0.5`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-xs mb-2 font-medium bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-green-700">
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
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all duration-200 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShoppingCart size={16} />
            )}
            <span className="font-medium">{loading ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}