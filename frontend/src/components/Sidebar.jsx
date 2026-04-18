import { useState } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { useProjects } from '../context/ProjectContext'

export default function Sidebar({ currentPage, onNavigate }) {
  const { projects, activeProject, setActiveProject } = useProjects()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [showCreateProject, setShowCreateProject] = useState(false)

  const handleSelectProject = (project) => {
    setActiveProject(project)
    onNavigate('board')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-placeholder" />
        <h2>TaskFlow</h2>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <div className="nav-group">
          <button
            className={`nav-item ${currentPage === 'board' ? 'active' : ''}`}
            onClick={() => setProjectsOpen((o) => !o)}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
            {projectsOpen ? (
              <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
            ) : (
              <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
            )}
          </button>

          {projectsOpen && (
            <div className="nav-subgroup">
              {projects.map((project) => (
                <button
                  key={project._id}
                  className={`nav-subitem ${activeProject?._id === project._id && currentPage === 'board' ? 'active' : ''}`}
                  onClick={() => handleSelectProject(project)}
                >
                  <span className={`dot ${activeProject?._id === project._id && currentPage === 'board' ? 'active-dot' : ''}`} />
                  {project.name}
                </button>
              ))}
              <button
                className="nav-subitem"
                style={{ color: 'var(--accent-blue)' }}
                onClick={() => onNavigate('projects')}
              >
                <Plus size={12} /> New Project
              </button>
            </div>
          )}
        </div>

        <button
          className={`nav-item ${currentPage === 'members' ? 'active' : ''}`}
          onClick={() => onNavigate('members')}
        >
          <Users size={18} />
          <span>Members</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'help' ? 'active' : ''}`}
          onClick={() => onNavigate('help')}
        >
          <HelpCircle size={18} />
          <span>Help</span>
        </button>
      </nav>
    </aside>
  )
}
