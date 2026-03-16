import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, UserCog, BookOpen, UserCheck, CheckCircle } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  totalQuizzes: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><p className="text-gray-500 text-lg">Loading dashboard...</p></div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users size={24} />, color: 'bg-blue-500' },
    { label: 'Instructors', value: stats?.totalInstructors || 0, icon: <UserCog size={24} />, color: 'bg-purple-500' },
    { label: 'Courses', value: stats?.totalCourses || 0, icon: <BookOpen size={24} />, color: 'bg-green-500' },
    { label: 'Enrollments', value: stats?.totalEnrollments || 0, icon: <UserCheck size={24} />, color: 'bg-orange-500' },
    { label: 'Quizzes', value: stats?.totalQuizzes || 0, icon: <CheckCircle size={24} />, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-full text-white mb-4 ${card.color}`}>
              {card.icon}
            </div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{card.label}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
