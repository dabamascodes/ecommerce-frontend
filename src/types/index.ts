export type Role = 'user' | 'admin' | 'super-user';

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

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  slug: string;
  stock: number;
  sizes: string[];
  gender: string;
  tags: string[];
  images: string[];
}