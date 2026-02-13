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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentSchool } from '../../common/decorators/current-school.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard, SchoolGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  create(@Body() createStudentDto: CreateStudentDto, @CurrentSchool() schoolId: string) {
    return this.studentsService.create(createStudentDto, schoolId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findAll(
    @CurrentSchool() schoolId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('classroomId') classroomId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.studentsService.findAll(schoolId, pageNum, limitNum, search, classroomId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string, @CurrentSchool() schoolId: string) {
    return this.studentsService.findOne(id, schoolId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentSchool() schoolId: string,
  ) {
    return this.studentsService.update(id, updateStudentDto, schoolId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  remove(@Param('id') id: string, @CurrentSchool() schoolId: string) {
    return this.studentsService.remove(id, schoolId);
  }
}
