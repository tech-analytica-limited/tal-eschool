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
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentSchool } from '../../common/decorators/current-school.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('classrooms')
@UseGuards(JwtAuthGuard, RolesGuard, SchoolGuard)
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  create(@Body() createClassroomDto: CreateClassroomDto, @CurrentSchool() schoolId: string) {
    return this.classroomsService.create(createClassroomDto, schoolId);
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
    return this.classroomsService.findAll(schoolId, pageNum, limitNum, search);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string, @CurrentSchool() schoolId: string) {
    return this.classroomsService.findOne(id, schoolId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
    @CurrentSchool() schoolId: string,
  ) {
    return this.classroomsService.update(id, updateClassroomDto, schoolId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  remove(@Param('id') id: string, @CurrentSchool() schoolId: string) {
    return this.classroomsService.remove(id, schoolId);
  }
}
