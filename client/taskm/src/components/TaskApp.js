import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../fetchWithAuth";

export default function TaskApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState("All");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );
  const navigate = useNavigate();

  // 🔹 Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false); // optional: update state
    navigate("/login");
  };

  useEffect(() => {
    if (isLoggedIn) loadTasks();
  }, [isLoggedIn]);

  const loadTasks = async () => {
    try {
      const res = await fetchWithAuth("/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        // Log error details for debugging
        const errorText = await res.text();
        console.error("Failed to load tasks:", res.status, errorText);
        alert(`Failed to load tasks: ${res.status} ${errorText}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error: " + err.message);
    }
  };

  const signup = async () => {
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (res.ok) alert("Signup successful! Please log in.");
    else alert("Signup failed: Email may already exist.");
  };

  const login = async () => {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setIsLoggedIn(true);
    } else alert("Login failed. Check credentials.");
  };

const addTask = async () => {
  if (!newTask) return;
  const res = await fetchWithAuth("/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: newTask,
      due_date: dueDate || null,
      priority, completed: false
    }),
  });
  if (res.ok) {
    const task = await res.json();
    setTasks([...tasks, task]);
    setNewTask("");
    setDueDate("");
    setPriority("Medium");
  }
};

  const toggleTask = async (id, completed) => {
    const res = await fetchWithAuth(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    }
  };

  const saveEdit = async (id) => {
    const res = await fetchWithAuth(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title: editTitle }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
      setEditingTask(null);
      setEditTitle("");
    }
  };

  const deleteTask = async (id) => {
    const res = await fetchWithAuth(`/tasks/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setTasks(tasks.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    if (filter === "High") return task.priority === "High";
    return true;
  });

  if (!isLoggedIn)
    return (
      <div className="auth-container">
        <h2>Task Manager Login / Signup</h2>
        <input
          placeholder="Username (signup)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={signup}>Sign Up</button>
        <button onClick={login}>Log In</button>
      </div>
    );

  return (
    <div className="task-container">
      <h2>Task M</h2>
      {/* 🔹 Logout button */}
      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      <input
        className="task-input"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New task"
      />
      <input
        className="task-date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <select
        className="task-priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <button className="task-button" onClick={addTask}>
        Add Task
      </button>

      <div className="filter-bar">
        <button onClick={() => setFilter("All")}>All</button>
        <button onClick={() => setFilter("Completed")}>Completed</button>
        <button onClick={() => setFilter("Pending")}>Pending</button>
        <button onClick={() => setFilter("High")}>High Priority</button>
      </div>

      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id, task.completed)}
            />
            {editingTask === task.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <button className="edit-btn" onClick={() => saveEdit(task.id)}>
                  Save
                </button>
              </>
            ) : (
              <>
                {task.title} - <i>{task.due_date || "No due date"}</i> -{" "}
                <b>{task.priority}</b>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingTask(task.id);
                    setEditTitle(task.title);
                  }}
                >
                  Edit
                </button>
              </>
            )}
            <button className="delete-btn" onClick={() => deleteTask(task.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
