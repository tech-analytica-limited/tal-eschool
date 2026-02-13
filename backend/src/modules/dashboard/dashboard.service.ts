import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import { UserFromRequest } from '../../common/interfaces/user.interface';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(schoolId: string | null, user: UserFromRequest) {
    // Super Admin: Get global stats
    if (user.role === Role.SUPER_ADMIN) {
      const [totalSchools, totalUsers, totalTeachers, totalStudents, activeSchools] =
        await Promise.all([
          this.prisma.school.count(),
          this.prisma.user.count(),
          this.prisma.teacher.count(),
          this.prisma.student.count(),
          this.prisma.school.count({ where: { isActive: true } }),
        ]);

      return {
        role: 'SUPER_ADMIN',
        stats: {
          totalSchools,
          activeSchools,
          totalUsers,
          totalTeachers,
          totalStudents,
        },
      };
    }

    // School Admin or Teacher: Get school-specific stats
    const userSchoolId = schoolId || user.schoolId;
    
    if (!userSchoolId) {
      return {
        role: user.role,
        stats: {
          totalTeachers: 0,
          totalStudents: 0,
          totalClassrooms: 0,
          attendanceMarkedToday: 0,
        },
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalTeachers, totalStudents, totalClassrooms, attendanceToday] =
      await Promise.all([
        this.prisma.teacher.count({ where: { schoolId: userSchoolId } }),
        this.prisma.student.count({ where: { schoolId: userSchoolId } }),
        this.prisma.classroom.count({ where: { schoolId: userSchoolId } }),
        this.prisma.attendance.count({
          where: {
            schoolId: userSchoolId,
            date: today,
          },
        }),
      ]);

    return {
      role: user.role,
      schoolId: userSchoolId,
      stats: {
        totalTeachers,
        totalStudents,
        totalClassrooms,
        attendanceMarkedToday: attendanceToday,
      },
    };
  }
}
