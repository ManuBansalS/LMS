import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import CourseCard from "./CourseCard";
import type { Course } from "../data/courses";

type AccentColor = "violet" | "indigo" | "emerald" | "rose";

interface AccentStyle {
  badge: string;
  btn: string;
  ring: string;
  dot: string;
}

interface CourseSectionProps {
  title: string;
  subtitle?: string;
  courses: Course[];
  showProgress?: boolean;
  accentColor?: AccentColor;
  viewAllPath?: string;
}

const ACCENT_MAP: Record<AccentColor, AccentStyle> = {
  violet: { badge: "bg-violet-100 text-violet-600", btn: "bg-violet-600 hover:bg-violet-700", ring: "ring-violet-200", dot: "bg-violet-500" },
  indigo: { badge: "bg-indigo-100 text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700", ring: "ring-indigo-200", dot: "bg-indigo-500" },
  emerald: { badge: "bg-emerald-100 text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  rose: { badge: "bg-rose-100 text-rose-600", btn: "bg-rose-600 hover:bg-rose-700", ring: "ring-rose-200", dot: "bg-rose-500" },
};

export default function CourseSection({
  title,
  subtitle,
  courses,
  showProgress = false,
  accentColor = "violet",
  viewAllPath = "#",
}: CourseSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  const accent = ACCENT_MAP[accentColor];

  const checkScroll = (): void => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 40);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: number): void => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex items-start justify-between mb-5 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${accent.dot}`} />
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
          </div>
          {subtitle && <p className="text-sm text-slate-500 ml-4">{subtitle}</p>}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="p-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:shadow"
          >
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="p-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:shadow"
          >
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Scrollable Row */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        >
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} showProgress={showProgress} />
          ))}

          {/* View All Arrow Card */}
          <div className="flex-shrink-0 w-52 self-stretch">
            <a
              href={viewAllPath}
              className="flex flex-col items-center justify-center h-full min-h-[260px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-300 bg-white/60 hover:bg-violet-50 transition-all duration-300 group gap-4 p-6 text-center"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${accent.badge} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <ArrowRight size={26} className="text-current" />
              </div>
              <div>
                <p className="font-bold text-slate-700 text-sm group-hover:text-violet-700 transition-colors">
                  View All
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{title}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${accent.badge}`}>
                {courses.length}+ Courses
              </span>
            </a>
          </div>
        </div>

        {/* Right fade gradient */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-slate-50 to-transparent" />
      </div>
    </section>
  );
}
