export type Role = 'user' | 'admin' | 'Super-user';

export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phone: string;
  roles?: string[];
  isActive?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}
