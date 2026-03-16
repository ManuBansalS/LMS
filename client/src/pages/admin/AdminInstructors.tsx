import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Search, UserCog } from 'lucide-react';

interface Instructor {
  id: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  is_active: boolean;
}

const AdminInstructors: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/instructors');
      setInstructors(res.data);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleAction = async (instructor: Instructor) => {
    try {
      const action = instructor.is_active ? 'block' : 'approve';
      await api.patch(`/admin/instructors/${instructor.id}/${action}`);
      await fetchInstructors();
    } catch (err) {
      console.error('Failed to update instructor status:', err);
    }
  };

  const filtered = instructors.filter((i) => {
    const q = search.toLowerCase();
    return (
      `${i.firstname} ${i.lastname}`.toLowerCase().includes(q) ||
      i.username.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Instructor Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">{instructors.length} instructor{instructors.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-0">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Username</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  Loading instructors...
                </div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <UserCog size={32} className="opacity-25" />
                  <p className="font-medium">{search ? 'No instructors match your search' : 'No instructors found'}</p>
                </div>
              </td></tr>
            ) : (
              filtered.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(instructor.firstname?.[0] ?? instructor.username?.[0] ?? 'I').toUpperCase()}
                      </div>
                      {instructor.firstname} {instructor.lastname}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{instructor.username}</td>
                  <td className="px-6 py-4 text-gray-500">{instructor.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      instructor.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {instructor.is_active ? 'Approved' : 'Pending / Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleAction(instructor)}
                      className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${
                        instructor.is_active 
                          ? 'text-red-600 hover:bg-red-50 border border-red-200' 
                          : 'text-green-600 hover:bg-green-50 border border-green-200'
                      }`}
                    >
                      {instructor.is_active ? 'Block' : 'Approve'}
                    </button>
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

export default AdminInstructors;
