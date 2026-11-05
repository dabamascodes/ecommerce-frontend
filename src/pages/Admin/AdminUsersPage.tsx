import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usersService } from '../../services';
import type { User } from '../../interfaces';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [roleModal, setRoleModal] = useState<{
    isOpen: boolean;
    userId: string;
    currentRoles: string[];
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    currentRoles: ['user'],
    userName: '',
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['user']);
  const [updatingRole, setUpdatingRole] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.findAll();
      setUsers(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load system users';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.name || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const rolesArray: string[] = user.roles ? (Array.isArray(user.roles) ? user.roles : [user.roles]) : [];
    const rolesStr = rolesArray.join(', ').toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || rolesStr.includes(search);
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await usersService.deactivateUser(user.id);
        toast.success(`User ${user.email} deactivated successfully`);
      } else {
        await usersService.restoreUser(user.id);
        toast.success(`User ${user.email} restored successfully`);
      }
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update user status';
      toast.error(msg);
    }
  };

  const handleOpenRoleModal = (user: User) => {
    const userRoles: string[] = user.roles ? (Array.isArray(user.roles) ? user.roles : [user.roles]) : ['user'];
    setRoleModal({
      isOpen: true,
      userId: user.id,
      currentRoles: userRoles,
      userName: `${user.name || ''} ${user.lastName || ''}`,
    });
    setSelectedRoles(userRoles);
  };

  const handleRoleCheckboxChange = (role: string) => {
    if (role === 'user') return;

    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleUpdateRolesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingRole(true);
    try {
      await usersService.updateRole(roleModal.userId, selectedRoles);
      toast.success(`Roles updated successfully for ${roleModal.userName}`);
      setRoleModal({ isOpen: false, userId: '', currentRoles: ['user'], userName: '' });
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update user roles';
      toast.error(msg);
    } finally {
      setUpdatingRole(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super-user':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'admin':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm">
            Manage system accounts, toggle active status, and assign permission roles (Super-User exclusive).
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600 font-medium">
          Showing <span className="text-gray-900 font-bold">{paginatedUsers.length}</span> of{' '}
          <span className="text-gray-900 font-bold">{filteredUsers.length}</span> filtered users (Total: {users.length})
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500 font-medium">Loading system users...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-4">User / Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Roles</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {paginatedUsers.map((user) => {
                  const userRoles: string[] = user.roles ? (Array.isArray(user.roles) ? user.roles : [user.roles]) : ['user'];
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">
                          {user.name} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {user.phone || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {userRoles.map((role) => (
                            <span
                              key={role}
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase ${getRoleBadgeStyle(
                                role
                              )}`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer text-xs"
                        >
                          Change Roles
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`font-semibold cursor-pointer text-xs ${
                            user.isActive
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      No users matched your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page <span className="font-semibold text-gray-700">{currentPage}</span> of{' '}
              <span className="font-semibold text-gray-700">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {roleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Manage User Roles</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select permissions for <span className="font-semibold text-gray-800">{roleModal.userName}</span>
            </p>

            <form onSubmit={handleUpdateRolesSubmit} className="space-y-4">
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-center space-x-3 cursor-not-allowed opacity-75">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800">user</span>
                    <p className="text-xs text-gray-500">Standard client role (Required)</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes('admin')}
                    onChange={() => handleRoleCheckboxChange('admin')}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800">admin</span>
                    <p className="text-xs text-gray-500">Access to admin dashboard & modules</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes('super-user')}
                    onChange={() => handleRoleCheckboxChange('super-user')}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800">super-user</span>
                    <p className="text-xs text-gray-500">Full management & user permissions</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setRoleModal({ isOpen: false, userId: '', currentRoles: ['user'], userName: '' })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {updatingRole ? 'Updating...' : 'Save Roles'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};