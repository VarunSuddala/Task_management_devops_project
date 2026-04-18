import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { MessageSquare, Calendar, MoreHorizontal, Trash2 } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { useState } from 'react'

const COLUMNS = [
  { key: 'To Do', label: 'To Do', colorClass: 'col-todo' },
  { key: 'In Progress', label: 'In Progress', colorClass: 'col-inprogress' },
  { key: 'Done', label: 'Done', colorClass: 'col-review' },
]

function PriorityBadge({ priority }) {
  const cls = `priority-badge priority-${priority?.toLowerCase()}`
  return <span className={cls}>{priority}</span>
}

function TaskCard({ task, index, onOpen, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  const assignee = task.assignedUser
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
          onClick={() => onOpen(task)}
        >
          <div className="card-header">
            <PriorityBadge priority={task.priority} />
            <div className="card-menu-wrap" onClick={(e) => e.stopPropagation()}>
              <button className="col-options" onClick={() => setShowMenu((v) => !v)}>
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <div className="card-dropdown">
                  <button
                    className="card-dropdown-item danger"
                    onClick={() => { setShowMenu(false); onDelete(task._id) }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <h3 className="card-title">{task.title}</h3>
          {task.description && (
            <p className="card-desc">{task.description}</p>
          )}

          <div className="card-footer">
            <div className="card-footer-left">
              {assignee && (
                <div className="assignee-avatar" title={assignee.name}>
                  {assignee.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="card-stats">
              {task.commentCount > 0 && (
                <span className="stat-item">
                  <MessageSquare size={12} /> {task.commentCount}
                </span>
              )}
              {dueDate && (
                <span className={`stat-item ${isOverdue ? 'overdue' : ''}`}>
                  <Calendar size={12} /> {dueDate}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}

export default function KanbanBoard({ onOpenTask }) {
  const { tasks, loadingTasks, updateTask, removeTask } = useTasks()

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return
    if (destination.droppableId === source.droppableId) return

    await updateTask(draggableId, { status: destination.droppableId })
  }

  if (loadingTasks) {
    return (
      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <div key={col.key} className="kanban-column">
            <div className="column-header">
              <div className="col-title">
                <span className={`col-dot ${col.colorClass}`} />
                {col.label}
              </div>
            </div>
            <div className="task-list">
              {[1,2].map(i => <div key={i} className="task-card skeleton"><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key)
          return (
            <div key={col.key} className={`kanban-column ${col.colorClass}`}>
              <div className="column-header">
                <div className="col-title">
                  <span className="col-dot" />
                  {col.label}
                  <span className="col-count">{columnTasks.length}</span>
                </div>
              </div>
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`task-list ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                  >
                    {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="empty-column">Drop tasks here</div>
                    )}
                    {columnTasks.map((task, index) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        index={index}
                        onOpen={onOpenTask}
                        onDelete={removeTask}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
