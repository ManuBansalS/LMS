import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Search } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  status: string;
  instructor: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
  };
}

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchCourses = async (statusFilter = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/courses${statusFilter ? `?status=${statusFilter}` : ''}`);
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(filter);
  }, [filter]);

  const handleApprove = async (id: number) => {
    try {
      await api.patch(`/admin/courses/${id}/approve`);
      fetchCourses(filter);
    } catch (err) {
      console.error('Failed to approve course:', err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      if (confirm('Are you sure you want to reject this course? It will be sent back to draft.')) {
        await api.patch(`/admin/courses/${id}/reject`);
        fetchCourses(filter);
      }
    } catch (err) {
      console.error('Failed to reject course:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (confirm('Warning: Are you absolutely sure you want to permanently delete this course?')) {
        await api.delete(`/admin/courses/${id}`);
        fetchCourses(filter);
      }
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      `${c.instructor?.firstname} ${c.instructor?.lastname}`.toLowerCase().includes(q) ||
      c.instructor?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Course Moderation</h2>
          <p className="text-sm text-gray-400 mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-48"
            />
          </div>
          {/* Status filter */}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Review (Drafts)</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-0">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Instructor</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading courses...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No courses match the criteria</td></tr>
            ) : (
              filtered.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 text-gray-500">{course.instructor?.firstname || course.instructor?.username || 'Unknown Instructor'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {course.status !== 'published' && (
                      <button
                        onClick={() => handleApprove(course.id)}
                        className="text-sm font-medium px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors border border-green-200"
                      >
                        Approve
                      </button>
                    )}
                    {course.status !== 'draft' && (
                      <button
                        onClick={() => handleReject(course.id)}
                        className="text-sm font-medium px-3 py-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-md transition-colors border border-yellow-200"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="text-sm font-medium px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors border border-red-200"
                    >
                      Delete
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

export default AdminCourses;
