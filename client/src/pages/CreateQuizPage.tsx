import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { createQuiz, updateQuiz } from "../api/QuizApi";
import { getQuiz } from "../api/GetQuiz";
import type { Question } from "../types/quiz";

interface CourseOption {
  id: number;
  title: string;
  sections: { id: number; title: string }[];
}

const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: quizId } = useParams<{ id: string }>();
  const isEditMode = !!quizId;

  // â”€â”€ Courses / sections for dropdowns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");

  // â”€â”€ Form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectionId, setSectionId] = useState<number | "">("");
  const [duration, setDuration] = useState(1800);
  const [passingScore, setPassingScore] = useState(70);

  // Current question being built
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // â”€â”€ Fetch instructor's own courses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/courses/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data: CourseOption[] = Array.isArray(res.data)
          ? res.data
          : (res.data.data ?? []);
        setCourses(data);
      })
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  }, []);

  // â”€â”€ In edit mode: populate form after courses are loaded â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!isEditMode || coursesLoading) return;
    getQuiz(Number(quizId))
      .then((data) => {
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setDuration(data.duration ?? 1800);
        setPassingScore(data.passingScore ?? 70);
        setQuiz(Array.isArray(data.questions) ? data.questions : []);
        setSectionId(data.sectionId);
        const matchingCourse = courses.find((c) =>
          c.sections.some((s) => s.id === data.sectionId),
        );
        if (matchingCourse) setSelectedCourseId(matchingCourse.id);
      })
      .catch(() => setError("Failed to load quiz data."));
  }, [isEditMode, coursesLoading]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const handleCourseChange = (courseId: number | "") => {
    setSelectedCourseId(courseId);
    setSectionId("");
  };

  // â”€â”€ Question handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleOptionChange = (value: string, index: number) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addQuestion = () => {
    if (!questionText.trim() || options.some((o) => !o.trim())) {
      setError("Please fill in the question and all options before adding.");
      return;
    }
    setError("");
    setQuiz([
      ...quiz,
      { id: quiz.length + 1, question: questionText, options, correctAnswer },
    ]);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  const removeQuestion = (index: number) => {
    setQuiz(
      quiz.filter((_, i) => i !== index).map((q, i) => ({ ...q, id: i + 1 })),
    );
  };

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async () => {
    setError("");
    if (!selectedCourseId) {
      setError("Please select a course.");
      return;
    }
    if (!sectionId) {
      setError("Please select a section.");
      return;
    }
    if (!title || !description) {
      setError("Please fill in all required fields.");
      return;
    }
    if (quiz.length === 0) {
      setError("Please add at least one question.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updateQuiz(Number(quizId), {
          title,
          description,
          duration,
          passingScore,
          questions: quiz,
        });
      } else {
        await createQuiz({
          sectionId: Number(sectionId),
          title,
          description,
          duration,
          passingScore,
          questions: quiz,
        });
      }
      navigate("/instructor");
    } catch (err) {
      console.error(err);
      setError(
        `Error ${isEditMode ? "updating" : "creating"} quiz. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border shadow-md shadow-blue-500 border-gray-200 rounded-lg px-2 py-1";
  const labelClass = "block text-gray-700 font-medium mb-1";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {isEditMode ? "Edit Quiz" : "Create Quiz"}
      </h1>

      {error && (
        <p className="text-red-500 mb-4 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-5 p-6 border shadow-md shadow-blue-500 border-gray-300 rounded-xl">
        {/* Course dropdown */}
        <div>
          <label className={labelClass}>
            Course <span className="text-red-500">*</span>
          </label>
          <select
            className={inputClass}
            value={selectedCourseId}
            onChange={(e) =>
              handleCourseChange(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            disabled={coursesLoading || isEditMode}
          >
            <option value="">
              {coursesLoading ? "Loading courses..." : "Select a course"}
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Section dropdown */}
        <div>
          <label className={labelClass}>
            Section <span className="text-red-500">*</span>
          </label>
          <select
            className={inputClass}
            value={sectionId}
            onChange={(e) =>
              setSectionId(e.target.value === "" ? "" : Number(e.target.value))
            }
            disabled={
              isEditMode ||
              !selectedCourse ||
              selectedCourse.sections.length === 0
            }
          >
            <option value="">
              {!selectedCourseId
                ? "Select a course first"
                : selectedCourse?.sections.length === 0
                  ? "No sections in this course"
                  : "â€” Select a section â€”"}
            </option>
            {(selectedCourse?.sections ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className={inputClass}
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className={inputClass}
            placeholder="Describe the quiz..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Duration */}
        <div>
          <label className={labelClass}>Duration (seconds)</label>
          <input
            className={inputClass}
            type="number"
            placeholder="Duration in seconds"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>

        {/* Passing Score */}
        <div>
          <label className={labelClass}>Passing Score (%)</label>
          <input
            className={inputClass}
            type="number"
            placeholder="e.g. 70"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />
        </div>

        {/* Question builder */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-1 rounded"
            >
              + Add Question
            </button>
          </div>

          <div className="border rounded-md p-4 bg-gray-50 shadow-md shadow-blue-500 border-gray-300 flex flex-col gap-3">
            <div>
              <label className={labelClass}>Question</label>
              <input
                className={inputClass}
                type="text"
                placeholder="Enter question text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="flex-1 border shadow-md shadow-blue-500 border-gray-200 rounded-lg px-2 py-1"
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(e.target.value, index)}
                />
                <label className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswer === index}
                    onChange={() => setCorrectAnswer(index)}
                  />
                  Correct
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Added questions list */}
        {quiz.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">Questions Added</h2>
            {quiz.map((q, qIndex) => (
              <div
                key={q.id}
                className="border rounded-md p-4 mb-3 bg-gray-50 shadow-md shadow-blue-500 border-gray-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">
                    Q{qIndex + 1}: {q.question}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {q.options.map((o, i) => (
                    <li
                      key={i}
                      className={
                        q.correctAnswer === i
                          ? "text-green-600 font-medium"
                          : ""
                      }
                    >
                      Option {i + 1}: {o}
                      {q.correctAnswer === i && " (Correct Answer)"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No questions added yet.</p>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-md shadow hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Submitting..."
              : isEditMode
                ? "Update Quiz"
                : "Create Quiz"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/instructor")}
            className="border border-gray-400 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage;
