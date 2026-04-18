import { useState } from 'react'
import { Plus, Folder, Trash2, Users, X } from 'lucide-react'
import { useProjects } from '../context/ProjectContext'
import { getUsers } from '../services/api'
import { useEffect } from 'react'

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      await onCreate({ name: name.trim(), description: description.trim() })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Project</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
          <label htmlFor="proj-name">Project Name *</label>
          <input id="proj-name" className="modal-input" type="text" value={name}
            onChange={(e) => setName(e.target.value)} placeholder="My Awesome Project" autoFocus required />
          <label htmlFor="proj-desc">Description</label>
          <textarea id="proj-desc" className="modal-textarea" rows={3} value={description}
            onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" />
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
            <Plus size={16} /> {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage({ onNavigateToBoard }) {
  const { projects, createProject, removeProject, setActiveProject, addMember } = useProjects()
  const [showCreate, setShowCreate] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {})
  }, [])

  const handleOpenBoard = (project) => {
    setActiveProject(project)
    onNavigateToBoard()
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="project-title-row">
          <h1>Projects</h1>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state-full">
          <Folder size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h2>No Projects Yet</h2>
          <p>Create your first project to get started.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ marginTop: '16px' }}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card" onClick={() => handleOpenBoard(project)}>
              <div className="project-card-icon">
                <Folder size={24} />
              </div>
              <div className="project-card-body">
                <h3>{project.name}</h3>
                <p>{project.description || 'No description'}</p>
                <div className="project-card-meta">
                  <span><Users size={12} /> {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <button
                className="project-card-delete"
                title="Delete project"
                onClick={(e) => { e.stopPropagation(); if (confirm('Delete this project?')) removeProject(project._id) }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={createProject} />
      )}
    </div>
  )
}
