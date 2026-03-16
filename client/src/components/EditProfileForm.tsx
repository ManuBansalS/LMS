import { useState } from "react";
import type { UserProfile } from "../types/user";
import "../styles/EditProfileForm.css";

interface EditProfileFormProps {
  profile: UserProfile;
  onSave: (updatedData: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}

export default function EditProfileForm({
  profile,
  onSave,
  onCancel,
}: EditProfileFormProps) {
  const [formData, setFormData] = useState({
    firstname: profile.firstname || "",
    lastname: profile.lastname || "",
    email: profile.email || "",
    username: profile.username || "",
    current_organisation: profile.current_organisation || "",
    bio: profile.bio || "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-form">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.firstname && (
              <span className="error-text">{errors.firstname}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.lastname && (
              <span className="error-text">{errors.lastname}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.username && (
            <span className="error-text">{errors.username}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && (
            <span className="error-text">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="current_organisation">Organization</label>
          <input
            type="text"
            id="current_organisation"
            name="current_organisation"
            value={formData.current_organisation}
            onChange={handleChange}
            disabled={loading}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            disabled={loading}
            rows={4}
            placeholder="Tell us about yourself"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
