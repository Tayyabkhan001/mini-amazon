// src/components/ProductGrid.js
'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '@/lib/api';
import { RefreshCw, Filter, Grid, List } from 'lucide-react';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="max-w-md mx-auto">
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            <p className="font-medium">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center mx-auto space-x-2 shadow-sm hover:shadow-md"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Try Again'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Our Products</h2>
          <p className="text-gray-600 mt-1">{products.length} products available</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={18} />
            </button>
          </div>

          {/* Filter Button */}
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition-colors duration-200 shadow-sm">
            <Filter size={16} />
            <span>Filter</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-70 shadow-sm hover:shadow-md"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Check back later for new products.</p>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {products.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Loading overlay for refresh */}
      {refreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center space-x-3">
            <RefreshCw size={20} className="animate-spin text-blue-600" />
            <span className="text-gray-700">Refreshing products...</span>
          </div>
        </div>
      )}
    </div>
  );
}