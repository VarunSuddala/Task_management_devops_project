import { useTasks } from '../context/TaskContext'
import { useProjects } from '../context/ProjectContext'
import { CheckCircle2, Circle, AlertCircle, BarChart2 } from 'lucide-react'

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  )
}

function ProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="progress-row">
      <div className="progress-label">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const { allTasks } = useTasks()
  const { projects, activeProject } = useProjects()

  const total = allTasks.length
  const done = allTasks.filter((t) => t.status === 'Done').length
  const inProgress = allTasks.filter((t) => t.status === 'In Progress').length
  const todo = allTasks.filter((t) => t.status === 'To Do').length
  const high = allTasks.filter((t) => t.priority === 'High').length
  const medium = allTasks.filter((t) => t.priority === 'Medium').length
  const low = allTasks.filter((t) => t.priority === 'Low').length

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="project-title-row">
          <h1>Dashboard</h1>
        </div>
        {activeProject && (
          <div className="breadcrumbs">Active project: {activeProject.name}</div>
        )}
      </div>

      <div className="stats-grid">
        <StatCard icon={<BarChart2 size={24} />} label="Total Tasks" value={total} color="var(--accent-blue)" />
        <StatCard icon={<CheckCircle2 size={24} />} label="Completed" value={done} color="var(--low-priority)" />
        <StatCard icon={<Circle size={24} />} label="In Progress" value={inProgress} color="var(--medium-priority)" />
        <StatCard icon={<AlertCircle size={24} />} label="To Do" value={todo} color="var(--col-todo)" />
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Status Breakdown</h3>
          <ProgressBar label="Done" value={done} max={total} color="var(--low-priority)" />
          <ProgressBar label="In Progress" value={inProgress} max={total} color="var(--medium-priority)" />
          <ProgressBar label="To Do" value={todo} max={total} color="var(--col-todo)" />
        </div>

        <div className="analytics-card">
          <h3>Priority Breakdown</h3>
          <ProgressBar label="High" value={high} max={total} color="var(--high-priority)" />
          <ProgressBar label="Medium" value={medium} max={total} color="var(--medium-priority)" />
          <ProgressBar label="Low" value={low} max={total} color="var(--low-priority)" />
        </div>

        <div className="analytics-card">
          <h3>Projects ({projects.length})</h3>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No projects yet.</p>
          ) : (
            projects.map((p) => (
              <div key={p._id} className="progress-row">
                <div className="progress-label">
                  <span>{p.name}</span>
                  <span>{p.members?.length} members</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
