import { api } from './api.config';
import type { Address, CreateAddressDto, UpdateAddressDto } from '../interfaces';

export const addressesService = {
  getAll: async (): Promise<Address[]> => {
    const { data } = await api.get<Address[]>('/addresses');
    return data;
  },

  create: async (dto: CreateAddressDto): Promise<Address> => {
    const { data } = await api.post<Address>('/addresses', dto);
    return data;
  },

  update: async (id: string, dto: UpdateAddressDto): Promise<Address> => {
    const { data } = await api.patch<Address>(`/addresses/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/addresses/${id}`);
  },

  setDefault: async (id: string): Promise<Address> => {
    const { data } = await api.patch<Address>(`/addresses/${id}/default`);
    return data;
  },
};