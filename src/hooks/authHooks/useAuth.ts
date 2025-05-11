import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import {
  TokenResponse,
  LoginCredentials,
  RegisterData
} from '@/types/auth';
import { User } from '@/types/user';

const USER_META_KEY = 'user_meta';

function storeTokens(tokens: TokenResponse) {
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  localStorage.setItem('expires_in', String(tokens.expires_in));
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem(USER_META_KEY);
}

function storeUserMeta(user: Partial<User>) {
  localStorage.setItem(USER_META_KEY, JSON.stringify({
    role: user.role,
    fullname: user.fullname
  }));
}

function loadUserMeta(): Partial<User> | null {
  const meta = localStorage.getItem(USER_META_KEY);
  if (meta) {
    try {
      return JSON.parse(meta);
    } catch {
      return null;
    }
  }
  return null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const access_token = localStorage.getItem('access_token');
      if (!access_token) {
        setLoading(false);
        return;
      }
  
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
      } catch (err) {
        console.error('Invalid token or failed to fetch profile', err);
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    initializeAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      storeUserMeta(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const credentials: LoginCredentials = {
      username: email,
      password: password
    };

    const tokens = await authService.login(credentials);
    storeTokens(tokens);
    const profile = await fetchUserProfile();
    storeUserMeta(profile);

    if (profile.role === 3) {
      navigate('/admin/dashboard');
      return;
    }
    navigate('/dashboard');
  };

  const signUp = async (email: string, password: string, username: string, fullname: string, country: string) => {
    const data: RegisterData = {
      email,
      password,
      username,
      fullname,
      country
    };

    const response = await authService.register(data);
    const registeredUser = response.user;
    const access_tokens = response.access_tokens;

    storeTokens(access_tokens);
    setUser(registeredUser);
    storeUserMeta(registeredUser);
    if (registeredUser.role === 3) {
      navigate('/admin/dashboard');
      return;
    }
    navigate('/dashboard');
  };

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authService.logout({ refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearTokens();
      setUser(null);
      navigate('/welcome');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      return await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const tokens = await authService.refreshToken(refreshToken);
          storeTokens(tokens);
          return await authService.changePassword({
            current_password: currentPassword,
            new_password: newPassword
          });
        }
      }
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    changePassword,
    fetchUserProfile,
    isAuthenticated: !!user
  };
}
