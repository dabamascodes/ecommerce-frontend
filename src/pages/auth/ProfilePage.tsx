import React from 'react';
import { UserInfoCard } from '../../components/profile/UserInfoCard';
import { AddressList } from '../../components/profile/AddressList';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">My Orders</h3>
          <p className="text-sm text-gray-600">View your purchase history and track active orders.</p>
        </div>
        <Link
          to="/orders"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition"
        >
          View Orders
        </Link>
      </div>

      <div className="space-y-6">
        <UserInfoCard />
        <AddressList />
      </div>
    </div>
  );
};