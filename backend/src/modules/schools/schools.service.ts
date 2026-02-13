import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSchoolDto: CreateSchoolDto) {
    const { slug, ...rest } = createSchoolDto;

    // Check if slug already exists
    const existingSchool = await this.prisma.school.findUnique({
      where: { slug },
    });

    if (existingSchool) {
      throw new ConflictException(`School with slug "${slug}" already exists`);
    }

    // Create school
    const school = await this.prisma.school.create({
      data: {
        slug,
        ...rest,
      },
    });

    return school;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { slug: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [schools, total] = await Promise.all([
      this.prisma.school.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              teachers: true,
              students: true,
              classrooms: true,
            },
          },
        },
      }),
      this.prisma.school.count({ where }),
    ]);

    return {
      data: schools,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            teachers: true,
            students: true,
            classrooms: true,
            attendance: true,
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }

    return school;
  }

  async findBySlug(slug: string) {
    const school = await this.prisma.school.findUnique({
      where: { slug },
    });

    if (!school) {
      throw new NotFoundException(`School with slug "${slug}" not found`);
    }

    return school;
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto) {
    // Check if school exists
    await this.findOne(id);

    // Update school
    const school = await this.prisma.school.update({
      where: { id },
      data: updateSchoolDto,
    });

    return school;
  }

  async remove(id: string) {
    // Check if school exists
    await this.findOne(id);

    // Check if school has data
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            teachers: true,
            students: true,
          },
        },
      },
    });

    const hasData =
      school._count.users > 0 ||
      school._count.teachers > 0 ||
      school._count.students > 0;

    if (hasData) {
      throw new BadRequestException(
        'Cannot delete school with existing users, teachers, or students. Please delete all related data first or deactivate the school.',
      );
    }

    // Delete school
    await this.prisma.school.delete({
      where: { id },
    });

    return { message: 'School deleted successfully' };
  }

  async toggleActive(id: string) {
    const school = await this.findOne(id);

    const updated = await this.prisma.school.update({
      where: { id },
      data: { isActive: !school.isActive },
    });

    return updated;
  }

  async getStats(id: string) {
    const school = await this.findOne(id);

    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalClassrooms,
      attendanceToday,
    ] = await Promise.all([
      this.prisma.user.count({ where: { schoolId: id } }),
      this.prisma.teacher.count({ where: { schoolId: id } }),
      this.prisma.student.count({ where: { schoolId: id } }),
      this.prisma.classroom.count({ where: { schoolId: id } }),
      this.prisma.attendance.count({
        where: {
          schoolId: id,
          date: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    ]);

    return {
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        isActive: school.isActive,
      },
      stats: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalClassrooms,
        attendanceMarkedToday: attendanceToday,
      },
    };
  }
}
