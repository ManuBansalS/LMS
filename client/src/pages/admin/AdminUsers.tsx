import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Search } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  is_active: boolean;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async (search = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users${search ? `?search=${search}` : ''}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  const toggleBlockStatus = async (user: User) => {
    if (user.role === 'ADMIN') return; // Cannot block admin
    try {
      const action = user.is_active ? 'block' : 'unblock';
      await api.patch(`/admin/users/${user.id}/${action}`);
      // Refresh list
      await fetchUsers(searchTerm);
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>
      </div>
      
      <div className="flex-1 overflow-auto p-0">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Username</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.firstname} {user.lastname}</td>
                  <td className="px-6 py-4 text-gray-500">{user.username}</td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'ADMIN' ? 'ADMIN' : user.role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => toggleBlockStatus(user)}
                        className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${
                          user.is_active 
                            ? 'text-red-600 hover:bg-red-50 border border-red-200' 
                            : 'text-green-600 hover:bg-green-50 border border-green-200'
                        }`}
                      >
                        {user.is_active ? 'Block' : 'Unblock'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
