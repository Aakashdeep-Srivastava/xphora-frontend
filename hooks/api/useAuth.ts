// hooks/api/useAuth.ts
import { useState, useEffect } from 'react';
import { authAPI } from '../../lib/api/auth';
import type { User } from '../../types/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.checkAuth();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ email, password });
      if (response.success && response.data) {
        setUser(response.data.user);
        return response.data;
      }
      throw new Error(response.error || 'Login failed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };
}
