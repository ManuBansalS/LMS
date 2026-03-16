import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface CourseDetails {
  id: number;
  title: string;
  description: string;
  duration: string;
  language: string;
  status: 'draft' | 'published' | 'archived';
  thumbnailUrl?: string;
  sections?: { id: number; title: string }[];
}

interface QuizDetails {
  id: number;
  title: string;
  description: string;
  duration: number;       
  passingScore: number;
  sectionId: number;
}

const InstructorPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [quizzes, setQuizzes] = useState<QuizDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizError, setQuizError] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses/my-courses');
      const data: CourseDetails[] = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setCourses(data);
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch courses');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (courseList: CourseDetails[]) => {
    try {
      setQuizLoading(true);
      const sectionIds = courseList.flatMap((c) => (c.sections ?? []).map((s) => s.id));

      if (sectionIds.length === 0) {
        setQuizzes([]);
        return;
      }

      const results = await Promise.all(
        sectionIds.map((sectionId) =>
          api
            .get(`/quizzes?sectionId=${sectionId}`)
            .then((r) => (Array.isArray(r.data) ? r.data : r.data.data ?? []))
            .catch(() => [])
        )
      );

      // Flatten and deduplicate by quiz id
      const allQuizzes: QuizDetails[] = results.flat();
      const unique = Array.from(new Map(allQuizzes.map((q) => [q.id, q])).values());
      setQuizzes(unique);
    } catch (err: any) {
      setQuizError(err?.response?.data?.message || 'Failed to fetch quizzes');
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses().then(fetchQuizzes);
  }, []);

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleDeleteQuiz = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const statusColor = (status: string) => {
    if (status === 'published') return 'text-green-600';
    if (status === 'archived') return 'text-red-500';
    return 'text-yellow-600';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-1 text-black">Instructor Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome! Manage your courses and create new content below.
      </p>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => navigate('/instructor/createCourse/')}
          className="bg-blue-950 text-white px-5 py-2 rounded-md shadow hover:bg-gray-800 transition"
        >
           Create Course +
        </button>
        <button
          onClick={() => navigate('/instructor/createQuiz/')}
          className="bg-blue-950 text-white px-5 py-2 rounded-md shadow hover:bg-gray-800 transition"
        >
          Create Quiz +
        </button>
      </div>

      <h2 className="text-2xl font-semibold mt-14 mb-4">Your Courses</h2>

      {loading && <p className="text-gray-500">Loading courses...</p>}
      {error && (
        <p className="text-red-500 mb-4">
          {error}
          {error.includes('permissions') &&
            " – you may need to click 'Become Instructor' in the sidebar or log out/in again."}
        </p>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="text-left text-gray-500 mb-8">
          No courses yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {courses.map((course) => (
          <div key={course.id} className=" rounded-lg shadow-md p-5 flex flex-col justify-between bg-slate-200 text-black transition">
            {course.thumbnailUrl && (
              <img src={course.thumbnailUrl} alt={course.title}
                className="w-full h-36 object-cover rounded mb-3" />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{course.title}</h3>
              <p className="text-blue-950 text-sm mb-3 line-clamp-3">{course.description}</p>
              <p className="text-sm text-gray-500">Duration: {course.duration}</p>
              <p className="text-sm text-gray-500">Language: {course.language}</p>
              <p className={`text-sm font-medium mt-1 capitalize ${statusColor(course.status)}`}>
                Status: {course.status}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Sections: {course.sections?.length ?? 0}
              </p>
            </div>
            <div className="flex gap-7 mt-4">
              <button onClick={() => navigate(`/course/${course.id}`)}
                className="flex-1 text-white bg-blue-950 border border-gray-400 text-gray-600 px-3 py-1.5 rounded transition text-sm">
                View
              </button>
              <button onClick={() => navigate(`/instructor/editCourse/${course.id}`)}
                className="flex-1 border border-white bg-white text-blue-950 px-3 py-1.5 rounded hover:bg-black hover:text-white transition text-sm">
                Edit
              </button>
              <button onClick={() => handleDeleteCourse(course.id)}
                className="flex-1  border border-red-500 text-red-500 px-3 py-1.5 rounded hover:bg-red-500 hover:text-white transition text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mt-14 mb-4">Your Quizzes</h2>

      {quizLoading && <p className="text-gray-500">Loading quizzes...</p>}
      {quizError && <p className="text-red-500 mb-4">{quizError}</p>}

      {!quizLoading && !quizError && quizzes.length === 0 && (
        <div className="text-left text-gray-500">
          No quizzes yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className=" rounded-lg shadow-md p-5 flex flex-col justify-between bg-slate-200 text-black">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{quiz.title}</h3>
              <p className="text-blue-950 text-sm mb-3 line-clamp-3">{quiz.description}</p>
              <p className="text-sm text-gray-500">
                Duration: {Math.floor(quiz.duration / 60)} min{quiz.duration % 60 > 0 ? ` ${quiz.duration % 60}s` : ''}
              </p>
              <p className="text-sm text-gray-500">Passing Score: {quiz.passingScore}%</p>
              <p className="text-sm text-gray-400 mt-1">
                Section: {
                  courses
                    .flatMap((c) => c.sections ?? [])
                    .find((s) => s.id === quiz.sectionId)?.title ?? `ID ${quiz.sectionId}`
                }
              </p>
            </div>
            <div className="flex gap-9 mt-4">
              <button onClick={() => navigate(`/instructor/editQuiz/${quiz.id}`)}
                className="flex-1 border border-white bg-white text-blue-950 px-2 py-1 rounded hover:bg-black hover:text-white transition text-sm">
                Edit
              </button>
              <button onClick={() => handleDeleteQuiz(quiz.id)}
                className="flex-1 border border-red-500 text-red-500 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorPage;