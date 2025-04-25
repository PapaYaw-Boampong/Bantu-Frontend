import api from '../lib/api';
import { 
  LoginCredentials,
   RegisterData, TokenResponse, 
   ChangePasswordRequest, LogoutRequest
  } from '../types/auth';

import { FullRegisterResponse } from '../types/auth';

class AuthService {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  }

  async register(data: RegisterData): Promise<FullRegisterResponse> {
    const response = await api.post<FullRegisterResponse>('/auth/register', data);
    return response.data;
  }

  async logout(request: LogoutRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/logout', request);
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean }> {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  }
}

export const authService = new AuthService(); 