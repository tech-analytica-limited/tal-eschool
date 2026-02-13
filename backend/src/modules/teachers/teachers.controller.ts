import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentSchool } from '../../common/decorators/current-school.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard, SchoolGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  create(@Body() createTeacherDto: CreateTeacherDto, @CurrentSchool() schoolId: string) {
    return this.teachersService.create(createTeacherDto, schoolId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findAll(
    @CurrentSchool() schoolId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.teachersService.findAll(schoolId, pageNum, limitNum, search);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string, @CurrentSchool() schoolId: string) {
    return this.teachersService.findOne(id, schoolId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @CurrentSchool() schoolId: string,
  ) {
    return this.teachersService.update(id, updateTeacherDto, schoolId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  remove(@Param('id') id: string, @CurrentSchool() schoolId: string) {
    return this.teachersService.remove(id, schoolId);
  }
}
