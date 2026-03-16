import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import EditProfileForm from "../components/EditProfileForm";
import ChangePasswordForm from "../components/ChangePasswordForm";
import ProfileDisplay from "../components/ProfileDisplay";
import "../styles/ProfilePage.css";

import type { UserProfile } from "../types/user";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);


  const { id: urlId } = useParams<{ id: string }>();

  useEffect(() => {
    fetchProfile();
  }, [urlId]);

  const fetchProfile = async () => {
    if (!urlId) {
      setError("User ID not found in URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/user/profile/${urlId}`);
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!urlId) return;

    try {
      const response = await api.put(`/user/profile/${urlId}`, updatedData);
      setProfile(response.data);
      setEditMode(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error("Error updating profile:", err);
    }
  };

  const handleChangePassword = async (passwordData: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!urlId) return;

    try {
      await api.post(`/user/profile/${urlId}/change-password`, passwordData);
      setChangePasswordMode(false);
      setError(null);
      alert("Password changed successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
      console.error("Error changing password:", err);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loader">Loading your profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="error-message">
          {error || "Unable to load profile"}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="profile-content">
        {!editMode && !changePasswordMode && (
          <>
            <ProfileDisplay profile={profile} />
            <div className="profile-actions">
              <button
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setChangePasswordMode(true)}
              >
                Change Password
              </button>
            </div>
          </>
        )}

        {editMode && (
          <EditProfileForm
            profile={profile}
            onSave={handleUpdateProfile}
            onCancel={() => setEditMode(false)}
          />
        )}

        {changePasswordMode && (
          <ChangePasswordForm
            onSave={handleChangePassword}
            onCancel={() => setChangePasswordMode(false)}
          />
        )}
      </div>
    </div>
  );
}
