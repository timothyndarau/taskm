import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setTaskCount(Array.isArray(data) ? data.length : 0);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="page-container">
      <h1>Welcome to Task M</h1>
      <p>
        Manage your tasks efficiently with light, dark, and colorful themes.
        Use the Tasks page to view, add and update tasks.
      </p>

      <div className="home-actions">
        <Link to="/tasks" className="btn">
          Go to Tasks
        </Link>
        <Link to="/profile" className="btn secondary">
          View Profile
        </Link>
      </div>

      {loading ? (
        <p>Loading task count...</p>
      ) : (
        <h3>📊 You have {taskCount} tasks</h3>
      )}

      <section className="home-features">
        <h3>Quick tips</h3>
        <ul>
          <li>Switch themes using the icon in the navbar.</li>
          <li>Sign up to save tasks to your account.</li>
          <li>Use the Tasks page for editing and deleting items.</li>
        </ul>
      </section>
    </div>
  );
}
