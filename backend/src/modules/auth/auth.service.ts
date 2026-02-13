import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../../common/enums/role.enum';
import { JwtPayload } from '../../common/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { school: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if school is active (for non-super admins)
    if (user.schoolId && user.school && !user.school.isActive) {
      throw new UnauthorizedException('School is currently inactive');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      schoolId: user.schoolId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
        school: user.school ? {
          id: user.school.id,
          name: user.school.name,
          slug: user.school.slug,
        } : null,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, role, schoolId } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate schoolId for non-super admins
    if (role !== Role.SUPER_ADMIN && !schoolId) {
      throw new BadRequestException('schoolId is required for non-super admin users');
    }

    // Validate school exists and is active
    if (schoolId) {
      const school = await this.prisma.school.findUnique({
        where: { id: schoolId },
      });

      if (!school) {
        throw new BadRequestException('Invalid schoolId');
      }

      if (!school.isActive) {
        throw new BadRequestException('School is currently inactive');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        schoolId,
      },
      include: { school: true },
    });

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      schoolId: user.schoolId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
        school: user.school ? {
          id: user.school.id,
          name: user.school.name,
          slug: user.school.slug,
        } : null,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
      school: user.school ? {
        id: user.school.id,
        name: user.school.name,
        slug: user.school.slug,
      } : null,
    };
  }
}
