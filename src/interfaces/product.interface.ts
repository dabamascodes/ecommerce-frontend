export interface Product {
  id: string | number;
  sku?: string;
  title: string;
  name?: string;
  price: number;
  description?: string;
  slug: string;
  stock: number;
  sizes: string[];
  gender: string;
  tags: string[];
  images: string[];
}

export interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  searchQuery: string;
  hasMore: boolean;
  fetchProducts: (page?: number, search?: string) => Promise<void>;
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
}