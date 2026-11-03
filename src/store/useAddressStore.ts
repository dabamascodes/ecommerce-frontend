import { create } from 'zustand';
import { addressesService } from '../services/addresses.service';
import type { Address, CreateAddressDto } from '../interfaces';

interface AddressState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  createAddress: (dto: CreateAddressDto) => Promise<void>;
  updateAddress: (id: string, dto: Partial<CreateAddressDto>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

export const useAddressStore = create<AddressState>((set) => ({
  addresses: [],
  loading: false,
  error: null,

  fetchAddresses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await addressesService.getAll();
      set({ addresses: data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch addresses', loading: false });
    }
  },

  createAddress: async (dto) => {
    set({ loading: true, error: null });
    try {
      await addressesService.create(dto);
      const data = await addressesService.getAll();
      set({ addresses: data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create address', loading: false });
    }
  },

  updateAddress: async (id, dto) => {
    set({ loading: true, error: null });
    try {
      await addressesService.update(id, dto);
      const data = await addressesService.getAll();
      set({ addresses: data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update address', loading: false });
    }
  },

  deleteAddress: async (id) => {
    set({ loading: true, error: null });
    try {
      await addressesService.delete(id);
      const data = await addressesService.getAll();
      set({ addresses: data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete address', loading: false });
    }
  },

  setDefaultAddress: async (id) => {
    set({ loading: true, error: null });
    try {
      await addressesService.setDefault(id);
      const data = await addressesService.getAll();
      set({ addresses: data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to set default address', loading: false });
    }
  },
}));