import React, { useState, useEffect } from "react";
import styles from "../App.css";

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
    <nav className={styles.navbar}>
      <div className={styles.logo}>DidgiTasks</div>
      <ul className={styles.links}>
        <li>Home</li>
        <li>Tasks</li>
        <li>Profile</li>
      </ul>
      <div className={styles.actions}>
        <button onClick={toggleTheme} className={styles.themeToggle}>
          {theme === "light" ? "🌞" : theme === "dark" ? "🌙" : "🎨"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
