import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  BookOpen,
  TrendingUp,
  Compass,
  Sparkles,
} from "lucide-react";
import CourseCardGrid from "../components/CourseCardGrid";
import api from "../api/axios";
 
// Fallback hardcoded data
import {
  recommendedCourses as hardcodedRecommended,
  enrolledCourses as hardcodedEnrolled,
  exploreCourses as hardcodedExplore,
  trendingCourses as hardcodedTrending,
} from "../data/courses";
 
import type { Course, CourseLevel } from "../data/courses";
 
// ── Section config ────────────────────────────────────────────────────────────
type SectionKey = "recommended" | "enrolled" | "explore" | "trending";
 
interface SectionConfig {
  title: string;
  subtitle: string;
  courses: Course[];
  showProgress: boolean;
  accent: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  icon: React.ReactNode;
  gradient: string;
}
 
// ── Types ─────────────────────────────────────────────────────────────────────
type SortOption = "popular" | "rating" | "newest" | "duration";
 
interface Filters {
  levels: CourseLevel[];
  categories: string[];
  minRating: number;
}
 
// ── Helpers ───────────────────────────────────────────────────────────────────
const isSectionKey = (key: string | undefined): key is SectionKey =>
  ["recommended", "enrolled", "explore", "trending"].includes(key ?? "");
 
// Helper to map backend course to frontend Course interface
const mapCourse = (backendCourse: any): Course => {
  return {
    id: String(backendCourse.id),
    title: backendCourse.title,
    instructor: backendCourse.instructor?.username || "Unknown Instructor",
    instructor_bio: backendCourse.instructor?.bio,
    instructor_avatar: backendCourse.instructor?.avatar,
    thumbnail_url: backendCourse.thumbnailUrl || "https://picsum.photos/seed/default/800/450",
    average_rating: 4.5, // Mocked for now
    total_enrollments: backendCourse.enrollments?.length || 0,
    level: backendCourse.level || "BEGINNER",
    estimated_duration_minutes: backendCourse.duration || 600,
    short_description: backendCourse.description?.substring(0, 100) + "...",
    description: backendCourse.description,
    language: backendCourse.language || "English",
    category: backendCourse.category?.name || "General",
    progress: backendCourse.enrollmentProgress,
  };
};
 
// ── Sub-components ────────────────────────────────────────────────────────────
const SortSelect: React.FC<{ value: SortOption; onChange: (v: SortOption) => void; accentText: string }> = ({
  value,
  onChange,
  accentText,
}) => {
  const options: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest First" },
    { value: "duration", label: "Shortest First" },
  ];
 
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className={`appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${accentText} pointer-events-none`} />
    </div>
  );
};
 
