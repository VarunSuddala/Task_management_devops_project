import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getTasks as apiGetTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../services/api'
import { useProjects } from './ProjectContext'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const { activeProject } = useProjects()
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [filters, setFilters] = useState({ search: '', priority: '', assignedUser: '' })

  const fetchTasks = useCallback(async () => {
    if (!activeProject?._id) { setTasks([]); return }
    setLoadingTasks(true)
    try {
      const params = { projectId: activeProject._id }
      if (filters.priority) params.priority = filters.priority
      if (filters.assignedUser) params.assignedUser = filters.assignedUser
      const data = await apiGetTasks(params)
      setTasks(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to fetch tasks', e)
    } finally {
      setLoadingTasks(false)
    }
  }, [activeProject, filters.priority, filters.assignedUser])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const filteredTasks = tasks.filter((t) => {
    if (!filters.search) return true
    return t.title.toLowerCase().includes(filters.search.toLowerCase())
  })

  const createTask = async (taskData) => {
    const newTask = await apiCreateTask({ ...taskData, projectId: activeProject._id })
    setTasks((prev) => [newTask, ...prev])
    return newTask
  }

  const updateTask = async (id, data) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => t._id === id ? { ...t, ...data } : t))
    try {
      const updated = await apiUpdateTask(id, data)
      setTasks((prev) => prev.map((t) => t._id === id ? updated : t))
      return updated
    } catch (e) {
      // Revert on error
      fetchTasks()
      throw e
    }
  }

  const removeTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t._id !== id))
    try {
      await apiDeleteTask(id)
    } catch (e) {
      fetchTasks()
      throw e
    }
  }

  return (
    <TaskContext.Provider
      value={{
        tasks: filteredTasks,
        allTasks: tasks,
        loadingTasks,
        filters,
        setFilters,
        fetchTasks,
        createTask,
        updateTask,
        removeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = () => {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used inside TaskProvider')
  return ctx
}
