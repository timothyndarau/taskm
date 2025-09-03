import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./SignUp";
import Login from "./Login";

function App() {
  const [theme, setTheme] = useState("light"); // light, dark, colored

  const toggleTheme = (mode) => setTheme(mode);

  return (
    <div className={`app ${theme}`}>
      <Router>
        <nav>
          <Link to="/signup">Sign Up</Link> | <Link to="/login">Login</Link>
          <button onClick={() => toggleTheme("light")}>Light</button>
          <button onClick={() => toggleTheme("dark")}>Dark</button>
          <button onClick={() => toggleTheme("colored")}>Color</button>
        </nav>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
