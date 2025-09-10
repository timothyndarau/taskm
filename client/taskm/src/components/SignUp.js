import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.css";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form validation
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
    setError("");
    if (!validate()) return;
    setLoading(true);

    try {
      // Signup request
      const res = await fetch("http://localhost:5000/signup", {
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

      // Auto-login request
      const loginRes = await fetch("http://localhost:5000/login", {
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
    <form className={styles.signupForm} onSubmit={handleSubmit} autoComplete="off">
      <h2 className={styles.title}>Sign Up</h2>
      <input
        className={styles.input}
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
        autoFocus
      />
      <input
        className={styles.input}
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        className={styles.input}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <button
        className={styles.submitBtn}
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </form>
  );
}

export default SignUp;
