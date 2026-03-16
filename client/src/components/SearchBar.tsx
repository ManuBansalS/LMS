import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, BookOpen, Clock, TrendingUp } from "lucide-react";
import api from "../api/axios";

interface CourseResult {
  id: number;
  title: string;
  thumbnailUrl?: string;
  language?: string;
  status?: string;
  duration?: string;
  instructor?: {
    firstname?: string;
    lastname?: string;
  };
}

const DEBOUNCE_MS = 280;

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CourseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch results with debounce ──────────────────────────────────────
  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<CourseResult[]>(`/courses?title=${encodeURIComponent(q)}`);
      // Only show published courses in search suggestions
      const data = res.data.filter((c) => c.status === "published" || !c.status);
      setResults(data.slice(0, 8)); // cap at 8 suggestions
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Handle typing ─────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    // Show loading state immediately so the user knows something is happening
    setLoading(true);
    debounceRef.current = setTimeout(() => fetchResults(val), DEBOUNCE_MS);
  };

  // ── Keyboard navigation ───────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        goToCourse(results[activeIdx].id);
      }
    } else if (e.key === "Escape") {
      close();
    }
  };

  // ── Navigate to course ────────────────────────────────────────────────
  const goToCourse = (id: number) => {
    close();
    navigate(`/course/${id}`);
  };

  // ── Close dropdown ────────────────────────────────────────────────────
  const close = () => {
    setOpen(false);
    setActiveIdx(-1);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  };

  // ── Click outside to dismiss ──────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Cleanup debounce on unmount ───────────────────────────────────────
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const showDropdown = open && (loading || results.length > 0 || (query.trim().length > 0 && !loading));

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl mx-4">
      {/* ── Input ── */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-200 bg-white ${
          open
            ? "border-violet-400 shadow-lg shadow-violet-100 ring-2 ring-violet-100"
            : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        ) : (
          <Search
            size={16}
            className={`flex-shrink-0 transition-colors ${open ? "text-violet-500" : "text-slate-400"}`}
          />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search courses, topics, instructors…"
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          autoComplete="off"
          spellCheck={false}
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
          {loading && results.length === 0 ? (
            <div className="px-5 py-4 text-sm text-slate-400 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              Searching…
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <TrendingUp size={12} />
                Courses
              </div>
              <ul role="listbox">
                {results.map((course, idx) => {
                  const instructorName = [course.instructor?.firstname, course.instructor?.lastname]
                    .filter(Boolean)
                    .join(" ") || "Instructor";

                  return (
                    <li
                      key={course.id}
                      role="option"
                      aria-selected={idx === activeIdx}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseDown={(e) => { e.preventDefault(); goToCourse(course.id); }}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        idx === activeIdx
                          ? "bg-violet-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* Thumbnail / icon */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <BookOpen size={18} className="text-slate-400" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                          {/* Highlight matched portion */}
                          <HighlightMatch text={course.title} query={query} />
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {instructorName}
                          {course.language && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">
                              {course.language}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Duration badge */}
                      {course.duration && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                          <Clock size={11} />
                          {course.duration}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="px-4 py-2.5 border-t border-slate-50 text-xs text-slate-400">
                {results.length} result{results.length !== 1 ? "s" : ""} · Press ↑↓ to navigate, Enter to open
              </div>
            </>
          ) : query.trim() && !loading ? (
            <div className="px-5 py-4 text-sm text-slate-400 flex items-center gap-2">
              <Search size={14} />
              No courses found for "<span className="font-medium text-slate-600">{query}</span>"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

// ── Helper: bold the matching portion of text ─────────────────────────────
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-violet-100 text-violet-700 rounded px-0.5 font-bold not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

export default SearchBar;
