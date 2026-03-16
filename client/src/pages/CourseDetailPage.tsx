import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, Users, Clock, Globe, BarChart2,
  CheckCircle, PlayCircle, ChevronDown, ChevronUp,
  ShoppingCart, Zap, Award, BookOpen, Tag
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "../api/axios";
 
// Default Course Interface to map onto frontend expected schema
import type { Course } from "../data/courses";
// Optional fallback
import { allCoursesMap } from "../data/courses";
 
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-rose-100 text-rose-700",
};
 
const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};
 
const formatEnrollments = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};
 
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={
            star <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-300 fill-slate-300"
          }
        />
      ))}
    </div>
  );
};
 
// Helper mapper
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
    what_you_learn: [
      "Build real-world projects from scratch",
      "Understand core concepts deeply, not just syntax",
      "Write clean, maintainable, production-ready code"
    ], // Fake dummy data since backend might lack this
    requirements: [
      "Basic computer literacy and internet access",
      "No prior experience required — we start from the basics",
    ],
    curriculum: [ // Mock curriculum since backend section/content structure doesn't seem fully mapped to this generic UI yet
      {
        title: "Getting Started",
        lessons: ["Introduction", "Setup Environment"]
      }
    ],
    tags: ["Programming", "Beginner"]
  };
};
 
