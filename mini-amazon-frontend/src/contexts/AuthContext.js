// src/contexts/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);

      // Handle AWS API Gateway response format
      const responseData = response.data || response;

      // Extract token and user data - adjust based on your actual API response structure
      const authToken = responseData.token || responseData.accessToken || responseData.idToken;
      const userData = responseData.user || responseData.userData || responseData;

      if (!authToken) {
        throw new Error('No authentication token received');
      }

      setToken(authToken);
      setUser(userData);

      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return responseData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      // Handle AWS API Gateway response format
      const responseData = response.data || response;

      // If registration also logs in user, extract token
      if (responseData.token || responseData.accessToken) {
        const authToken = responseData.token || responseData.accessToken;
        const userInfo = responseData.user || userData;

        setToken(authToken);
        setUser(userInfo);

        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('user', JSON.stringify(userInfo));
        }
      }

      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  // ADD THIS FUNCTION - Profile Update
  const updateProfile = async (profileData) => {
    try {
      // Simulate API call to update profile (replace with actual API call when ready)
      console.log('Updating profile with:', profileData);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user data in state
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile, // ← ADD THIS LINE
    loading,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};