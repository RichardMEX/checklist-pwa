import axios from 'axios';

// URL base - Ajustada para tu configuración actual
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? ''  // En producción usa la misma URL del servidor
  : 'http://localhost:5000';  // En desarrollo

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para debug
api.interceptors.request.use(
  (config) => {
    // Añadir token si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = token;
    }
    
    console.log(`🚀 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    // Si es error 401 (no autorizado), limpiar token
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Servicios unificados
export const apiService = {
  // Auth
  login: (username, password) => api.post('/api/auth/login', { username, password }),
  getMe: () => api.get('/api/auth/me'),
  
  // Checklists
  getAllChecklists: () => api.get('/api/checklists'),
  getChecklistById: (id) => api.get(`/api/checklists/${id}`),
  createChecklist: (data) => api.post('/api/checklists', data),
  updateChecklist: (id, data) => api.put(`/api/checklists/${id}`, data),
  deleteChecklist: (id) => api.delete(`/api/checklists/${id}`),
  
  // Áreas
  getAreas: () => api.get('/api/areas'),
  createArea: (data) => api.post('/api/areas', data),
  updateArea: (id, data) => api.put(`/api/areas/${id}`, data),
  deleteArea: (id) => api.delete(`/api/areas/${id}`),
  
  // Proyectos
  getProjects: () => api.get('/api/projects'),
  createProject: (data) => api.post('/api/projects', data),
  updateProject: (id, data) => api.put(`/api/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/api/projects/${id}`),
  
  // Usuarios
  getUsers: () => api.get('/api/users'),
  getUserById: (id) => api.get(`/api/users/${id}`),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  
  // Supervisores
  getSupervisorOperators: (supervisorId) => api.get(`/api/supervisors/${supervisorId}/operators`),
  getAvailableOperators: (supervisorId) => api.get(`/api/supervisors/${supervisorId}/available-operators`),
  assignOperators: (supervisorId, operatorIds) => api.post(`/api/supervisors/${supervisorId}/operators`, { operatorIds }),
  
  // Reportes
  getWeeklyReports: () => api.get('/api/reports/weekly'),
  getMonthlyReports: () => api.get('/api/reports/monthly'),
  getAnnualReports: () => api.get('/api/reports/annual'),
  
  // Health check
  getHealth: () => api.get('/api/health'),
  getDbStatus: () => api.get('/api/db-status'),
  getTestData: () => api.get('/api/test-data'),
};

// Exportación por defecto para compatibilidad
export default apiService;