import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClassroomDto: CreateClassroomDto, schoolId: string) {
    const { name, section } = createClassroomDto;

    // Check if classroom already exists
    const existing = await this.prisma.classroom.findFirst({
      where: { name, section, schoolId },
    });

    if (existing) {
      throw new ConflictException(`Classroom ${name} ${section} already exists`);
    }

    const classroom = await this.prisma.classroom.create({
      data: {
        name,
        section,
        schoolId,
      },
    });

    return classroom;
  }

  async findAll(schoolId: string, page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { schoolId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { section: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [classrooms, total] = await Promise.all([
      this.prisma.classroom.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ name: 'asc' }, { section: 'asc' }],
        include: {
          _count: {
            select: { students: true },
          },
        },
      }),
      this.prisma.classroom.count({ where }),
    ]);

    return {
      data: classrooms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, schoolId: string) {
    const classroom = await this.prisma.classroom.findFirst({
      where: { id, schoolId },
      include: {
        students: {
          orderBy: { rollNumber: 'asc' },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    return classroom;
  }

  async update(id: string, updateClassroomDto: UpdateClassroomDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const classroom = await this.prisma.classroom.update({
      where: { id },
      data: updateClassroomDto,
    });

    return classroom;
  }

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);

    // Check if classroom has students
    const studentsCount = await this.prisma.student.count({
      where: { classroomId: id },
    });

    if (studentsCount > 0) {
      throw new ConflictException('Cannot delete classroom with students. Please reassign or delete students first.');
    }

    await this.prisma.classroom.delete({ where: { id } });

    return { message: 'Classroom deleted successfully' };
  }
}
