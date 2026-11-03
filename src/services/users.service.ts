import { api } from './api.config';

export const usersService = {
  getProfile: async (): Promise<any> => {
    const { data } = await api.get('/users/profile');
    return data;
  },

  updateProfile: async (payload: Record<string, any>): Promise<any> => {
    const { data } = await api.patch('/users/profile', payload);
    return data;
  },
};