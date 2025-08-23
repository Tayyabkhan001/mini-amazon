// src/app/register/page.js
'use client';

import Register from '@/components/Register';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function RegisterPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <Register />;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    await register(userData);
    router.push('/');
  } catch (error) {
    console.log('Full error object:', error);
    console.log('Error response:', error.response);
    setError(error.response?.data?.message || error.message || 'Registration failed');
  }
};