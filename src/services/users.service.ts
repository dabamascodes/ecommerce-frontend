import { api } from './api.config';
import type { User } from '../interfaces';

export const usersService = {
  getProfile: async (): Promise<any> => {
    const { data } = await api.get('/users/profile');
    return data;
  },

  updateProfile: async (payload: Record<string, any>): Promise<any> => {
    const { data } = await api.patch('/users/profile', payload);
    return data;
  },

  findAll: async (limit = 500, offset = 0): Promise<User[]> => {
    const response = await api.get<any>('/users', {
      params: { limit, offset },
    });
    const data = response.data;
    return Array.isArray(data) ? data : data.users || [];
  },

  updateRole: async (id: string, roles: string[]): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/role`, { roles });
    return response.data;
  },

  deactivateUser: async (id: string): Promise<any> => {
    const response = await api.patch<any>(`/users/${id}/deactivate`);
    return response.data;
  },

  restoreUser: async (id: string): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/restore`);
    return response.data;
  },
};