export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
 
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
 
  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      try {
        setIsLoading(true);
 
        if (!id) return;
 
        // Fetch course info
        let fetchedCourse = null;
        try {
           const courseRes = await api.get(`/courses/${id}`);
           if (courseRes.data) {
             fetchedCourse = mapCourse(courseRes.data);
           }
        } catch(e) {
             // Fallback to local hardcoded data just in case during testing
             if (allCoursesMap[id]) {
                 fetchedCourse = allCoursesMap[id];
             }
        }
 
        setCourse(fetchedCourse);
 
        // Check if user is already enrolled
        try {
          // Alternatively fetch all and filter
          const enrolRes = await api.get('/enrollments');
          const isUserEnrolled = (enrolRes.data || []).some((e: any) => String(e.courseId) === id);
          setIsEnrolled(isUserEnrolled);
        } catch (e) {
          console.error("Could not check enrollment", e);
        }
 
      } catch (err) {
        console.error("Error loading course details", err);
        // Fallback
        if (id && allCoursesMap[id]) {
           setCourse(allCoursesMap[id]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseAndEnrollment();
  }, [id]);
 
  const handleEnroll = async () => {
    if (!id || !course) return;

    // Guest: redirect to login
    if (!localStorage.getItem("token")) {
      navigate("/userLogin");
      return;
    }

    if (isEnrolled) {
       navigate("/courses/enrolled");
       return;
    }
 
    try {
      setEnrollmentLoading(true);
       // Ensure courseId is a number matching the ID param
      await api.post('/enrollments', { courseId: parseInt(id, 10) });
      setIsEnrolled(true);
      alert("Successfully enrolled!");
    } catch (err: any) {
      console.error("Failed to enroll", err);
      // Sometimes it returns 409 if user is already enrolled
      if (err.response?.status === 409) {
          setIsEnrolled(true); // Probably already enrolled according to Server
          alert("You are already enrolled. Going to course.");
      } else {
          alert(err.response?.data?.message || "Failed to enroll in the course. Please try again.");
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };
 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }
 
  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-slate-700">Course not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }
 
  const totalLessons = course.curriculum?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;
 
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-blue-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
 
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left — course info */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Category + level */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                  {course.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLORS[course.level] || LEVEL_COLORS.BEGINNER}`}>
                  {course.level}
                </span>
                {course.is_featured && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-600 text-white">
                    FEATURED
                  </span>
                )}
              </div>
 
              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                {course.title}
              </h1>
 
              {/* Short description */}
              <p className="text-slate-300 text-base leading-relaxed">
                {course.short_description}
              </p>
 
              {/* Rating row */}
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-lg">{course.average_rating}</span>
                  <StarRating rating={course.average_rating} />
                  <span className="text-slate-400">({formatEnrollments(course.total_enrollments)} students)</span>
                </div>
              </div>
 
              {/* Meta row */}
              <div className="flex flex-wrap gap-5 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  {formatEnrollments(course.total_enrollments)} enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  {formatDuration(course.estimated_duration_minutes)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-slate-400" />
                  {course.language}
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart2 size={14} className="text-slate-400" />
                  {course.level}
                </span>
              </div>
 
              {/* Instructor */}
              <p className="text-slate-400 text-sm">
                Created by{" "}
                <span className="text-violet-400 font-semibold cursor-pointer hover:text-violet-300 transition-colors">
                  {course.instructor}
                </span>
              </p>
            </div>
 
            {/* Right — sticky purchase card (desktop) */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden sticky top-24">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-6 flex flex-col gap-4">
                  <button
                    onClick={handleEnroll}
                    disabled={enrollmentLoading}
                    className="w-full py-3.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {!isEnrolled && <ShoppingCart size={18} />}
                    {enrollmentLoading ? "Processing..." : isEnrolled ? "Go to Course" : "Enroll"}
                  </button>
                 
                  {!isEnrolled && (
                    <button className="w-full py-3 border-2 border-slate-200 hover:border-violet-300 text-slate-700 hover:text-violet-700 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2">
                      <Zap size={16} />
                      Add to Wishlist
                    </button>
                  )}
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-2"><BookOpen size={13} /> {totalLessons} lessons</span>
                    <span className="flex items-center gap-2"><Clock size={13} /> {formatDuration(course.estimated_duration_minutes)} total</span>
                    <span className="flex items-center gap-2"><Award size={13} /> Certificate of completion</span>
                    <span className="flex items-center gap-2"><Globe size={13} /> {course.language}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-10">
 
          {/* What you'll learn */}
          {course.what_you_learn && course.what_you_learn.length > 0 && (
            <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-800 mb-5">What You'll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.what_you_learn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
 
          {/* Description */}
          {course.description && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-800 mb-4">Course Description</h2>
              {course.description.split("\n\n").map((para, i) => (
                <p key={i} className="text-slate-600 text-sm leading-relaxed mb-3">
                  {para}
                </p>
              ))}
            </section>
          )}
 
          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-800 mb-4">Requirements</h2>
              <ul className="flex flex-col gap-2">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          )}
 
          {/* Curriculum */}
          {course.curriculum && course.curriculum.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-slate-800">Course Content</h2>
                <span className="text-xs text-slate-500">
                  {course.curriculum.length} modules · {totalLessons} lessons
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {course.curriculum.map((module, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">{module.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{module.lessons.length} lessons</span>
                        {expandedModule === i ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </div>
                    </button>
                    {expandedModule === i && (
                      <div className="border-t border-slate-100 bg-slate-50">
                        {module.lessons.map((lesson, j) => (
                          <div
                            key={j}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-slate-600 border-b border-slate-100 last:border-b-0 hover:bg-white transition-colors cursor-pointer"
                          >
                            <PlayCircle size={14} className="text-violet-400 flex-shrink-0" />
                            {lesson}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
 
          {/* Instructor */}
          <section>
            <h2 className="text-xl font-extrabold text-slate-800 mb-5">Your Instructor</h2>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex gap-5">
              <img
                src={course.instructor_avatar ?? `https://picsum.photos/seed/${course.id}inst/80/80`}
                alt={course.instructor}
                className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
              />
              <div>
                <p className="font-extrabold text-slate-800 text-base">{course.instructor}</p>
                <p className="text-xs text-violet-600 font-medium mb-3">{course.category} Instructor</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    {course.average_rating} Rating
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {formatEnrollments(course.total_enrollments)} Students
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {course.instructor_bio ?? "An experienced instructor passionate about teaching."}
                </p>
              </div>
            </div>
          </section>
 
          {/* Tags */}
          {course.tags && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-800 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-colors cursor-pointer shadow-sm"
                  >
                    <Tag size={11} />
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
 
        {/* Right sidebar — purchase card mobile / repeat desktop sticky */}
        <div className="lg:hidden">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-44 object-cover"
            />
            <div className="p-6 flex flex-col gap-4">
              <button
                onClick={handleEnroll}
                disabled={enrollmentLoading}
                className="w-full py-3.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                {!isEnrolled && <ShoppingCart size={18} />}
                {enrollmentLoading ? "Processing..." : isEnrolled ? "Go to Course" : "Enroll"}
              </button>

              {!isEnrolled && (
                <button className="w-full py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-2">
                  <Zap size={16} />
                  Add to Wishlist
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}