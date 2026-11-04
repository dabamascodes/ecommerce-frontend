import React, { useEffect, useState } from 'react';
import { useAddressStore } from '../../store';
import { AddressModal } from './AddressModal';
import type { Address, CreateAddressDto } from '../../interfaces';
import { toast } from 'sonner';

export const AddressList: React.FC = () => {
  const { addresses, loading, fetchAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; street: string }>({
    isOpen: false,
    id: '',
    street: '',
  });

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

  const promptDelete = (id: string, street: string) => {
    setDeleteConfirm({ isOpen: true, id, street });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAddress(deleteConfirm.id);
      toast.success('Address deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete address');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', street: '' });
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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Addresses</h2>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition cursor-pointer"
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
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}
                <div className="flex space-x-3 ml-auto">
                  <button
                    onClick={() => handleOpenEdit(address)}
                    className="text-xs text-gray-600 hover:text-blue-600 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => promptDelete(address.id, address.street)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
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

      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 animate-in fade-in zoom-in duration-200 text-center">
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Address</h3>
            
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteConfirm.street}"</span>?
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, id: '', street: '' })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer w-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium cursor-pointer w-full"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};