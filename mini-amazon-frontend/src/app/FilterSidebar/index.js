'use client';
import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

export default function FilterSidebar({ categories, onFilter, isMobileOpen = false, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory('');
    }
  }, [categories, selectedCategory]);

  const applyFilters = () => {
    onFilter({
      category: selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    });

    if (onClose) onClose();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 1000]);
    onFilter({
      category: '',
      minPrice: 0,
      maxPrice: 1000
    });
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-md h-fit sticky top-24 ${isMobileOpen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      {/* Mobile header */}
      {isMobileOpen && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">Filters</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>
      )}

      {/* Desktop header */}
      {!isMobileOpen && (
        <div className="flex items-center mb-6">
          <Filter size={20} className="text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-gray-700">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-3 text-gray-700">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </label>

        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
          />

          <div className="flex justify-between text-xs text-gray-500">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={applyFilters}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          Apply Filters
        </button>

        <button
          onClick={clearFilters}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}