import { useState } from 'react'
import { Plus, Filter, LayoutGrid } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import TaskForm from './TaskForm'
import TaskDetailsModal from './TaskDetailsModal'
import { useTasks } from '../context/TaskContext'
import { useProjects } from '../context/ProjectContext'
import { getUsers } from '../services/api'
import { useEffect } from 'react'

const PRIORITIES = ['', 'Low', 'Medium', 'High']

export default function DashboardPage() {
  const { activeProject } = useProjects()
  const { filters, setFilters, tasks } = useTasks()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {})
  }, [])

  if (!activeProject) {
    return (
      <div className="empty-state-full">
        <LayoutGrid size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
        <h2>No Project Selected</h2>
        <p>Create or select a project from the sidebar to get started.</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="breadcrumbs">Projects / {activeProject.name}</div>
        <div className="project-title-row">
          <h1>{activeProject.name}</h1>
        </div>
        {activeProject.description && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', marginTop: '-16px' }}>
            {activeProject.description}
          </p>
        )}

        <div className="view-tabs-row">
          <div className="filter-bar">
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              className="filter-select"
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="">All Priority</option>
              {PRIORITIES.filter(Boolean).map((p) => <option key={p}>{p}</option>)}
            </select>
            <select
              className="filter-select"
              value={filters.assignedUser}
              onChange={(e) => setFilters((f) => ({ ...f, assignedUser: e.target.value }))}
            >
              <option value="">All Assignees</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={() => setShowTaskForm(true)}>
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      <KanbanBoard onOpenTask={setSelectedTask} />

      {showTaskForm && <TaskForm onClose={() => setShowTaskForm(false)} />}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
