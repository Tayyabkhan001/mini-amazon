// src/app/orders/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = () => {
    setLoading(true);
    try {
      // Try to load orders from localStorage first
      if (typeof window !== 'undefined') {
        const savedOrders = localStorage.getItem('userOrders');
        if (savedOrders) {
          const userOrders = JSON.parse(savedOrders);
          // Filter orders for current user
          const userSpecificOrders = userOrders.filter(order =>
            order.userId === user?.userId || order.userEmail === user?.email
          );
          setOrders(userSpecificOrders);
        } else {
          // If no orders in localStorage, use mock data
          setOrders(getMockOrders());
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const getMockOrders = () => {
    return [
      {
        orderId: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        total: 149.97,
        status: 'processing',
        itemCount: 3,
        createdAt: new Date().toISOString(),
        userId: user?.userId,
        userEmail: user?.email,
        items: [
          { name: 'Wireless Headphones', price: 99.99, quantity: 1 },
          { name: 'Phone Case', price: 24.99, quantity: 2 }
        ]
      }
    ];
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'shipped':
        return <Truck size={20} className="text-blue-500" />;
      case 'processing':
        return <Clock size={20} className="text-yellow-500" />;
      case 'cancelled':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Package size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-300 p-8 rounded-xl text-center">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-800">Please log in</h2>
          <p className="text-yellow-700 mb-6">You need to be logged in to view your orders.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Orders</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <ShoppingBag size={32} className="mr-3 text-blue-600" />
            My Orders
          </h1>
          <Link
            href="/profile"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Profile
          </Link>
        </div>
        <p className="text-gray-600 text-lg">View your order history and track current orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-200">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">No orders yet</h2>
          <p className="text-gray-600 mb-6">Complete a checkout to see your orders here!</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Order #{order.orderId}</h3>
                  <p className="text-gray-600 text-sm">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status || 'Processing'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Items</p>
                  <p className="font-semibold text-gray-800">{order.itemCount} items</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="font-semibold text-green-600 text-lg">${order.total?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Status</p>
                  <p className="font-semibold text-gray-800 capitalize">{order.status?.toLowerCase()}</p>
                </div>
              </div>

              {/* ✅ Added "View Order Details" link here */}
              <div className="flex justify-between items-center">
                <Link
                  href={`/orders/${order.orderId}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View Order Details
                </Link>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
