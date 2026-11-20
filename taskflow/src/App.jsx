
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialTasks = [];

const categories = ["Work", "Study", "Personal", "Health", "Other"];

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("taskflow_tasks")) || initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Study",
    priority: "Medium",
    deadline: "",
    duration: "30",
  });

  useEffect(() => {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  const now = new Date();

  const overdue = tasks.filter(t =>
    !t.completed && t.deadline &&
    new Date(t.deadline).getTime() < now.getTime()
  ).length;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;

      const matchesPage =
        page === "Dashboard" || page === "All Tasks"
          ? true
          : page === "Completed"
          ? task.completed
          : page === "Pending"
          ? !task.completed
          : page === "Overdue"
          ? !task.completed && task.deadline && new Date(task.deadline) < new Date()
          : true;

      return matchesSearch && matchesPriority && matchesPage;
    });
  }, [tasks, search, priorityFilter, page]);

  const openAddModal = () => {
    setEditingTask(null);
    setForm({
      title: "",
      description: "",
      category: "Study",
      priority: "Medium",
      deadline: "",
      duration: "30",
    });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      deadline: task.deadline,
      duration: task.duration,
    });
    setShowModal(true);
  };

  const saveTask = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setToast("Please enter a task title");
      return;
    }

    if (form.deadline && new Date(form.deadline) < new Date("2000-01-01")) {
      setToast("Please enter a valid deadline");
      return;
    }

    if (editingTask) {
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id
          ? { ...task, ...form }
          : task
      ));
      setToast("Task updated successfully!");
    } else {
      const newTask = {
        ...form,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date().toISOString(),
      };

      setTasks(prev => [newTask, ...prev]);
      setToast("New task added successfully!");
    }

    setShowModal(false);
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    ));
    setToast("Task status updated!");
  };

  const deleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(prev => prev.filter(task => task.id !== id));
      setToast("Task deleted successfully!");
    }
  };

  const navigation = [
    { name: "Dashboard", icon: "▦" },
    { name: "All Tasks", icon: "☷" },
    { name: "Pending", icon: "◷" },
    { name: "Completed", icon: "✓" },
    { name: "Overdue", icon: "⚠" },
  ];

  const completionRate = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">T</div>
          <span>taskflow<span className="brand-dot">.</span></span>
        </div>

        <p className="side-label">WORKSPACE</p>

        <nav>
          {navigation.map(item => (
            <button
              key={item.name}
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => setPage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === "Pending" && (
                <span className="nav-count">{pending}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">K</div>
            <div>
              <strong>My Workspace</strong>
              <small>Personal account</small>
            </div>
          </div>
          <button className="theme-button" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light Mode" : "☾ Dark Mode"}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / {page}</span>
            <h2>{page}</h2>
          </div>
          <button className="primary-button" onClick={openAddModal}>
            + Create Task
          </button>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR PRODUCTIVITY SPACE</p>
            <h1>Make today <span>count.</span></h1>
            <p>Organize your work, focus on what matters, and make progress every day.</p>
          </div>
          <div className="welcome-icon">✦</div>
        </section>

        <section className="stats-grid">
          <StatCard title="Total Tasks" value={tasks.length} icon="☷" color="purple" />
          <StatCard title="Completed" value={completed} icon="✓" color="green" />
          <StatCard title="Pending" value={pending} icon="◷" color="orange" />
          <StatCard title="Overdue" value={overdue} icon="!" color="red" />
        </section>

        <section className="progress-section">
          <div className="section-heading">
            <div>
              <h3>Your overall progress</h3>
              <p>Every completed task brings you closer to your goals.</p>
            </div>
            <strong className="progress-number">{completionRate}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </section>

        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <h3>{page === "Dashboard" ? "Your Tasks" : page}</h3>
              <p>Stay on top of everything that needs to get done.</p>
            </div>
            <button className="text-button" onClick={() => setPage("All Tasks")}>
              View all →
            </button>
          </div>

          <div className="toolbar">
            <input
              type="search"
              placeholder="⌕  Search your tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="All">All priorities</option>
              <option value="High">High priority</option>
              <option value="Medium">Medium priority</option>
              <option value="Low">Low priority</option>
            </select>
            <button className="clear-button" onClick={() => {
              setSearch("");
              setPriorityFilter("All");
            }}>
              Clear
            </button>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✧</div>
                <h3>No tasks found</h3>
                <p>Create a task or change your search filters to get started.</p>
                <button className="primary-button" onClick={openAddModal}>
                  + Add your first task
                </button>
              </div>
            ) : (
              filteredTasks.map(task => (
                <article className={`task-card ${task.completed ? "is-completed" : ""}`} key={task.id}>
                  <button
                    className={`check-button ${task.completed ? "checked" : ""}`}
                    onClick={() => toggleTask(task.id)}
                    aria-label="Toggle completion"
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  <div className="task-info">
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                    <div className="task-meta">
                      <span className="category-tag">{task.category}</span>
                      {task.deadline && (
                        <span>◷ {new Date(task.deadline).toLocaleString()}</span>
                      )}
                      <span>{task.duration} min</span>
                    </div>
                  </div>

                  <span className={`priority ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>

                  <div className="task-actions">
                    <button title="Edit task" onClick={() => openEditModal(task)}>✎</button>
                    <button title="Delete task" onClick={() => deleteTask(task.id)}>⌫</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form className="task-modal" onSubmit={saveTask} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">TASK MANAGEMENT</span>
                <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>
              </div>
              <button type="button" className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>

            <label>Task title *</label>
            <input
              required
              maxLength={100}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <label>Description</label>
            <textarea
              rows="3"
              placeholder="Add some details..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />

            <div className="form-row">
              <div>
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Deadline</label>
                <input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div>
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button">
                {editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

export default App;
