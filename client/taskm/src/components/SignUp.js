import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // plain CSS, no modules

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // validation
  const validate = () => {
    if (!username || !email || !password) {
      setError("All fields are required.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Signup failed.");
        setLoading(false);
        return;
      }

      // auto-login
      const loginRes = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const data = await loginRes.json();
        setError(data.message || "Login failed after signup.");
        setLoading(false);
        return;
      }

      const loginData = await loginRes.json();
      localStorage.setItem("authToken", loginData.access_token || loginData.token);
      navigate("/tasks");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <form className="signup-form" onSubmit={handleSubmit} autoComplete="off">
        <h2 className="signup-title">Sign Up</h2>

        <label className="signup-label" htmlFor="username">Username</label>
        <input
          id="username"
          className="signup-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <label className="signup-label" htmlFor="email">Email</label>
        <input
          id="email"
          className="signup-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <label className="signup-label" htmlFor="password">Password</label>
        <input
          id="password"
          className="signup-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button className="signup-submitBtn" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {error && <div className="signup-error">{error}</div>}
      </form>
    </div>
  );
}

export default SignUp;
