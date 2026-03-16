import { X, Star, BookOpen, Compass, TrendingUp, Home, ChevronRight, GraduationCap, ClipboardList, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: string;
}

interface SectionLink {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
  path: string;

}

const sections: SectionLink[] = [
  {
    label: "My Enrollments",
    subtitle: "View your enrolled courses",
    icon: <UserCheck size={18} />,
    accent: "text-violet-600",
    iconBg: "bg-violet-100",
    path: "/courses/enrolled",
  },
  {
    label: "Continue Learning",
    subtitle: "Pick up where you left off",
    icon: <BookOpen size={18} />,
    accent: "text-indigo-600",
    iconBg: "bg-indigo-100",
    path: "/courses/enrolled",
  },
  {
    label: "Explore New Topics",
    subtitle: "Discover something new",
    icon: <Compass size={18} />,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-100",
    path: "/courses/explore",
  },
  {
    label: "Trending Right Now",
    subtitle: "What learners are loving this week",
    icon: <TrendingUp size={18} />,
    accent: "text-rose-600",
    iconBg: "bg-rose-100",
    path: "/courses/trending",
  },
];

const instructorSections: SectionLink[] = [
  {
    label: "Instructor Dashboard",
    subtitle: "Manage your courses and students",
    icon: <TrendingUp size={18} />,
    accent: "text-violet-600",
    iconBg: "bg-violet-100",
    path: "/instructor",
  },
  {
    label: "Create New Course",
    subtitle: "Share your knowledge with others",
    icon: <Star size={18} />,
    accent: "text-indigo-600",
    iconBg: "bg-indigo-100",
    path: "/instructor/createCourse",
  },
  {
    label: "Create Quiz",
    subtitle: "Add a quiz to your course section",
    icon: <ClipboardList size={18} />,
    accent: "text-rose-600",
    iconBg: "bg-rose-100",
    path: "/instructor/createQuiz",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isLoggedIn = false }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, [isOpen]);

  const handleNavigate = (path: string): void => {
    navigate(path);
    onClose();
  };

  const handleBecomeInstructor = async () => {
    if (!user || !user.id) {
      alert("User information not found. Please log in again.");
      return;
    }
    setLoading(true);
    console.log("Updating role for user:", user.id);
    try {
      const response = await api.patch(`/users/${user.id}`, { role: 'INSTRUCTOR' });
      console.log("Update response:", response.data);

      // role changed on server; token still has old role so fetch a new one
      try {
        const refreshRes = await api.get('/auth/refresh');
        const { token: newToken, user: newUser } = refreshRes.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser as any);
      } catch (refreshErr) {
        console.warn('Failed to refresh token after role update, you may need to log in again', refreshErr);
      }

      alert("Congratulations! You are now an instructor.");
      navigate("/instructor");
      onClose();
    } catch (error: any) {
      console.error("Error becoming instructor:", error);
      const errorMessage = error.response?.data?.message || "Failed to update role. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    return user?.username || "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer — slides in from the LEFT */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-950 flex items-center justify-center">
              <span className="text-white font-black text-sm">L</span>
            </div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">LearnHub</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* Home link */}
          <button
            onClick={() => handleNavigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors mb-4 group"
          >
            <span className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors">
              <Home size={17} />
            </span>
            <span className="font-semibold text-sm">Home</span>
          </button>

          {/* Instructor Sections */}
          {user && user.role === 'INSTRUCTOR' && (
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Instructor Panel
              </p>
              <div className="flex flex-col gap-2">
                {instructorSections.map((section) => (
                  <button
                    key={section.path}
                    onClick={() => handleNavigate(section.path)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-slate-50 transition-all duration-200 group text-left"
                  >
                    <span
                      className={`w-10 h-10 rounded-xl ${section.iconBg} ${section.accent} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      {section.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm leading-tight">{section.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{section.subtitle}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Browse Sections
            </p>

            <div className="flex flex-col gap-2">
              {sections.map((section) => (
                <button
                  key={section.path}
                  onClick={() => handleNavigate(section.path)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-slate-50 transition-all duration-200 group text-left"
                >
                  <span
                    className={`w-10 h-10 rounded-xl ${section.iconBg} ${section.accent} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    {section.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm leading-tight">{section.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{section.subtitle}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Only show if user is logged in */}
        {isLoggedIn && (
          <div className="px-5 py-4 border-t border-slate-100 space-y-4">
            {/* Become Instructor Button — only for STUDENTs */}
            {user && user.role === 'STUDENT' && (
              <button
                onClick={handleBecomeInstructor}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-200 disabled:opacity-50"
              >
                <GraduationCap size={18} />
                <span className="font-bold text-sm">
                  {loading ? "Processing..." : "Become Instructor"}
                </span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold text-sm">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || "No email provided"}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
