// app/search/page.js
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';
import { Filter, SlidersHorizontal, X } from 'lucide-react';

// Create a component that uses useSearchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: 0,
    maxPrice: 1000
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        const productsData = response.data?.products || [];
        setProducts(productsData);

        // Filter products based on search query
        if (query) {
          const filtered = productsData.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
          );
          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);

    let filtered = products;

    // Apply search query filter
    if (query) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply category filter
    if (newFilters.category) {
      filtered = filtered.filter(product =>
        product.category === newFilters.category
      );
    }

    // Apply price filter
    filtered = filtered.filter(product =>
      product.price >= newFilters.minPrice &&
      product.price <= newFilters.maxPrice
    );

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: 0,
      maxPrice: 1000
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {query ? `Search Results for "${query}"` : 'All Products'}
        </h1>
        <p className="text-gray-600 text-lg">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          {query && ` for "${query}"`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            <SlidersHorizontal size={20} />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          {(filters.category || filters.maxPrice < 1000) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Filters Sidebar */}
        <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <div className="w-full lg:w-64 bg-white p-6 rounded-xl shadow-md h-fit sticky top-24 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => applyFilters({...filters, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
              >
                <option value="">All Categories</option>
                {Array.from(new Set(products.map(p => p.category))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Price Range: ${filters.minPrice} - ${filters.maxPrice}
              </label>

              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.maxPrice}
                  onChange={(e) => applyFilters({...filters, maxPrice: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                />

                <div className="flex justify-between text-sm text-gray-600">
                  <span>${filters.minPrice}</span>
                  <span>${filters.maxPrice}</span>
                </div>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full text-center text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {query
                    ? `No results found for "${query}". Try different keywords or filters.`
                    : 'No products match your current filters.'
                  }
                </p>
                {(filters.category || filters.maxPrice < 1000) && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}