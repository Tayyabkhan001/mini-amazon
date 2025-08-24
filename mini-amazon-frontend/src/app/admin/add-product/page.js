'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { productsAPI } from '@/lib/api';
import { uploadToS3 } from '@/lib/s3-upload';
import ImageUpload from '@/components/ImageUpload';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AddProductPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    price: '',
    description: '',
    category: 'uncategorized'
  });

  // ✅ Protect route: only admin can access
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (!user?.email?.includes('admin')) {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  // ✅ UPDATED: Enhanced S3 Image Upload with better logging
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';

      // Upload to S3 if image is selected
      if (imageFile) {
        try {
          console.log('🖼️ Starting image upload process...');
          imageUrl = await uploadToS3(imageFile);
          console.log('✅ Image uploaded to S3 successfully:', imageUrl);
        } catch (uploadError) {
          console.error('❌ S3 upload failed with details:', uploadError);
          console.log('🔄 Falling back to placeholder image');
          // Fallback to placeholder if S3 upload fails
          imageUrl = `https://via.placeholder.com/300x200/0077be/white?text=${encodeURIComponent(formData.name)}`;
        }
      } else {
        console.log('📸 No image selected, using placeholder');
        imageUrl = `https://via.placeholder.com/300x200/0077be/white?text=${encodeURIComponent(formData.name)}`;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        imageUrl: imageUrl // Use S3 URL or placeholder
      };

      console.log('📦 Sending product data to backend:', productData);

      const response = await productsAPI.create(productData);
      console.log('✅ Create product response:', response);

      alert('Product added successfully!');
      router.push('/');

    } catch (error) {
      console.error('💥 Error adding product:', error);
      setError(error.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !user?.email?.includes('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4 text-gray-700 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6 border border-gray-200">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">
            Product Image
          </label>
          <ImageUpload onImageUpload={setImageFile} existingImageUrl="" />
          <p className="text-sm text-gray-500 mt-2">
            {imageFile
              ? `Selected: ${imageFile.name} (${(imageFile.size / 1024).toFixed(1)} KB)`
              : 'No image selected - will use placeholder'
            }
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">
            Product ID*
          </label>
          <input
            type="text"
            required
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="e.g., prod-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">
            Product Name*
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">
            Price*
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-vertical"
            rows="3"
            placeholder="Product description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="uncategorized">Uncategorized</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home & Kitchen</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg disabled:opacity-50 font-semibold flex items-center justify-center transition-colors shadow-md"
        >
          {loading ? 'Adding Product...' : (
            <>
              <Save size={20} className="mr-2" />
              Add Product
            </>
          )}
        </button>
      </form>
    </div>
  );
}