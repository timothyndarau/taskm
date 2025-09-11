import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../App.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      const updated = await res.json();
      setProfile(updated);
    } catch (err) {
      setError("Error saving profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setProfile(null);
    navigate("/");
  };

  if (loading) return <p>⏳ Loading profile...</p>;

  return (
    <div className="page-container profile-container">
      <h1>Profile</h1>

      {error && (
        <div className="profile-error" aria-live="polite">
          {error}
        </div>
      )}

      {!loading && !profile && !error && (
        <div>
          <p>You are not signed in.</p>
          <Link to="/signup" className="btn">
            Sign up
          </Link>
          <Link to="/tasks" className="btn secondary" style={{ marginLeft: 8 }}>
            Browse tasks
          </Link>
        </div>
      )}

      {profile && (
        <div className="profile-card">
          <div className="profile-field">
            <strong>Username:</strong>
            <input
              name="username"
              value={profile.username || ""}
              onChange={handleChange}
              className="signup-input"
              style={{ marginLeft: 8 }}
              disabled={saving}
            />
          </div>
          <div className="profile-field">
            <strong>Email:</strong>
            <input
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              className="signup-input"
              style={{ marginLeft: 8 }}
              disabled={saving}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={handleSave} disabled={saving} className="btn">
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn logout" onClick={handleLogout} style={{ marginLeft: 8 }}>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
