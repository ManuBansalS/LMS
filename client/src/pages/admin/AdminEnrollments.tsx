import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { UserCheck, Search, Trash2, BookOpen, Calendar, User } from 'lucide-react';

interface Enrollment {
  id: number;
  enrolledAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstname?: string;
    lastname?: string;
  };
  course: {
    id: number;
    title: string;
    status: string;
  };
}

const AdminEnrollments: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/enrollments');
      setEnrollments(res.data);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return;
    try {
      await api.delete(`/admin/enrollments/${id}`);
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete enrollment:', err);
    }
  };

  const filtered = enrollments.filter((e) => {
    const q = search.toLowerCase();
    const name = `${e.user?.firstname ?? ''} ${e.user?.lastname ?? ''}`.toLowerCase();
    return (
      name.includes(q) ||
      e.user?.username?.toLowerCase().includes(q) ||
      e.user?.email?.toLowerCase().includes(q) ||
      e.course?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Enrollments</h1>
          <p className="text-sm text-slate-500 mt-1">
            {enrollments.length} total enrollment{enrollments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white shadow-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
            <UserCheck size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total</p>
            <p className="text-xl font-bold text-slate-800">{enrollments.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <User size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Students</p>
            <p className="text-xl font-bold text-slate-800">
              {new Set(enrollments.map((e) => e.user?.id)).size}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Courses</p>
            <p className="text-xl font-bold text-slate-800">
              {new Set(enrollments.map((e) => e.course?.id)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">All Enrollments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">#</th>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Enrolled On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading enrollments...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <UserCheck size={32} className="opacity-30" />
                      <p className="font-medium">No enrollments found</p>
                      <p className="text-xs">{search ? 'Try a different search term' : 'No students have enrolled yet'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((enrollment, idx) => (
                  <tr key={enrollment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(enrollment.user?.firstname?.[0] ?? enrollment.user?.username?.[0] ?? 'U').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {enrollment.user?.firstname
                              ? `${enrollment.user.firstname} ${enrollment.user.lastname ?? ''}`
                              : enrollment.user?.username}
                          </p>
                          <p className="text-xs text-slate-400">{enrollment.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-700 truncate max-w-[200px]">
                          {enrollment.course?.title ?? 'Unknown Course'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(enrollment.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollments;
