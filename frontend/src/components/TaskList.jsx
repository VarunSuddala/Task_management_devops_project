function TaskList({ tasks, onDelete, onComplete }) {
  if (tasks.length === 0) {
    return <div className="empty-state">No tasks available</div>
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const taskId = task.id ?? task._id
        const statusText = task.status || 'Pending'
        const isCompleted = String(statusText).toLowerCase() === 'completed'

        return (
          <div key={taskId} className="task-card">
            <div className="task-card-top">
              <h3>{task.title}</h3>
              <span className={`status-badge ${isCompleted ? 'done' : 'todo'}`}>
                {statusText}
              </span>
            </div>
            <p>{task.description || 'No description added.'}</p>
            {task.dueDate ? (
              <p className="muted">Due: {task.dueDate.slice(0, 10)}</p>
            ) : null}
          <div className="task-actions">
            <button type="button" disabled>
              Edit
            </button>
            <button type="button" onClick={() => onDelete(taskId)}>
              Delete
            </button>
            <button
              type="button"
              onClick={() => onComplete(taskId)}
              disabled={isCompleted}
            >
              Complete
            </button>
          </div>
        </div>
        )
      })}
    </div>
  )
}

export default TaskList
