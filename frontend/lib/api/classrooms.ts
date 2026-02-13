import apiClient from '@/lib/api-client';
import type {
  Classroom,
  CreateClassroomRequest,
  UpdateClassroomRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types';

export const classroomsApi = {
  // Get all classrooms
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Classroom>> => {
    const response = await apiClient.get<PaginatedResponse<Classroom>>('/classrooms', {
      params,
    });
    return response.data;
  },

  // Get classroom by ID
  getById: async (id: string): Promise<Classroom> => {
    const response = await apiClient.get<Classroom>(`/classrooms/${id}`);
    return response.data;
  },

  // Create classroom
  create: async (data: CreateClassroomRequest): Promise<Classroom> => {
    const response = await apiClient.post<Classroom>('/classrooms', data);
    return response.data;
  },

  // Update classroom
  update: async (id: string, data: UpdateClassroomRequest): Promise<Classroom> => {
    const response = await apiClient.patch<Classroom>(`/classrooms/${id}`, data);
    return response.data;
  },

  // Delete classroom
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/classrooms/${id}`);
  },
};
