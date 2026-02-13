import apiClient from '@/lib/api-client';
import type {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types';

interface StudentPaginationParams extends PaginationParams {
  classroomId?: string;
}

export const studentsApi = {
  // Get all students
  getAll: async (params?: StudentPaginationParams): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<PaginatedResponse<Student>>('/students', {
      params,
    });
    return response.data;
  },

  // Get student by ID
  getById: async (id: string): Promise<Student> => {
    const response = await apiClient.get<Student>(`/students/${id}`);
    return response.data;
  },

  // Create student
  create: async (data: CreateStudentRequest): Promise<Student> => {
    const response = await apiClient.post<Student>('/students', data);
    return response.data;
  },

  // Update student
  update: async (id: string, data: UpdateStudentRequest): Promise<Student> => {
    const response = await apiClient.patch<Student>(`/students/${id}`, data);
    return response.data;
  },

  // Delete student
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },
};
