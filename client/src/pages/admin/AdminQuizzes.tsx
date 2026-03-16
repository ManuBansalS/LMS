import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { ClipboardList, Search, Trash2, Clock, FileQuestion, ChevronDown, ChevronUp } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  createdAt: string;
  questions?: Question[];
  section?: {
    id: number;
    title: string;
    course?: {
      id: number;
      title: string;
    };
  };
}

const AdminQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quizzes');
      setQuizzes(res.data);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  const filtered = quizzes.filter((q) => {
    const term = search.toLowerCase();
    return (
      q.title?.toLowerCase().includes(term) ||
      q.description?.toLowerCase().includes(term) ||
      q.section?.course?.title?.toLowerCase().includes(term)
    );
  });

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m${s > 0 ? ` ${s}s` : ''}` : `${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quizzes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {quizzes.length} total quiz{quizzes.length !== 1 ? 'zes' : ''}
          </p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white shadow-sm w-64"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
            <ClipboardList size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Quizzes</p>
            <p className="text-xl font-bold text-slate-800">{quizzes.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <FileQuestion size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Questions</p>
            <p className="text-xl font-bold text-slate-800">
              {quizzes.reduce((sum, q) => sum + (q.questions?.length ?? 0), 0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avg Duration</p>
            <p className="text-xl font-bold text-slate-800">
              {quizzes.length > 0
                ? formatDuration(Math.round(quizzes.reduce((sum, q) => sum + (q.duration ?? 0), 0) / quizzes.length))
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p>Loading quizzes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <ClipboardList size={40} className="opacity-25" />
          <p className="font-medium">No quizzes found</p>
          <p className="text-sm">{search ? 'Try a different search term' : 'No quizzes have been created yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-rose-200">
                    <ClipboardList size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-base truncate">{quiz.title}</h3>
                    </div>
                    {quiz.description && (
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{quiz.description}</p>
                    )}
                    {quiz.section?.course && (
                      <p className="text-xs text-violet-600 font-medium mt-1">
                        Course: {quiz.section.course.title}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <Clock size={11} />
                        {formatDuration(quiz.duration ?? 0)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <FileQuestion size={11} />
                        {quiz.questions?.length ?? 0} question{(quiz.questions?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 font-medium">
                        Pass: {quiz.passingScore}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(quiz.questions?.length ?? 0) > 0 && (
                    <button
                      onClick={() => setExpanded(expanded === quiz.id ? null : quiz.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                      {expanded === quiz.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      Questions
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded questions */}
              {expanded === quiz.id && quiz.questions && quiz.questions.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Questions</p>
                  {quiz.questions.map((q, qi) => (
                    <div key={q.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <p className="font-semibold text-slate-800 text-sm mb-3">
                        <span className="text-violet-500 mr-1">Q{qi + 1}.</span> {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                              oi === q.correctAnswer
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold'
                                : 'bg-slate-50 border border-slate-100 text-slate-600'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              oi === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                            {oi === q.correctAnswer && <span className="ml-auto text-xs text-emerald-600">✓ Correct</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;
