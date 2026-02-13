import apiClient from '@/lib/api-client';

export interface DashboardStats {
  role: string;
  schoolId?: string;
  stats: {
    totalSchools?: number;
    activeSchools?: number;
    totalUsers?: number;
    totalTeachers: number;
    totalStudents: number;
    totalClassrooms?: number;
    attendanceMarkedToday?: number;
  };
}

export const dashboardApi = {
  // Get dashboard stats
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};
