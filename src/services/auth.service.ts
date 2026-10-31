import { api } from './api.config';

export const checkAuthStatus = async () => {
  try {
    const { data } = await api.get('/auth/check-status');
    
    if (data && data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    console.warn('Token inválido o expirado:', error);
    localStorage.removeItem('token');
    throw error;
  }
};