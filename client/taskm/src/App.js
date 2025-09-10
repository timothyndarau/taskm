import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import TaskApp from "./components/TaskApp";
import Navbar from "./components/Navbar"; // ✅ import Navbar

// Simple private route
function PrivateRoute({ children }) {
  const token = localStorage.getItem("access_token"); // check if user is logged in
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <div>
        <Navbar /> {/* ✅ Navbar is always visible */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TaskApp />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}
