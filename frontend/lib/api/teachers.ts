import apiClient from '@/lib/api-client';
import type {
  Teacher,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types';

export const teachersApi = {
  // Get all teachers
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Teacher>> => {
    const response = await apiClient.get<PaginatedResponse<Teacher>>('/teachers', {
      params,
    });
    return response.data;
  },

  // Get teacher by ID
  getById: async (id: string): Promise<Teacher> => {
    const response = await apiClient.get<Teacher>(`/teachers/${id}`);
    return response.data;
  },

  // Create teacher
  create: async (data: CreateTeacherRequest): Promise<Teacher> => {
    const response = await apiClient.post<Teacher>('/teachers', data);
    return response.data;
  },

  // Update teacher
  update: async (id: string, data: UpdateTeacherRequest): Promise<Teacher> => {
    const response = await apiClient.patch<Teacher>(`/teachers/${id}`, data);
    return response.data;
  },

  // Delete teacher
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/teachers/${id}`);
  },
};
