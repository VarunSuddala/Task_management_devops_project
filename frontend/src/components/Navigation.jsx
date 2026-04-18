function Navigation({ currentPage, onNavigate, isAuthenticated, onLogout }) {
  return (
    <nav className="navbar">
      <h1>TaskFlow</h1>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <button
              type="button"
              className={currentPage === 'dashboard' ? 'active' : ''}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </button>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={currentPage === 'login' ? 'active' : ''}
              onClick={() => onNavigate('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={currentPage === 'register' ? 'active' : ''}
              onClick={() => onNavigate('register')}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navigation
