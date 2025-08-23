// src/app/orders/[orderId]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Package, Calendar, MapPin, CreditCard, ArrowLeft, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId;
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const userOrders = orders.filter(order =>
        order.userId === user?.userId || order.userEmail === user?.email
      );
      const foundOrder = userOrders.find(order => order.orderId === orderId);
      setOrder(foundOrder);
      setLoading(false);
    }
  }, [orderId, user]);

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-200">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Order Not Found</h1>
          <p className="text-gray-700 mb-6">We couldn't find the order you're looking for.</p>
          <Link href="/orders" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/orders" className="flex items-center text-blue-600 hover:text-blue-700 font-semibold">
          <ArrowLeft size={18} className="mr-2" />
          Back to Orders
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-700 font-medium">Order #{order.orderId}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {order.status || 'Processing'}
            </span>
          </div>
        </div>

        {/* Order Info & Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center text-gray-900">
              <Calendar size={20} className="mr-2 text-blue-600" />
              Order Information
            </h2>
            <div className="space-y-2 text-gray-800">
              <p><span className="font-semibold">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><span className="font-semibold">Items:</span> {order.itemCount}</p>
              <p><span className="font-semibold">Total:</span> <span className="text-green-700 font-bold">${order.total?.toFixed(2)}</span></p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center text-gray-900">
              <MapPin size={20} className="mr-2 text-blue-600" />
              Shipping Address
            </h2>
            <div className="space-y-2 text-gray-800">
              <p className="font-semibold">{order.shippingInfo?.firstName} {order.shippingInfo?.lastName}</p>
              <p>{order.shippingInfo?.address}</p>
              <p>{order.shippingInfo?.city}, {order.shippingInfo?.zipCode}</p>
              <p className="text-sm text-gray-700">{order.shippingInfo?.email}</p>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center text-gray-900">
            <CreditCard size={20} className="mr-2 text-blue-600" />
            Payment Information
          </h2>
          <p className="text-gray-800 font-medium">
            Payment Method: {order.shippingInfo?.paymentMethod === 'card' ? 'Credit Card' :
                             order.shippingInfo?.paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'}
          </p>
          <p className="text-sm text-green-700 mt-1 font-semibold">Payment Status: Paid</p>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
            <Package size={20} className="mr-2 text-blue-600" />
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-4">
                <div className="ml-2">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-700">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-700">${item.price} each</p>
                </div>
                <p className="font-bold text-green-700">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gray-900">Total:</span>
              <span className="text-green-700">${order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
