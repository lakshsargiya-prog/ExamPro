const rawEnvUrl = import.meta.env.VITE_API_BASE_URL;

function resolveApiBaseUrl() {
  if (rawEnvUrl && rawEnvUrl.trim() !== '') {
    const trimmed = rawEnvUrl.trim();
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  }
  // In development, default to local Spring Boot port 8081
  if (import.meta.env.DEV) {
    return 'http://localhost:8081';
  }
  // In production builds (e.g. Vercel), do NOT fallback to localhost
  return '';
}

export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Get stored auth token from session storage (preferring session-based storage)
 */
export function getToken() {
  try {
    const raw = sessionStorage.getItem('exampro_auth') || localStorage.getItem('exampro_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

/**
 * Clear stored auth credentials from browser storage
 */
export function clearStoredAuth() {
  try {
    sessionStorage.removeItem('exampro_auth');
    localStorage.removeItem('exampro_auth');
  } catch (err) {
    console.error('Failed to clear session storage:', err);
  }
}

/**
 * Universal request wrapper with JWT authorization and error normalization
 */
async function request(endpoint, options = {}) {
  if (import.meta.env.PROD && !API_BASE_URL) {
    throw new Error(
      'ExamPro Backend URL is not configured. Please set the VITE_API_BASE_URL environment variable in your Vercel project settings.'
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const target = API_BASE_URL || 'configured server';
    throw new Error(
      `Unable to connect to ExamPro backend at ${target}. ` +
      (import.meta.env.PROD
        ? 'Please verify that your Render backend service is awake and running.'
        : 'Ensure Spring Boot is running on port 8081.')
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMsg = 'An unexpected server error occurred';

    if (data && typeof data === 'object') {
      errorMsg = data.message || data.error || errorMsg;
    } else if (typeof data === 'string' && data.length > 0) {
      errorMsg = data;
    }

    if (response.status === 401) {
      clearStoredAuth();
      errorMsg = 'Session expired or unauthenticated. Please sign in again.';
    } else if (response.status === 403) {
      errorMsg = data?.message || 'Access Denied: You do not have permission for this resource.';
    }

    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ----------------- API MODULES -----------------

export const authApi = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
};

export const examsApi = {
  getAll: () => request('/api/exams', { method: 'GET' }),
  getById: (id) => request(`/api/exams/${id}`, { method: 'GET' }),
  getQuestions: (id) => request(`/api/exams/${id}/questions`, { method: 'GET' }),
  getAdminQuestions: (id) => request(`/api/admin/exams/${id}/questions`, { method: 'GET' }),
  create: (payload) => request('/api/admin/exams', { method: 'POST', body: payload }),
  update: (id, payload) => request(`/api/admin/exams/${id}`, { method: 'PUT', body: payload }),
  delete: (id) => request(`/api/admin/exams/${id}`, { method: 'DELETE' }),
  assignQuestions: (id, questionIds) =>
    request(`/api/admin/exams/${id}/questions`, { method: 'POST', body: { questionIds } }),
  unassignQuestion: (id, questionId) =>
    request(`/api/admin/exams/${id}/questions/${questionId}`, { method: 'DELETE' }),
};

export const subjectsApi = {
  getAll: () => request('/api/subjects', { method: 'GET' }),
  getById: (id) => request(`/api/subjects/${id}`, { method: 'GET' }),
  create: (payload) => request('/api/admin/subjects', { method: 'POST', body: payload }),
  update: (id, payload) => request(`/api/admin/subjects/${id}`, { method: 'PUT', body: payload }),
  delete: (id) => request(`/api/admin/subjects/${id}`, { method: 'DELETE' }),
};

export const questionsApi = {
  getAll: () => request('/api/questions', { method: 'GET' }),
  getById: (id) => request(`/api/questions/${id}`, { method: 'GET' }),
  getAdminAll: () => request('/api/admin/questions', { method: 'GET' }),
  getAdminById: (id) => request(`/api/admin/questions/${id}`, { method: 'GET' }),
  create: (payload) => request('/api/admin/questions', { method: 'POST', body: payload }),
  update: (id, payload) => request(`/api/admin/questions/${id}`, { method: 'PUT', body: payload }),
  delete: (id) => request(`/api/admin/questions/${id}`, { method: 'DELETE' }),
};

export const attemptsApi = {
  start: (examId) => request(`/api/exams/${examId}/attempts`, { method: 'POST' }),
  saveAnswers: (attemptId, answers) =>
    request(`/api/attempts/${attemptId}/answers`, { method: 'PUT', body: { answers } }),
  submit: (attemptId) => request(`/api/attempts/${attemptId}/submit`, { method: 'POST' }),
  getMyResults: () => request('/api/results/my', { method: 'GET' }),
  getResultById: (id) => request(`/api/results/${id}`, { method: 'GET' }),
  getAdminResults: () => request('/api/admin/results', { method: 'GET' }),
};

export const systemApi = {
  getStatus: () => request('/api/status', { method: 'GET' }),
};

export default {
  auth: authApi,
  exams: examsApi,
  subjects: subjectsApi,
  questions: questionsApi,
  attempts: attemptsApi,
  system: systemApi,
  getToken,
  clearStoredAuth,
};
