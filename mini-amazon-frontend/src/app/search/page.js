// app/search/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';
import { Filter, SlidersHorizontal } from 'lucide-react';

export default function SearchPage() {
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
    setShowFilters(false);
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
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg mb-4"
        >
          <SlidersHorizontal size={20} />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>

        {/* Filters Sidebar */}
        {(showFilters || typeof window === 'undefined' || window.innerWidth >= 768) && (
          <div className="w-full md:w-64 bg-white p-6 rounded-xl shadow-md h-fit sticky top-24">
            <div className="flex items-center mb-6">
              <Filter size={20} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => applyFilters({...filters, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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

                <div className="flex justify-between text-xs text-gray-500">
                  <span>${filters.minPrice}</span>
                  <span>${filters.maxPrice}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {query ? `Search Results for "${query}"` : 'All Products'}
            <span className="text-gray-500 text-lg font-normal ml-2">
              ({filteredProducts.length} products found)
            </span>
          </h1>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No products found matching your search.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}