// ── Main Page ─────────────────────────────────────────────────────────────────
const AllCoursesPage: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
 
  const sectionKey = isSectionKey(section) ? section : "recommended";
 
  // State for dynamic courses
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>(hardcodedEnrolled);
  const [publishedCourses, setPublishedCourses] = useState<Course[]>(hardcodedRecommended); // fallback
  const [isLoading, setIsLoading] = useState(true);
 
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [filters, setFilters] = useState<Filters>({
    levels: [],
    categories: [],
    minRating: 0,
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
 
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch enrolled courses
        const enrollmentsRes = await api.get('/enrollments');
        const enrollmentsData = enrollmentsRes.data || [];
        const mappedEnrolled = enrollmentsData.map((e: any) => {
           const c = mapCourse(e.course);
           c.progress = e.progress || 0;
           return c;
        });
       
        // Fetch all published courses
        const coursesRes = await api.get('/courses/published');
        const mappedCourses = (coursesRes.data || []).map(mapCourse);
 
        // If backend returns data, override the defaults
        if (mappedEnrolled.length > 0 || enrollmentsData.length === 0) { // respect empty array if actually nothing enrolled
            setEnrolledCourses(mappedEnrolled);
        }
        if (mappedCourses.length > 0) {
            setPublishedCourses(mappedCourses);
        }
 
      } catch (err) {
        console.error("Failed to load courses data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);
 
  const SECTION_MAP = useMemo<Record<SectionKey, SectionConfig>>(() => ({
    recommended: {
      title: "Recommended for You",
      subtitle: "Curated based on your interests and learning history",
      courses: publishedCourses.length > 0 ? publishedCourses : hardcodedRecommended,
      showProgress: false,
      accent: "violet",
      accentBg: "bg-violet-50",
      accentText: "text-violet-600",
      accentBorder: "border-violet-200",
      icon: <Sparkles size={20} />,
      gradient: "bg-blue-950",
    },
    enrolled: {
      title: "Continue Learning",
      subtitle: "Pick up where you left off",
      // Only strictly fallback to hardcoded if we are somehow failing to get actual enrolled
      // But we initialized state with hardcodedEnrolled, and overwrite it on fetch success.
      courses: enrolledCourses,
      showProgress: true,
      accent: "indigo",
      accentBg: "bg-indigo-50",
      accentText: "text-indigo-600",
      accentBorder: "border-indigo-200",
      icon: <BookOpen size={20} />,
      gradient: "bg-blue-950",
    },
    explore: {
      title: "Explore New Topics",
      subtitle: "Discover something outside your comfort zone",
      courses: publishedCourses.length > 0 ? publishedCourses : hardcodedExplore,
      showProgress: false,
      accent: "emerald",
      accentBg: "bg-emerald-50",
      accentText: "text-emerald-600",
      accentBorder: "border-emerald-200",
      icon: <Compass size={20} />,
      gradient: "bg-blue-950",
    },
    trending: {
      title: "Trending Right Now",
      subtitle: "What thousands of learners are signing up for this week",
      courses: publishedCourses.length > 0 ? publishedCourses : hardcodedTrending,
      showProgress: false,
      accent: "rose",
      accentBg: "bg-rose-50",
      accentText: "text-rose-600",
      accentBorder: "border-rose-200",
      icon: <TrendingUp size={20} />,
      gradient: "bg-blue-950",
    },
  }), [publishedCourses, enrolledCourses]);
 
  const config = SECTION_MAP[sectionKey];
 
  // Derive unique categories from this section's courses
  const allCategories = useMemo(
    () => Array.from(new Set(config.courses.map((c) => c.category))).sort(),
    [config.courses]
  );
 
  // Filter
  const filtered = useMemo(() => {
    let result = [...config.courses];
 
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.short_description.toLowerCase().includes(q)
      );
    }
 
    if (filters.levels.length > 0) {
      result = result.filter((c) => filters.levels.includes(c.level));
    }
 
    if (filters.categories.length > 0) {
      result = result.filter((c) => filters.categories.includes(c.category));
    }
 
    if (filters.minRating> 0) {
      result = result.filter((c) => c.average_rating >= filters.minRating);
    }
 
    return result;
  }, [config.courses, search, filters]);
 
  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "popular": return arr.sort((a, b) => b.total_enrollments - a.total_enrollments);
      case "rating": return arr.sort((a, b) => b.average_rating - a.average_rating);
      case "duration": return arr.sort((a, b) => a.estimated_duration_minutes - b.estimated_duration_minutes);
      case "newest": return arr.reverse();
      default: return arr;
    }
  }, [filtered, sort]);
 
  const toggleLevel = (level: CourseLevel) => {
    setFilters((f) => ({
      ...f,
      levels: f.levels.includes(level) ? f.levels.filter((l) => l !== level) : [...f.levels, level],
    }));
  };
 
  const toggleCategory = (cat: string) => {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  };
 
  const clearFilters = () => {
    setFilters({ levels: [], categories: [], minRating: 0 });
    setSearch("");
  };
 
  const activeFilterCount =
    filters.levels.length +
    filters.categories.length +
    (filters.minRating > 0 ? 1 : 0);
 
  const LEVELS: CourseLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  const LEVEL_COLORS: Record<CourseLevel, string> = {
    BEGINNER: "bg-emerald-100 text-emerald-700 border-emerald-200",
    INTERMEDIATE: "bg-amber-100 text-amber-700 border-amber-200",
    ADVANCED: "bg-rose-100 text-rose-700 border-rose-200",
  };
 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className={`${config.gradient} relative overflow-hidden`}>
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
 
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>
 
          {/* Banner content - flex row to align title/subtitle left and search right */}
          <div className="flex items-center justify-between gap-8">
            {/* Left side - Title and Subtitle */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  {config.icon}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{config.title}</h1>
              </div>
              <p className="text-white/70 text-sm ml-[52px]">{config.subtitle}</p>
            </div>
 
            {/* Right side - Search bar */}
            <div className="relative max-w-md flex-shrink-0 w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${config.title}...`}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white backdrop-blur-sm text-slate-800 text-sm placeholder-slate-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-800 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
 
      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <p className="text-slate-600 text-sm">
              <span className="font-bold text-slate-800">{sorted.length}</span> courses
              {search && <span className="text-slate-400"> for "{search}"</span>}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 transition-colors"
              >
                <X size={12} />
                Clear filters ({activeFilterCount})
              </button>
            )}
          </div>
 
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? `${config.accentBg} ${config.accentText} ${config.accentBorder}`
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className={`w-5 h-5 rounded-full ${config.accentText} bg-white text-xs font-bold flex items-center justify-center shadow-sm`}>
                  {activeFilterCount}
                </span>
              )}
            </button>
 
            <SortSelect value={sort} onChange={setSort} accentText={config.accentText} />
          </div>
        </div>
 
        {/* Filter Panel */}
        {showFilters && (
          <div className={`mb-6 p-5 rounded-2xl border ${config.accentBorder} ${config.accentBg} transition-all`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Level */}
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Level</p>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => toggleLevel(level)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        filters.levels.includes(level)
                          ? LEVEL_COLORS[level]
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Min Rating */}
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Min Rating</p>
                <div className="flex flex-wrap gap-2">
                  {[0, 4.0, 4.3, 4.5, 4.7].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilters((f) => ({ ...f, minRating: r }))}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        filters.minRating === r
                          ? `${config.accentBg} ${config.accentText} ${config.accentBorder}`
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {r === 0 ? "Any" : `★ ${r}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
 
            {/* Categories */}
            {allCategories.length > 1 && (
              <div className="mt-5 pt-5 border-t border-white/60">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        filters.categories.includes(cat)
                          ? `${config.accentBg} ${config.accentText} ${config.accentBorder}`
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
 
        {/* Grid */}
        {sorted.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map((course) => (
              <CourseCardGrid
                key={course.id}
                course={course}
                showProgress={config.showProgress}
              />
            ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className={`w-16 h-16 rounded-2xl ${config.accentBg} flex items-center justify-center ${config.accentText} mb-4`}>
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No courses found</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className={`mt-4 px-4 py-2 rounded-xl text-sm font-semibold ${config.accentBg} ${config.accentText} border ${config.accentBorder} hover:shadow-sm transition-all`}
            >
              Clear all filters
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default AllCoursesPage;