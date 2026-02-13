import apiClient from '@/lib/api-client';
import type {
  School,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  PaginatedResponse,
  PaginationParams,
  SchoolStats,
} from '@/lib/types';

export const schoolsApi = {
  // Get all schools (Super Admin only)
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<School>> => {
    const response = await apiClient.get<PaginatedResponse<School>>('/schools', {
      params,
    });
    return response.data;
  },

  // Get school by ID
  getById: async (id: string): Promise<School> => {
    const response = await apiClient.get<School>(`/schools/${id}`);
    return response.data;
  },

  // Get school statistics
  getStats: async (id: string): Promise<SchoolStats> => {
    const response = await apiClient.get<SchoolStats>(`/schools/${id}/stats`);
    return response.data;
  },

  // Create school
  create: async (data: CreateSchoolRequest): Promise<School> => {
    const response = await apiClient.post<School>('/schools', data);
    return response.data;
  },

  // Update school
  update: async (id: string, data: UpdateSchoolRequest): Promise<School> => {
    const response = await apiClient.patch<School>(`/schools/${id}`, data);
    return response.data;
  },

  // Toggle school active status
  toggleActive: async (id: string): Promise<School> => {
    const response = await apiClient.patch<School>(`/schools/${id}/toggle-active`);
    return response.data;
  },

  // Delete school
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/schools/${id}`);
  },
};
