import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Token storage helpers (localStorage – client-side only)
// ---------------------------------------------------------------------------

export const tokenStorage = {
  getAccess: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem('kv_access_token') : null,

  getRefresh: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem('kv_refresh_token') : null,

  set: (access: string, refresh: string) => {
    localStorage.setItem('kv_access_token', access);
    localStorage.setItem('kv_refresh_token', refresh);
  },

  clear: () => {
    localStorage.removeItem('kv_access_token');
    localStorage.removeItem('kv_refresh_token');
  },
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ---------------------------------------------------------------------------
// Request interceptor – attach Bearer token
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor – silent token refresh on 401
// ---------------------------------------------------------------------------

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processPendingQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      tokenStorage.set(data.access_token, data.refresh_token ?? refreshToken);
      processPendingQueue(null, data.access_token);
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processPendingQueue(refreshError);
      tokenStorage.clear();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    tokenStorage.set(data.access_token, data.refresh_token);
    return data;
  },

  register: async (payload: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  logout: () => tokenStorage.clear(),
};

// ---------------------------------------------------------------------------
// Sermons helpers
// ---------------------------------------------------------------------------

export const sermonsApi = {
  list: async (params?: Record<string, string | number>) => {
    const { data } = await apiClient.get('/sermons', { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/sermons/${id}`);
    return data;
  },

  create: async (payload: { title: string; description?: string; date?: string }) => {
    const { data } = await apiClient.post('/sermons', payload);
    return data;
  },

  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.patch(`/sermons/${id}`, payload);
    return data;
  },

  uploadAudio: async (id: string, file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await apiClient.post(`/sermons/${id}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return data;
  },

  transcribe: async (id: string) => {
    const { data } = await apiClient.post(`/sermons/${id}/transcribe`);
    return data;
  },
};

// ---------------------------------------------------------------------------
// AI helpers
// ---------------------------------------------------------------------------

export const aiApi = {
  transcribe: async (file: File, sermonId?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (sermonId) form.append('sermonId', sermonId);
    const { data } = await apiClient.post('/ai/transcribe', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  process: async (sermonId: string) => {
    const { data } = await apiClient.post(`/ai/process/${sermonId}`);
    return data;
  },
};
