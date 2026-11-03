import React, { useEffect, useState } from 'react';
import { useAddressStore } from '../../store';
import { AddressModal } from './AddressModal';
import type { Address, CreateAddressDto } from '../../interfaces';
import { toast } from 'sonner';

export const AddressList: React.FC = () => {
  const { addresses, loading, fetchAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenCreate = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (dto: CreateAddressDto) => {
    try {
      if (selectedAddress) {
        await updateAddress(selectedAddress.id, dto);
        toast.success('Address updated successfully');
      } else {
        await createAddress(dto);
        toast.success('Address created successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id);
        toast.success('Address deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to set default address');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Addresses</h2>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
        >
          Add New Address
        </button>
      </div>

      {loading && addresses.length === 0 ? (
        <p className="text-gray-500">Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <p className="text-gray-500">No addresses saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 rounded-lg border relative flex flex-col justify-between ${
                address.isDefault ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 bg-white'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-800">{address.street}</p>
                  {address.isDefault && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Set as Default
                  </button>
                )}
                <div className="flex space-x-3 ml-auto">
                  <button
                    onClick={() => handleOpenEdit(address)}
                    className="text-xs text-gray-600 hover:text-blue-600 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        addressToEdit={selectedAddress}
      />
    </div>
  );
};