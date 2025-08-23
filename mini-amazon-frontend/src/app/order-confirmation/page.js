// src/app/order-confirmation/page.js
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />

        <h1 className="text-3xl font-bold text-green-600 mb-4">Order Confirmed!</h1>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <ShoppingBag size={32} className="mx-auto text-green-500 mb-3" />
          <p className="text-lg font-semibold mb-2">Thank you for your order!</p>
          <p className="text-gray-600 mb-2">Your order has been successfully placed.</p>
          <p className="text-sm text-gray-500">Order ID: {orderId}</p>
        </div>

        <div className="space-y-3">
          <p className="text-gray-600">
            You will receive an email confirmation shortly.
          </p>

          <div className="flex justify-center space-x-4">
            <Link
              href="/"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center"
            >
              <Home size={20} className="mr-2" />
              Continue Shopping
            </Link>

            <Link
              href="/orders"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}