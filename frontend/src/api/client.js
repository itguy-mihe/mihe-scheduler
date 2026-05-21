import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  logout:   ()               => api.post('/auth/logout'),
  me:       ()               => api.get('/auth/me'),
  register: (data)           => api.post('/auth/register', data),
}

// ── Meetings (admin) ───────────────────────────────────────────────────────
export const meetingsApi = {
  list:     ()           => api.get('/meetings'),
  get:      (id)         => api.get(`/meetings/${id}`),
  create:   (data)       => api.post('/meetings', data),
  finalize: (id, slotId) => api.put(`/meetings/${id}/finalize?slot_id=${slotId}`),
  close:    (id)         => api.put(`/meetings/${id}/close`),
  delete:   (id)         => api.delete(`/meetings/${id}`),
  analytics: ()          => api.get('/meetings/admin/analytics-data'),  // defined before /{id} in router
}

// ── Polls (public) ────────────────────────────────────────────────────────
export const pollsApi = {
  get:     (token)         => api.get(`/polls/${token}`),
  results: (token)         => api.get(`/polls/${token}/results`),
  respond: (token, data)   => api.post(`/polls/${token}/respond`, data),
}
