import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface Section {
  title: string;
  description: string;
  videoUrl: string;
  orderIndex: number;
}

interface CourseForm {
  title: string;
  description: string;
  duration: string;
  language: string;
  status: "draft" | "published" | "archived";
  videoUrl: string;
  thumbnailUrl: string;
  sections: Section[];
}

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { id: courseId } = useParams<{ id: string }>();
  const isEditMode = !!courseId;
  const token = localStorage.getItem("token");

  const [form, setForm] = useState<CourseForm>({
    title: "",
    description: "",
    duration: "",
    language: "",
    status: "published",
    videoUrl: "",
    thumbnailUrl: "",
    sections: [],
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Load existing course in edit mode ──────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;
    axios
      .get(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const c = res.data;
        setForm({
          title: c.title ?? "",
          description: c.description ?? "",
          duration: c.duration ?? "",
          language: c.language ?? "",
          status: c.status ?? "published",
          videoUrl: c.videoUrl ?? "",
          thumbnailUrl: c.thumbnailUrl ?? "",
          sections: (c.sections ?? []).map((s: any) => ({
            title: s.title ?? "",
            description: s.description ?? "",
            videoUrl: s.videoUrl ?? "",
            orderIndex: s.orderIndex ?? 0,
          })),
        });
      })
      .catch(() => setError("Failed to load course data."))
      .finally(() => setFetchLoading(false));
  }, [isEditMode, courseId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSection = () => {
    setForm({
      ...form,
      sections: [
        ...form.sections,
        {
          title: "",
          description: "",
          videoUrl: "",
          orderIndex: form.sections.length,
        },
      ],
    });
  };

  const handleSectionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const updatedSections = [...form.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [e.target.name]: e.target.value,
    };
    setForm({ ...form, sections: updatedSections });
  };

  const removeSection = (index: number) => {
    const updatedSections = form.sections
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, orderIndex: i }));
    setForm({ ...form, sections: updatedSections });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.description || !form.duration || !form.language) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        // PATCH — UpdateCourseDto fields only (no sections)
        await axios.patch(
          `/api/courses/${courseId}`,
          {
            title: form.title,
            description: form.description,
            duration: form.duration,
            language: form.language,
            status: form.status,
            videoUrl: form.videoUrl || undefined,
            thumbnailUrl: form.thumbnailUrl || undefined,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSuccess("Course updated successfully!");
      } else {
        const payload = {
          ...form,
          videoUrl: form.videoUrl || undefined,
          thumbnailUrl: form.thumbnailUrl || undefined,
          sections: form.sections.map((s) => ({
            title: s.title,
            description: s.description,
            orderIndex: s.orderIndex,
            ...(s.videoUrl ? { videoUrl: s.videoUrl } : {}),
          })),
        };
        await axios.post("/api/courses", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Course created successfully!");
      }
      setTimeout(() => navigate("/instructor"), 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} course`,
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border shadow-md shadow-blue-500 border-gray-200 rounded-lg px-2 py-1";
  const labelClass = "block text-gray-700 font-medium mb-1";

  if (fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-gray-500">
        Loading course data...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {isEditMode ? "Edit Course" : "Create Course"}
      </h1>

      {error && (
        <p className="text-red-500 mb-4 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-600 mb-4 bg-green-50 border border-green-200 rounded p-2">
          {success}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 p-6 border shadow-md shadow-blue-500 border-gray-300 rounded-xl"
      >
        <div>
          <label className={labelClass}>
            Course Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            type="text"
            className={inputClass}
            placeholder="e.g. Introduction to React"
          />
        </div>

        <div>
          <label className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className={inputClass}
            placeholder="Describe your course..."
            rows={4}
          />
        </div>

        <div>
          <label className={labelClass}>
            Duration <span className="text-red-500">*</span>
          </label>
          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
            type="text"
            className={inputClass}
            placeholder="e.g. 10 hours"
          />
        </div>

        <div>
          <label className={labelClass}>
            Language <span className="text-red-500">*</span>
          </label>
          <input
            name="language"
            value={form.language}
            onChange={handleChange}
            type="text"
            className={inputClass}
            placeholder="e.g. English"
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Video URL</label>
          <input
            name="videoUrl"
            value={form.videoUrl}
            onChange={handleChange}
            type="url"
            className={inputClass}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className={labelClass}>Thumbnail URL</label>
          <input
            name="thumbnailUrl"
            value={form.thumbnailUrl}
            onChange={handleChange}
            type="url"
            className={inputClass}
            placeholder="https://..."
          />
        </div>

        {/* Sections — only shown in create mode; edit via sections API separately */}
        {!isEditMode && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Sections</h2>
              <button
                type="button"
                onClick={addSection}
                className="text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-1 rounded"
              >
                + Add Section
              </button>
            </div>

            {form.sections.length === 0 && (
              <p className="text-gray-400 text-sm">No sections added yet.</p>
            )}

            {form.sections.map((section, index) => (
              <div
                key={index}
                className="border rounded-md p-4 mb-3 bg-gray-50 shadow-md shadow-blue-500 border-gray-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">
                    Section {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    name="title"
                    value={section.title}
                    onChange={(e) => handleSectionChange(index, e)}
                    type="text"
                    className={inputClass}
                    placeholder="Section Title"
                  />
                  <textarea
                    name="description"
                    value={section.description}
                    onChange={(e) => handleSectionChange(index, e)}
                    className={inputClass}
                    placeholder="Section Description"
                    rows={2}
                  />
                  <input
                    name="videoUrl"
                    value={section.videoUrl}
                    onChange={(e) => handleSectionChange(index, e)}
                    type="url"
                    className={inputClass}
                    placeholder="Section Video URL"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {isEditMode && (
          <p className="text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded p-2">
            Sections are managed separately. Edit section content from the
            course detail page.
          </p>
        )}

        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-md shadow hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Course"
                : "Create Course"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/instructor")}
            className="border border-gray-400 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoursePage;
