import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto, schoolId: string) {
    const { rollNumber, classroomId, dateOfBirth, ...rest } = createStudentDto;

    // Check if roll number already exists in school
    const existing = await this.prisma.student.findFirst({
      where: { rollNumber, schoolId },
    });

    if (existing) {
      throw new ConflictException(`Student with roll number "${rollNumber}" already exists`);
    }

    // Verify classroom belongs to the same school
    const classroom = await this.prisma.classroom.findFirst({
      where: { id: classroomId, schoolId },
    });

    if (!classroom) {
      throw new BadRequestException('Invalid classroom or classroom does not belong to this school');
    }

    const student = await this.prisma.student.create({
      data: {
        rollNumber,
        classroomId,
        schoolId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        ...rest,
      },
      include: {
        classroom: true,
      },
    });

    return student;
  }

  async findAll(schoolId: string, page: number = 1, limit: number = 10, search?: string, classroomId?: string) {
    const skip = (page - 1) * limit;

    const where: any = { schoolId };
    
    if (classroomId) {
      where.classroomId = classroomId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rollNumber: 'asc' },
        include: {
          classroom: true,
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, schoolId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        classroom: true,
        attendance: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const { dateOfBirth, classroomId, ...rest } = updateStudentDto;

    // If classroomId is being updated, verify it belongs to the same school
    if (classroomId) {
      const classroom = await this.prisma.classroom.findFirst({
        where: { id: classroomId, schoolId },
      });

      if (!classroom) {
        throw new BadRequestException('Invalid classroom or classroom does not belong to this school');
      }
    }

    const student = await this.prisma.student.update({
      where: { id },
      data: {
        ...rest,
        classroomId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
      include: {
        classroom: true,
      },
    });

    return student;
  }

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);

    // Delete student (attendance will cascade delete)
    await this.prisma.student.delete({ where: { id } });

    return { message: 'Student deleted successfully' };
  }
}
