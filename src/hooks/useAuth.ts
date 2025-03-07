import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  metadata?: {
    full_name?: string;
    country?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/profile')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
     navigate('/dashboard');
    // const response = await api.post('/auth/signin', { email, password });
    // const { token, user } = response.data;
    // localStorage.setItem('token', token);
    // setUser(user);
    navigate('/dashboard');
  };

  const signUp = async (email: string, password: string, metadata: { full_name: string; country: string }) => {
    const response = await api.post('/auth/signup', { email, password, metadata });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    navigate('/dashboard');
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}