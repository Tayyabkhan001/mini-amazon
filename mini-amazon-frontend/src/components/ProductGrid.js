// src/components/ProductGrid.js
'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '@/lib/api';
import { RefreshCw } from 'lucide-react'; // Add this import

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetchProducts function first
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use your AWS backend API
      const response = await productsAPI.getAll();

      // Handle the actual AWS response format
      console.log('API Response:', response.data);

      let productsData = [];

      if (response.data) {
        // Your API returns { products: [], count: number, category: string }
        productsData = response.data.products || [];
      }

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchProducts} // Now this will work
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Add Refresh Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={fetchProducts} // Now this will work
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600"
        >
          <RefreshCw size={16} />
          <span>Refresh Products</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    </div>
  );
}