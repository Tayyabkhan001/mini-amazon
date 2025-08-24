// src/components/ProductGrid.js
'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '@/lib/api';
import { RefreshCw, Filter } from 'lucide-react';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading && !refreshing) {
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
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center mx-auto space-x-2"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Enhanced Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>

        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors duration-200">
            <Filter size={16} />
            <span>Filter</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-70"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Products'}</span>
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}