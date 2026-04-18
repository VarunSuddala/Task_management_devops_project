import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'jira_token'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
export const getToken = () => localStorage.getItem(TOKEN_KEY)

// Auth
export const login = async (data) => {
  const res = await api.post('/auth/login', data)
  if (res.data?.token) setToken(res.data.token)
  return res.data
}
export const register = async (data) => {
  const res = await api.post('/auth/register', data)
  if (res.data?.token) setToken(res.data.token)
  return res.data
}

// Users
export const getUsers = () => api.get('/users').then(r => r.data)
export const getMe = () => api.get('/users/me').then(r => r.data)

// Projects
export const getProjects = () => api.get('/projects').then(r => r.data)
export const getProject = (id) => api.get(`/projects/${id}`).then(r => r.data)
export const createProject = (data) => api.post('/projects', data).then(r => r.data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then(r => r.data)
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(r => r.data)
export const addProjectMember = (id, userId) => api.post(`/projects/${id}/members`, { userId }).then(r => r.data)

// Tasks
export const getTasks = (params) => api.get('/tasks', { params }).then(r => r.data)
export const createTask = (data) => api.post('/tasks', data).then(r => r.data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data).then(r => r.data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then(r => r.data)

// Comments
export const getComments = (taskId) => api.get(`/comments/task/${taskId}`).then(r => r.data)
export const addComment = (taskId, text) => api.post(`/comments/task/${taskId}`, { text }).then(r => r.data)
export const deleteComment = (id) => api.delete(`/comments/${id}`).then(r => r.data)

export default api
