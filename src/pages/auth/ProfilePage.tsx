import React from 'react';
import { UserInfoCard, AddressList } from '../../components/profile';

export const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Profile</h1>
      <div className="space-y-6">
        <UserInfoCard />
        <AddressList />
      </div>
    </div>
  );
};