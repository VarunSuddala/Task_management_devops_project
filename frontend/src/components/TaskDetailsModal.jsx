import { useState, useEffect } from 'react'
import { X, MessageSquare, Calendar, User, Flag, Send, Trash2 } from 'lucide-react'
import { getComments, addComment, deleteComment } from '../services/api'
import { useTasks } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import { getUsers } from '../services/api'

const STATUSES = ['To Do', 'In Progress', 'Done']
const PRIORITIES = ['Low', 'Medium', 'High']

export default function TaskDetailsModal({ task, onClose }) {
  const { user } = useAuth()
  const { updateTask } = useTasks()
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    assignedUser: task.assignedUser?._id || '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getComments(task._id).then(setComments).catch(() => {})
    getUsers().then(setUsers).catch(() => {})
  }, [task._id])

  const handleSave = async (field, value) => {
    setSaving(true)
    try {
      await updateTask(task._id, { [field]: value })
      setForm((f) => ({ ...f, [field]: value }))
    } finally {
      setSaving(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    try {
      const c = await addComment(task._id, commentText.trim())
      setComments((prev) => [...prev, c])
      setCommentText('')
    } catch {}
  }

  const handleDeleteComment = async (id) => {
    try {
      await deleteComment(id)
      setComments((prev) => prev.filter((c) => c._id !== id))
    } catch {}
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{form.title}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-main">
            {/* Title */}
            <div className="modal-field">
              <label>Title</label>
              <input
                className="modal-input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                onBlur={(e) => handleSave('title', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="modal-field">
              <label>Description</label>
              <textarea
                className="modal-textarea"
                value={form.description}
                rows={4}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                onBlur={(e) => handleSave('description', e.target.value)}
                placeholder="Add a description..."
              />
            </div>

            {/* Comments */}
            <div className="modal-field">
              <label><MessageSquare size={14} /> Comments ({comments.length})</label>
              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c._id} className="comment-item">
                    <div className="comment-avatar">{c.user?.name?.slice(0, 2).toUpperCase()}</div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <strong>{c.user?.name}</strong>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="comment-text">{c.text}</p>
                    </div>
                    {c.user?._id === user?.id && (
                      <button className="comment-delete" onClick={() => handleDeleteComment(c._id)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <input
                  className="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button type="submit" className="btn-primary comment-send" disabled={!commentText.trim()}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>

          <div className="modal-sidebar">
            {/* Status */}
            <div className="modal-meta-field">
              <label><Flag size={13} /> Status</label>
              <select className="modal-select" value={form.status} onChange={(e) => handleSave('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="modal-meta-field">
              <label><Flag size={13} /> Priority</label>
              <select className="modal-select" value={form.priority} onChange={(e) => handleSave('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Assignee */}
            <div className="modal-meta-field">
              <label><User size={13} /> Assignee</label>
              <select className="modal-select" value={form.assignedUser} onChange={(e) => handleSave('assignedUser', e.target.value)}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>

            {/* Due Date */}
            <div className="modal-meta-field">
              <label><Calendar size={13} /> Due Date</label>
              <input
                type="date"
                className="modal-input"
                value={form.dueDate}
                onChange={(e) => handleSave('dueDate', e.target.value)}
              />
            </div>

            {/* Reporter */}
            <div className="modal-meta-field">
              <label><User size={13} /> Reporter</label>
              <div className="modal-meta-value">{task.reporter?.name || 'Unknown'}</div>
            </div>

            {saving && <div className="saving-indicator">Saving...</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
