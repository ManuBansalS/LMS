import { useState } from "react";
import "../styles/ChangePasswordForm.css";

interface ChangePasswordFormProps {
  onSave: (passwordData: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function ChangePasswordForm({
  onSave,
  onCancel,
}: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
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
      // Reset form after successful change
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="change-password-form">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group password-group">
          <label htmlFor="oldPassword">Current Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.old ? "text" : "password"}
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility("old")}
              disabled={loading}
            >
              {showPasswords.old ? "Hide" : "Show"}
            </button>
          </div>
          {errors.oldPassword && (
            <span className="error-text">{errors.oldPassword}</span>
          )}
        </div>

        <div className="form-group password-group">
          <label htmlFor="newPassword">New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.new ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility("new")}
              disabled={loading}
            >
              {showPasswords.new ? "Hide" : "Show"}
            </button>
          </div>
          {errors.newPassword && (
            <span className="error-text">{errors.newPassword}</span>
          )}
        </div>

        <div className="form-group password-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility("confirm")}
              disabled={loading}
            >
              {showPasswords.confirm ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword}</span>
          )}
        </div>

        <div className="form-info">
          <p>Password must be at least 6 characters long</p>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
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
