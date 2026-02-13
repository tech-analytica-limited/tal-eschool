'use client';

import { useQuery } from '@tanstack/react-query';
import { schoolsApi } from '@/lib/api/schools';
import { dashboardApi } from '@/lib/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, GraduationCap, BookOpen } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => schoolsApi.getAll({ page: 1, limit: 100 }),
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  const totalSchools = schoolsData?.total || 0;
  const activeSchools = schoolsData?.data.filter((s) => s.isActive).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all schools and system statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : statsData?.stats.totalSchools || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statsData?.stats.activeSchools || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : statsData?.stats.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : statsData?.stats.totalTeachers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : statsData?.stats.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all schools</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Schools */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Schools</CardTitle>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : schoolsData && schoolsData.data.length > 0 ? (
            <div className="space-y-4">
              {schoolsData.data.slice(0, 5).map((school) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-muted-foreground">{school.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs ${
                        school.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No schools found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
