// src/app/layout.js
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext'; // Add this import

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider> {/* Wrap with CartProvider */}
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}