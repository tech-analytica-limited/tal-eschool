import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto, schoolId: string) {
    const { email, password, name, designation, phone } = createTeacherDto;

    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'Teacher@123', 10);

    // Create user and teacher in transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: Role.TEACHER,
          schoolId,
        },
      });

      // Create teacher
      const teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          name,
          designation: designation || 'Teacher',
          phone,
          schoolId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      return teacher;
    });

    return result;
  }

  async findAll(schoolId: string, page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { schoolId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
            },
          },
        },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return {
      data: teachers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, schoolId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, schoolId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto, schoolId: string) {
    await this.findOne(id, schoolId);

    const teacher = await this.prisma.teacher.update({
      where: { id },
      data: updateTeacherDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return teacher;
  }

  async remove(id: string, schoolId: string) {
    const teacher = await this.findOne(id, schoolId);

    // Delete teacher and user in transaction
    await this.prisma.$transaction(async (prisma) => {
      await prisma.teacher.delete({ where: { id } });
      await prisma.user.delete({ where: { id: teacher.userId } });
    });

    return { message: 'Teacher deleted successfully' };
  }
}
