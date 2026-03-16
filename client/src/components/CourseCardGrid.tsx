import { Star, Clock, Users, Play, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../data/courses";

interface CourseCardGridProps {
  course: Course;
  showProgress?: boolean;
}

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

export default function CourseCardGrid({ course, showProgress = false }: CourseCardGridProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/course/${course.id}`)}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      {/* Thumbnail */}
      <div className="relative overflow-hidden h-44">
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play size={18} className="text-violet-700 fill-violet-700 ml-0.5" />
          </div>
        </div>

        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLORS[course.level]}`}>
          {course.level}
        </span>
        {course.is_featured && (
          <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-violet-600 text-white">
            FEATURED
          </span>
        )}

      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <span className="text-xs font-medium text-violet-600 tracking-wide uppercase">
          {course.category}
        </span>

        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.short_description}</p>

        <p className="text-xs text-slate-500 font-medium">{course.instructor}</p>

        {/* Progress bar */}
        {showProgress && course.progress !== undefined && (
          <div className="mt-1">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <BookOpen size={10} />
                <span className="truncate max-w-[140px]">{course.last_watched}</span>
              </span>
              <span className="font-semibold text-violet-600 ml-1">{course.progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-950 rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-50 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold text-slate-700">{course.average_rating}</span>
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} />
            {formatEnrollments(course.total_enrollments)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDuration(course.estimated_duration_minutes)}
          </span>
        </div>
      </div>
    </div>
  );
}
