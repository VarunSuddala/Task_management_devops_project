import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { useProjects } from '../context/ProjectContext'
import { getUsers } from '../services/api'

const PRIORITIES = ['Low', 'Medium', 'High']
const STATUSES = ['To Do', 'In Progress', 'Done']

export default function TaskForm({ onClose }) {
  const { createTask } = useTasks()
  const { activeProject } = useProjects()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
    assignedUser: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {})
  }, [])

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setError('')
    setSubmitting(true)
    try {
      await createTask({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || undefined,
        assignedUser: form.assignedUser || undefined,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="task-form-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-form-header">
          <h3>Create Task</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="task-form-inner">
          <label htmlFor="tf-title">Title *</label>
          <input
            id="tf-title"
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            required
          />

          <label htmlFor="tf-desc">Description</label>
          <textarea
            id="tf-desc"
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Optional description..."
          />

          <div className="form-row">
            <div className="form-col">
              <label htmlFor="tf-priority">Priority</label>
              <select id="tf-priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-col">
              <label htmlFor="tf-status">Status</label>
              <select id="tf-status" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label htmlFor="tf-assignee">Assignee</label>
              <select id="tf-assignee" value={form.assignedUser} onChange={(e) => set('assignedUser', e.target.value)}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-col">
              <label htmlFor="tf-duedate">Due Date</label>
              <input
                id="tf-duedate"
                type="date"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
            <Plus size={16} /> {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  )
}
