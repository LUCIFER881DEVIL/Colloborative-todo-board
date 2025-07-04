import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskColumn from "../components/TaskColumn";
import "../styles/dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Setup backend",
      description: "Initialize Express server",
      status: "Todo",
      assignedTo: "Yash",
      lastUpdated: Date.now(),
    },
    {
      id: 2,
      title: "Design Login UI",
      description: "Build login form",
      status: "In Progress",
      assignedTo: "Raj",
      lastUpdated: Date.now(),
    },
    {
      id: 3,
      title: "Activity Logger",
      description: "Create logging API",
      status: "Done",
      assignedTo: "Priya",
      lastUpdated: Date.now(),
    },
  ]);

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [conflictData, setConflictData] = useState(null);

  const getTaskById = (id) => tasks.find((t) => t.id === id);

  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };
   const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  const handleDrop = (newStatus) => {
    const task = getTaskById(draggedTaskId);
    if (!task || task.status === newStatus) return;

    const updatedTask = {
      ...task,
      status: newStatus,
      lastUpdated: Date.now(),
    };

    updateTask(updatedTask);
    setDraggedTaskId(null);
  };

  const updateTask = (updatedTask) => {
    const current = getTaskById(updatedTask.id);

    if (current.lastUpdated !== updatedTask.lastUpdated) {
      setConflictData({
        local: updatedTask,
        remote: current,
      });
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );

    setActivityLogs((logs) => [
      {
        message: `Task "${updatedTask.title}" moved to ${updatedTask.status}`,
        user: updatedTask.assignedTo || "Unknown",
        timestamp: new Date().toLocaleString(),
      },
      ...logs.slice(0, 19),
    ]);
  };

  const handleMerge = () => {
  const merged = {
    ...conflictData.remote,
    description: `${conflictData.remote.description}\n---\n${conflictData.local.description}`,
    lastUpdated: Date.now(),
  };

  updateTask(merged);

  setActivityLogs((logs) => [
    {
      message: `Conflict resolved via merge on task "${merged.title}"`,
      user: "You",
      timestamp: new Date().toLocaleString(),
    },
    ...logs.slice(0, 19),
  ]);

  setConflictData(null);
};


  const handleOverwrite = () => {
    const overwritten = {
      ...conflictData.local,
      lastUpdated: Date.now(),
    };

    updateTask(overwritten);
    setConflictData(null);
  };

  const handleAddTask = (status) => {
    const title = prompt("Enter task title:");
    if (!title) return;
    // ✅ Validation: title should not match column names
  if (["Todo", "In Progress", "Done"].includes(title.trim())) {
    alert("Task title cannot match column name.");
    return;
  }

    const description = prompt("Enter description:") || "";
    const assignedTo = prompt("Assign to (name):") || "Unassigned";

    const newTask = {
      id: Date.now(),
      title,
      description,
      status,
      assignedTo,
      lastUpdated: Date.now(),
    };

    setTasks((prev) => [...prev, newTask]);

    setActivityLogs((logs) => [
      {
        message: `Task "${title}" created in ${status}`,
        user: assignedTo,
        timestamp: new Date().toLocaleString(),
      },
      ...logs.slice(0, 19),
    ]);
  };

  const handleDeleteTask = (id) => {
    const task = getTaskById(id);
    if (!task) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));

    setActivityLogs((logs) => [
      {
        message: `Task "${task.title}" deleted from ${task.status}`,
        user: task.assignedTo || "Unknown",
        timestamp: new Date().toLocaleString(),
      },
      ...logs.slice(0, 19),
    ]);
  };

  const handleSmartAssign = (taskId) => {
    const activeTasks = tasks.filter((task) => task.status !== "Done");

    const userTaskCounts = {};
    activeTasks.forEach((task) => {
      if (task.assignedTo) {
        userTaskCounts[task.assignedTo] = (userTaskCounts[task.assignedTo] || 0) + 1;
      }
    });

    const users = [...new Set(tasks.map((t) => t.assignedTo).filter(Boolean))];
    if (users.length === 0) {
      alert("No users available to assign.");
      return;
    }

    let minUser = users[0];
    let minCount = userTaskCounts[minUser] || 0;

    users.forEach((user) => {
      const count = userTaskCounts[user] || 0;
      if (count < minCount) {
        minCount = count;
        minUser = user;
      }
    });

    const task = getTaskById(taskId);
    const updatedTask = {
      ...task,
      assignedTo: minUser,
      lastUpdated: Date.now(),
    };

    updateTask(updatedTask);

    setActivityLogs((logs) => [
      {
        message: `Smart Assigned "${task.title}" to ${minUser}`,
        user: "System",
        timestamp: new Date().toLocaleString(),
      },
      ...logs.slice(0, 19),
    ]);
  };

  const todo = tasks.filter((task) => task.status === "Todo");
  const inProgress = tasks.filter((task) => task.status === "In Progress");
  const done = tasks.filter((task) => task.status === "Done");

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>Collaborative To-Do Board</h2>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboard-content">
        <div className="kanban-board">
          <div className="task-columns">
            <TaskColumn
              title="Todo"
              tasks={todo}
              onDragStart={handleDragStart}
              onDrop={() => handleDrop("Todo")}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onSmartAssign={handleSmartAssign}
            />
            <TaskColumn
              title="In Progress"
              tasks={inProgress}
              onDragStart={handleDragStart}
              onDrop={() => handleDrop("In Progress")}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onSmartAssign={handleSmartAssign}
            />
            <TaskColumn
              title="Done"
              tasks={done}
              onDragStart={handleDragStart}
              onDrop={() => handleDrop("Done")}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onSmartAssign={handleSmartAssign}
            />
          </div>
        </div>

        <div className="activity-panel">
          <h3>Activity Log</h3>
          <ul className="activity-log">
            {activityLogs.map((log, index) => (
              <li key={index}>
                <p>{log.message}</p>
                <small>{log.user} • {log.timestamp}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Conflict Modal */}
      {conflictData && (
        <div className="conflict-modal">
          <div className="conflict-box">
            <h2>⚠️ Conflict Detected</h2>
            <p>Someone else updated this task. What do you want to do?</p>

            <div className="conflict-data">
              <div>
                <h4>Your Version</h4>
                <pre>{JSON.stringify(conflictData.local, null, 2)}</pre>
              </div>
              <div>
                <h4>Latest Version</h4>
                <pre>{JSON.stringify(conflictData.remote, null, 2)}</pre>
              </div>
            </div>

            <div className="conflict-buttons">
              <button onClick={handleMerge}>🔀 Merge</button>
              <button onClick={handleOverwrite}>⚡ Overwrite</button>
              <button onClick={() => setConflictData(null)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
