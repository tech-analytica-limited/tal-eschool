import apiClient from '@/lib/api-client';
import type {
  Attendance,
  MarkAttendanceRequest,
  BulkAttendanceRequest,
  AttendanceStats,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types';

interface AttendancePaginationParams extends PaginationParams {
  date?: string;
  studentId?: string;
  classroomId?: string;
}

interface AttendanceStatsParams {
  startDate?: string;
  endDate?: string;
  studentId?: string;
  classroomId?: string;
}

export const attendanceApi = {
  // Get all attendance records
  getAll: async (params?: AttendancePaginationParams): Promise<PaginatedResponse<Attendance>> => {
    const response = await apiClient.get<PaginatedResponse<Attendance>>('/attendance', {
      params,
    });
    return response.data;
  },

  // Get attendance by ID
  getById: async (id: string): Promise<Attendance> => {
    const response = await apiClient.get<Attendance>(`/attendance/${id}`);
    return response.data;
  },

  // Get attendance statistics
  getStats: async (params?: AttendanceStatsParams): Promise<AttendanceStats> => {
    const response = await apiClient.get<AttendanceStats>('/attendance/stats', {
      params,
    });
    return response.data;
  },

  // Mark single attendance
  mark: async (data: MarkAttendanceRequest): Promise<Attendance> => {
    const response = await apiClient.post<Attendance>('/attendance', data);
    return response.data;
  },

  // Mark bulk attendance
  markBulk: async (data: BulkAttendanceRequest): Promise<{ success: number; failed: number }> => {
    const response = await apiClient.post<{ success: number; failed: number }>(
      '/attendance/bulk',
      data
    );
    return response.data;
  },

  // Update attendance
  update: async (id: string, data: Partial<MarkAttendanceRequest>): Promise<Attendance> => {
    const response = await apiClient.patch<Attendance>(`/attendance/${id}`, data);
    return response.data;
  },

  // Delete attendance
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/attendance/${id}`);
  },
};
