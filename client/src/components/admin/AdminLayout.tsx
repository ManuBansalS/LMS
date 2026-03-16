import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, BookOpen, Menu, X, GraduationCap, ChevronRight, UserCheck, ClipboardList } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/userLogin');
  };

  const navItems = [
    { label: 'Dashboard', subtitle: 'Platform overview', path: '/admin/dashboard', icon: <LayoutDashboard size={18} />, accent: 'text-violet-600', iconBg: 'bg-violet-100' },
    { label: 'Users', subtitle: 'Manage students', path: '/admin/users', icon: <Users size={18} />, accent: 'text-indigo-600', iconBg: 'bg-indigo-100' },
    { label: 'Instructors', subtitle: 'Manage instructors', path: '/admin/instructors', icon: <UserCog size={18} />, accent: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    { label: 'Courses', subtitle: 'Moderate content', path: '/admin/courses', icon: <BookOpen size={18} />, accent: 'text-rose-600', iconBg: 'bg-rose-100' },
    { label: 'Enrollments', subtitle: 'View all enrollments', path: '/admin/enrollments', icon: <UserCheck size={18} />, accent: 'text-orange-600', iconBg: 'bg-orange-100' },
    { label: 'Quizzes', subtitle: 'Manage all quizzes', path: '/admin/quizzes', icon: <ClipboardList size={18} />, accent: 'text-pink-600', iconBg: 'bg-pink-100' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
              <div className="w-8 h-8 rounded-xl bg-blue-950 flex items-center justify-center shadow-md">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-slate-800 text-lg tracking-tight hidden sm:block">
                LearnHub Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-950 flex items-center justify-center">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Management
            </p>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group text-left ${
                        isActive ? 'bg-slate-50 ring-1 ring-slate-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.accent} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                          isActive ? 'scale-110 shadow-sm' : ''
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${isActive ? 'font-black text-violet-700' : 'font-bold text-slate-800'}`}>
                          {item.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                    </div>
                    <ChevronRight size={14} className={`${isActive ? 'text-violet-500' : 'text-slate-300 group-hover:text-slate-500'} transition-colors flex-shrink-0`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
