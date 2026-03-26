import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, body: unknown) => 
    fetchApi<T>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  
  put: <T>(endpoint: string, body: unknown) => 
    fetchApi<T>(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
  
  delete: <T>(endpoint: string) => 
    fetchApi<T>(endpoint, { method: 'DELETE' }),
};

// 账号 API
export const accountsApi = {
  list: () => api.get<Account[]>('/accounts'),
  get: (id: string) => api.get<Account>(`/accounts/${id}`),
  create: (data: { name: string; email: string; privateKey: string; publicKey: string }) =>
    api.post<Account>('/accounts', data),
  update: (id: string, data: Partial<Account>) =>
    api.put<Account>(`/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
};

// 应用 API
export const appsApi = {
  list: () => api.get<App[]>('/apps'),
  get: (id: string) => api.get<App>(`/apps/${id}`),
  create: (data: {
    name: string;
    packageName: string;
    accountId: string;
    categoryId?: string;
    categoryName?: string;
    keywords?: string;
    desc?: string;
    brief?: string;
    privacyUrl?: string;
  }) => api.post<App>('/apps', data),
  update: (id: string, data: Partial<App>) =>
    api.put<App>(`/apps/${id}`, data),
  delete: (id: string) => api.delete(`/apps/${id}`),
};

// 发布 API
export const releasesApi = {
  list: () => api.get<ReleaseRecord[]>('/releases'),
  listByApp: (appId: string) => api.get<ReleaseRecord[]>(`/releases/app/${appId}`),
  create: (appId: string) => api.post('/releases', { appId }),
  getStatus: (appId: string) => api.get(`/releases/status/${appId}`),
};

// 上传 API
export const uploadApi = {
  uploadApk: async (appId: string, file: File) => {
    const formData = new FormData();
    formData.append('apk', file);

    const response = await fetch(`${API_BASE_URL}/upload/${appId}`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  },
};

import type { Account, App, ReleaseRecord } from '../types';
