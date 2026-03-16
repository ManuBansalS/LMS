import type { UserProfile } from "../types/user";
import "../styles/ProfileDisplay.css";

interface ProfileDisplayProps {
  profile: UserProfile;
}

export default function ProfileDisplay({ profile }: ProfileDisplayProps) {
  const getFullName = () => {
    return `${profile.firstname} ${profile.lastname}`.trim() || "Not provided";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="profile-display">
      <div className="profile-card">
        <div className="profile-header-section">
          <div className="profile-avatar">
            {profile.firstname.charAt(0).toUpperCase()}
            {profile.lastname.charAt(0).toUpperCase()}
          </div>
          <div className="profile-basic-info">
            <h2>{getFullName()}</h2>
            <p className="username">@{profile.username}</p>
            <p className="role">{profile.role}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Contact Information</h3>
            <div className="detail-item">
              <label>Email:</label>
              <span>{profile.email}</span>
            </div>
            {profile.email_verified && (
              <div className="verified-badge">✓ Verified</div>
            )}
          </div>

          <div className="detail-section">
            <h3>Organization</h3>
            <div className="detail-item">
              <label>Organization:</label>
              <span>{profile.current_organisation || "Not provided"}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Bio</h3>
            <div className="detail-item bio-item">
              <span>{profile.bio || "No bio provided"}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Account Information</h3>
            <div className="detail-item">
              <label>Status:</label>
              <span className={profile.is_active ? "active" : "inactive"}>
                {profile.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="detail-item">
              <label>Member Since:</label>
              <span>{formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
