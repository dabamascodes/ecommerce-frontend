import { create } from 'zustand';
import type { User } from '../interfaces';
import { authService } from '../services';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const getStoredUser = (): User | null => {
  try {
    const item = localStorage.getItem('user');
    if (!item || item === 'undefined' || item === 'null') return null;
    return JSON.parse(item);
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuthStatus: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, token: null, isAuthenticated: false });
        return;
      }

      const data = await authService.checkAuthStatus();
      const user = data.user || data;
      const newToken = data.token || token;

      localStorage.setItem('token', newToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      set({ user, token: newToken, isAuthenticated: true });
    } catch (error) {
      console.warn('CheckAuthStatus failed, session expired or invalid');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));