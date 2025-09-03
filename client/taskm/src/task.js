import React, { useState, useEffect } from "react";


export default function TaskApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  const addTask = () => {
    if (!newTask) return;
    fetch("http://127.0.0.1:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask, due_date: dueDate, priority }),
    })
      .then((res) => res.json())
      .then((task) => setTasks([...tasks, task]));

    setNewTask("");
    setDueDate("");
    setPriority("Medium");
  };

  const toggleTask = (id, completed) => {
    fetch(`http://127.0.0.1:5000/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    })
      .then((res) => res.json())
      .then((updated) =>
        setTasks(tasks.map((t) => (t.id === id ? updated : t)))
      );
  };

  const saveEdit = (id) => {
    fetch(`http://127.0.0.1:5000/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTasks(tasks.map((t) => (t.id === id ? updated : t)));
        setEditingTask(null);
        setEditTitle("");
      });
  };

  const deleteTask = (id) => {
    fetch(`http://127.0.0.1:5000/tasks/${id}`, { method: "DELETE" })
      .then(() => setTasks(tasks.filter((t) => t.id !== id)));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    if (filter === "High") return task.priority === "High";
    return true;
  });

  return (
    <div className="task-container">
      <h2>Task Manager</h2>

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
                <button
                  className="edit-btn"
                  onClick={() => saveEdit(task.id)}
                >
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
            <button
              className="delete-btn"
              onClick={() => deleteTask(task.id)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
