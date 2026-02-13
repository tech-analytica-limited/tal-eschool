import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarkAttendanceDto, BulkMarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(markAttendanceDto: MarkAttendanceDto, schoolId: string, markedBy: string) {
    const { studentId, date, status, remarks } = markAttendanceDto;

    // Verify student belongs to the school
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new BadRequestException('Invalid student or student does not belong to this school');
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists
    const existing = await this.prisma.attendance.findFirst({
      where: {
        studentId,
        date: attendanceDate,
        schoolId,
      },
    });

    if (existing) {
      throw new ConflictException('Attendance already marked for this student on this date');
    }

    // Mark attendance
    const attendance = await this.prisma.attendance.create({
      data: {
        studentId,
        date: attendanceDate,
        status,
        remarks,
        markedBy,
        schoolId,
      },
      include: {
        student: {
          include: { classroom: true },
        },
      },
    });

    return attendance;
  }

  async bulkMarkAttendance(bulkMarkAttendanceDto: BulkMarkAttendanceDto, schoolId: string, markedBy: string) {
    const results = [];
    const errors = [];

    for (const attendanceDto of bulkMarkAttendanceDto.attendances) {
      try {
        const attendance = await this.markAttendance(attendanceDto, schoolId, markedBy);
        results.push({ success: true, data: attendance });
      } catch (error) {
        errors.push({
          success: false,
          studentId: attendanceDto.studentId,
          error: error.message,
        });
      }
    }

    return {
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  async findAll(
    schoolId: string,
    page: number = 1,
    limit: number = 10,
    date?: string,
    studentId?: string,
    classroomId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { schoolId };

    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      where.date = attendanceDate;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (classroomId) {
      where.student = {
        classroomId,
      };
    }

    const [attendance, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          student: {
            include: { classroom: true },
          },
          markedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      data: attendance,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, schoolId: string) {
    const attendance = await this.prisma.attendance.findFirst({
      where: { id, schoolId },
      include: {
        student: {
          include: { classroom: true },
        },
        markedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const attendance = await this.prisma.attendance.update({
      where: { id },
      data: updateAttendanceDto,
      include: {
        student: {
          include: { classroom: true },
        },
      },
    });

    return attendance;
  }

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);

    await this.prisma.attendance.delete({ where: { id } });

    return { message: 'Attendance record deleted successfully' };
  }

  async getAttendanceStats(schoolId: string, date?: string) {
    const where: any = { schoolId };

    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      where.date = attendanceDate;
    }

    const [total, present, absent, late] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'ABSENT' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'LATE' } }),
    ]);

    const totalStudents = await this.prisma.student.count({ where: { schoolId } });

    return {
      total,
      present,
      absent,
      late,
      totalStudents,
      attendancePercentage: totalStudents > 0 ? ((present + late) / totalStudents) * 100 : 0,
    };
  }
}
