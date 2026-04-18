import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProjectProvider } from './context/ProjectContext'
import { TaskProvider } from './context/TaskContext'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DashboardPage from './components/DashboardPage'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ProjectsPage from './components/ProjectsPage'

function AppShell() {
  const { user, loading } = useAuth()
  const [authPage, setAuthPage] = useState('login')
  const [currentPage, setCurrentPage] = useState('dashboard')

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--main-bg)' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!user) {
    return authPage === 'login'
      ? <LoginPage onGoRegister={() => setAuthPage('register')} />
      : <RegisterPage onGoLogin={() => setAuthPage('login')} />
  }

  return (
    <ProjectProvider>
      <TaskProvider>
        <div className="app">
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="main-wrapper">
            <Header />
            <div className="content">
              {currentPage === 'dashboard' && <AnalyticsDashboard />}
              {currentPage === 'board' && <DashboardPage />}
              {currentPage === 'projects' && (
                <ProjectsPage onNavigateToBoard={() => setCurrentPage('board')} />
              )}
              {!['dashboard', 'board', 'projects'].includes(currentPage) && (
                <div className="placeholder-page">
                  <h2>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h2>
                  <p>This section is coming soon.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </TaskProvider>
    </ProjectProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
