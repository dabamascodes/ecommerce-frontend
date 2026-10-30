import { create } from 'zustand';
import { productService } from '../services';
import type { Product } from '../interfaces'

interface ProductState {
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

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  page: 1,
  limit: 8,
  searchQuery: '',
  hasMore: true,

  fetchProducts: async (pageArg, searchArg) => {
    const currentPage = pageArg ?? get().page;
    const currentSearch = searchArg !== undefined ? searchArg : get().searchQuery;
    const limit = get().limit;
    const offset = (currentPage - 1) * limit;

    set({ isLoading: true, error: null });
    try {
      const data = await productService.getProducts(limit, offset, currentSearch);
      const productList = Array.isArray(data) ? data : [];
      
      set({
        products: productList,
        page: currentPage,
        searchQuery: currentSearch,
        hasMore: productList.length === limit,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to load products',
        isLoading: false,
      });
    }
  },

  setPage: (newPage: number) => {
    if (newPage < 1) return;
    set({ page: newPage });
    get().fetchProducts(newPage, get().searchQuery);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, page: 1 });
    get().fetchProducts(1, query);
  },
}));