export type Role = 'user' | 'admin' | 'Super-user';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}
