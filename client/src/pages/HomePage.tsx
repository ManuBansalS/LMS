import { Search, Sparkles, X } from "lucide-react";
import CourseSection from "../components/CourseSection";
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import type { Course } from "../data/courses";
import {
  recommendedCourses as hardcodedRecommended,
  exploreCourses as hardcodedExplore,
  trendingCourses as hardcodedTrending,
} from "../data/courses";
 
// Helper to map backend course to frontend Course interface
const mapCourse = (backendCourse: any): Course => {
  return {
    id: String(backendCourse.id),
    title: backendCourse.title,
    instructor: backendCourse.instructor?.name || "Unknown Instructor",
    instructor_bio: backendCourse.instructor?.bio,
    instructor_avatar: backendCourse.instructor?.avatar,
    thumbnail_url: backendCourse.thumbnailUrl || "https://picsum.photos/seed/default/800/450",
    price: parseFloat(backendCourse.price),
    average_rating: 4.5,
    total_enrollments: backendCourse.enrollments?.length || 0,
    level: backendCourse.level || "BEGINNER",
    estimated_duration_minutes: backendCourse.duration || 600,
    short_description: backendCourse.description?.substring(0, 100) + "...",
    description: backendCourse.description,
    language: backendCourse.language || "English",
    category: backendCourse.category?.name || "General",
    progress: backendCourse.enrollmentProgress, // Only for enrolled courses
  };
};
 
const WelcomeBanner: React.FC<{ name?: string; count?: number }> = ({ name = "Student", count = 0 }) => (
  <div className="relative mb-10 rounded-3xl overflow-hidden bg-blue-950 p-8 shadow-2xl">
    <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
    <div className="absolute -bottom-8 -right-4 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
 
    <div className="relative z-10 flex flex-col items-center text-center">
 
  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
    <Sparkles size={12} />
    Personalized for you
  </div>
 
  <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight">
    Welcome back, <br />
    <span className="text-violet-200">{name}! 👋</span>
  </h1>
 
  <p className="text-violet-100 text-sm max-w-xs leading-relaxed mx-auto">
    You have <span className="text-white font-bold">{count} courses</span> in progress. Keep the momentum going!
  </p>
 
  <div className="flex justify-center gap-4 mt-6">
    {[
      { value: "0", label: "Completed" },
      { value: String(count), label: "In Progress" },
      { value: "0h", label: "Learning Time" },
    ].map(({ value, label }) => (
      <div
        key={label}
        className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 text-center"
      >
        <p className="text-white font-black text-xl">{value}</p>
        <p className="text-violet-200 text-xs">{label}</p>
      </div>
    ))}
  </div>
 
</div>
 
  </div>
);
 
const HomePage: React.FC = () => {
  const isLoggedIn = !!localStorage.getItem("token");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [userName, setUserName] = useState<string>("User");
  const [search, setSearch] = useState("");
 
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        if (isLoggedIn) {
          // Fetch enrolled courses
          const enrollmentsRes = await api.get('/enrollments');
          const enrollmentsData = enrollmentsRes.data || [];
          const mappedEnrolled = enrollmentsData.map((e: any) => {
            const c = mapCourse(e.course);
            c.progress = e.progress || 0;
            return c;
          });
          setEnrolledCourses(mappedEnrolled);
          if (enrollmentsData.length > 0 && enrollmentsData[0].user) {
            setUserName(
              enrollmentsData[0].user.firstname || 
              enrollmentsData[0].user.username || 
              enrollmentsData[0].user.email || 
              "User"
            );
          }
        }
 
        // Always fetch published courses
        const coursesRes = await api.get('/courses/published');
        const mappedCourses = (coursesRes.data || []).map(mapCourse);
        setPublishedCourses(mappedCourses);
 
      } catch (err) {
        console.error("Failed to load home data", err);
      }
    };
    fetchHomeData();
  }, []);
 
  const displayRecommended = publishedCourses.length > 0 ? publishedCourses : hardcodedRecommended;
  const displayExplore = publishedCourses.length > 0 ? publishedCourses : hardcodedExplore;
  const displayTrending = publishedCourses.length > 0 ? publishedCourses : hardcodedTrending;

  // ── Guest view ─────────────────────────────────────────────────────
  if (!isLoggedIn) {
    const filtered = search.trim()
      ? displayRecommended.filter((c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.instructor.toLowerCase().includes(search.toLowerCase()) ||
          c.category.toLowerCase().includes(search.toLowerCase())
        )
      : displayRecommended;

    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-blue-900 mb-1">Welcome to LearnHub!</h1>
              <h1 className="text-3xl font-black text-slate-800 my-4">Browse Courses</h1>
              <p className="text-slate-500 text-sm">
                <span className="font-semibold text-slate-700">New here?</span>{" "}
                <a href="/userLogin" className="text-violet-600 hover:underline font-semibold">Sign in</a>{" "}
                to enroll and track your progress.
              </p>
            </div>
            <div className="relative w-full sm:w-80 flex-shrink-0">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, topics, instructors..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-800 bg-white text-slate-800 text-sm placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
          <CourseSection
            title="All Courses"
            subtitle="Browse our full course library"
            courses={filtered.slice(0, 8)}
            accentColor="violet"
            viewAllPath="/courses/recommended"
          />
        </div>
      </div>
    );
  }

  // ── Logged-in view ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeBanner name={userName} count={enrolledCourses.length} />
 
        <CourseSection
          title="Recommended for You"
          subtitle="Curated based on your interests and learning history"
          courses={displayRecommended.slice(0, 6)}
          accentColor="violet"
          viewAllPath="/courses/recommended"
        />
 
        {enrolledCourses.length > 0 && (
          <CourseSection
            title="Continue Learning"
            subtitle="Pick up where you left off"
            courses={enrolledCourses.slice(0, 6)}
            showProgress={true}
            accentColor="indigo"
            viewAllPath="/courses/enrolled"
          />
        )}
 
        <CourseSection
          title="Explore New Topics"
          subtitle="Discover something outside your comfort zone"
          courses={displayExplore.slice(0, 6)}
          accentColor="emerald"
          viewAllPath="/courses/explore"
        />
 
        <CourseSection
          title="Trending Right Now"
          subtitle="What thousands of learners are signing up for this week"
          courses={displayTrending.slice(0, 6)}
          accentColor="rose"
          viewAllPath="/courses/trending"
        />
      </div>
    </div>
  );
};
 
export default HomePage;