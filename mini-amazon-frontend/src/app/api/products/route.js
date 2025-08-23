// src/app/api/products/route.js
import { NextResponse } from 'next/server';

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    image: '/images/headphones.jpg',
    description: 'High-quality wireless headphones with noise cancellation',
    rating: 4.5
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 199.99,
    image: '/images/watch.jpg',
    description: 'Feature-rich smartwatch with health monitoring',
    rating: 4.3
  },
  {
    id: 3,
    name: 'Laptop Stand',
    price: 49.99,
    image: '/images/stand.jpg',
    description: 'Ergonomic laptop stand for better posture',
    rating: 4.2
  },
  {
    id: 4,
    name: 'USB-C Cable',
    price: 19.99,
    image: '/images/cable.jpg',
    description: 'Fast charging USB-C cable, 6ft length',
    rating: 4.0
  },
  {
    id: 5,
    name: 'Wireless Mouse',
    price: 29.99,
    image: '/images/mouse.jpg',
    description: 'Ergonomic wireless mouse with long battery life',
    rating: 4.4
  },
  {
    id: 6,
    name: 'Backpack',
    price: 79.99,
    image: '/images/backpack.jpg',
    description: 'Durable laptop backpack with multiple compartments',
    rating: 4.6
  }
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      products: mockProducts
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}