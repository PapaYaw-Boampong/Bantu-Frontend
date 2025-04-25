import api from '@/lib/api';
import { 
  UserProfile, 
  UserUpdate,
  User,
} from '@/types/user';

class UserService {
  // User Profile Methods
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/user/me');
    return response.data;
  }

  async updateProfile(data: UserUpdate): Promise<UserProfile> {
    const response = await api.put('/user/me', data);
    return response.data;
  }

  // Admin Methods
  async getUsers(): Promise<User[]> {
    const response = await api.get('/user');
    return response.data;
  }

  async getUserById(userId: string): Promise<UserProfile> {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  }

  async deactivateUser(userId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/user/deactivate/${userId}`);
    return response.data;
  }

  // async getTopContributors(limit: number = 10, timePeriod?: number): Promise<TopContributor[]> {
  //   const response = await api.get('/user/top-contributors', {
  //     params: { limit, time_period: timePeriod }
  //   });
  //   return response.data;
  // }
}

export const userService = new UserService(); 
