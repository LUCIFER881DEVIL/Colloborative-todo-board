const TaskColumn = ({ title, tasks, onDragStart, onDrop, onAddTask, onDeleteTask, onSmartAssign }) => {
  const allowDrop = (e) => {
    e.preventDefault();
  };

  return (
    <div className="task-column" onDragOver={allowDrop} onDrop={onDrop}>
      <h4>{title}</h4>
      <button className="add-task-btn" onClick={() => onAddTask(title)}>+ Add Task</button>
      <div className="task-list">
        {tasks.map((task) => (
          <div
            className="task-card"
            key={task.id}
            draggable
            onDragStart={() => onDragStart(task.id)}
          >
            <h5>{task.title}</h5>
            <p>{task.description}</p>
            <small>Assigned to: {task.assignedTo}</small>
            <button className="delete-btn" onClick={() => onDeleteTask(task.id)}>🗑</button>
            <button className="smart-assign-btn" onClick={() => onSmartAssign(task.id)}>🔀 Smart Assign</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
