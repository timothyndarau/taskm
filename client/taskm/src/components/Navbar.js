import React, { useState, useEffect } from "react";
import "../App.css"; 
import { Link } from "react-router-dom";

const Navbar = () => {
  const themes = ["light", "dark", "colorful"];
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <nav className="navbar">
      <div className="logo">DidgiTasks</div>
      <ul className="links">
  <li><Link to="/">Home</Link></li>
  <li><Link to="/tasks">Tasks</Link></li>
  <li><Link to="/profile">Profile</Link></li>
</ul>
      <div className="actions">
        <button onClick={toggleTheme} className="themeToggle">
          {theme === "light" ? "🌞" : theme === "dark" ? "🌙" : "🎨"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
