import axios from 'axios';
import type { EmailDetail, EmailListResponse, ProjectResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const projectsApi = {
  list: (): Promise<ProjectResponse[]> =>
    api.get('/projects').then((r) => r.data),
};

export const emailsApi = {
  list: (params: {
    project?: string;
    environment?: string;
    sender?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<EmailListResponse> => api.get('/emails', { params }).then((r) => r.data),

  get: (id: string): Promise<EmailDetail> =>
    api.get(`/emails/${id}`).then((r) => r.data),

  getHtml: (id: string): Promise<string> =>
    api.get(`/emails/${id}/html`).then((r) => r.data),

  delete: (id: string): Promise<{ success: boolean }> =>
    api.delete(`/emails/${id}`).then((r) => r.data),
};

export default api;
