import { useState } from 'react'
import { Search, Bell, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TaskContext'

export default function Header() {
  const { user, logout } = useAuth()
  const { filters, setFilters } = useTasks()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header className="top-header">
      <div className="search-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search tasks by title..."
          className="search-input"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
      </div>

      <div className="header-actions">
        <button className="icon-btn notification-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="user-profile" onClick={() => setShowUserMenu((v) => !v)}>
          <div className="user-avatar-initials">{initials}</div>
          <span className="user-name">{user?.name || 'User'}</span>
          <ChevronDown size={14} />

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-email">{user?.email}</div>
              <div className="user-dropdown-divider" />
              <button
                className="user-dropdown-item danger"
                onClick={(e) => { e.stopPropagation(); logout() }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
