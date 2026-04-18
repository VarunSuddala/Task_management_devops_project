import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getProjects as apiGetProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
  addProjectMember as apiAddMember,
} from '../services/api'
import { useAuth } from './AuthContext'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [loadingProjects, setLoadingProjects] = useState(false)

  const fetchProjects = useCallback(async () => {
    if (!user) return
    setLoadingProjects(true)
    try {
      const data = await apiGetProjects()
      setProjects(data)
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0])
      }
    } catch (e) {
      console.error('Failed to fetch projects', e)
    } finally {
      setLoadingProjects(false)
    }
  }, [user])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = async (projectData) => {
    const project = await apiCreateProject(projectData)
    setProjects((prev) => [project, ...prev])
    setActiveProject(project)
    return project
  }

  const updateProject = async (id, data) => {
    const updated = await apiUpdateProject(id, data)
    setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)))
    if (activeProject?._id === id) setActiveProject(updated)
    return updated
  }

  const removeProject = async (id) => {
    await apiDeleteProject(id)
    setProjects((prev) => {
      const next = prev.filter((p) => p._id !== id)
      if (activeProject?._id === id) setActiveProject(next[0] || null)
      return next
    })
  }

  const addMember = async (projectId, userId) => {
    const updated = await apiAddMember(projectId, userId)
    setProjects((prev) => prev.map((p) => (p._id === projectId ? updated : p)))
    if (activeProject?._id === projectId) setActiveProject(updated)
    return updated
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        loadingProjects,
        fetchProjects,
        createProject,
        updateProject,
        removeProject,
        addMember,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects must be used inside ProjectProvider')
  return ctx
}
