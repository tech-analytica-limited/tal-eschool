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
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, BulkMarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentSchool } from '../../common/decorators/current-school.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { UserFromRequest } from '../../common/interfaces/user.interface';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard, SchoolGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  markAttendance(
    @Body() markAttendanceDto: MarkAttendanceDto,
    @CurrentSchool() schoolId: string,
    @CurrentUser() user: UserFromRequest,
  ) {
    return this.attendanceService.markAttendance(markAttendanceDto, schoolId, user.id);
  }

  @Post('bulk')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  bulkMarkAttendance(
    @Body() bulkMarkAttendanceDto: BulkMarkAttendanceDto,
    @CurrentSchool() schoolId: string,
    @CurrentUser() user: UserFromRequest,
  ) {
    return this.attendanceService.bulkMarkAttendance(bulkMarkAttendanceDto, schoolId, user.id);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findAll(
    @CurrentSchool() schoolId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('date') date?: string,
    @Query('studentId') studentId?: string,
    @Query('classroomId') classroomId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.attendanceService.findAll(schoolId, pageNum, limitNum, date, studentId, classroomId);
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  getStats(@CurrentSchool() schoolId: string, @Query('date') date?: string) {
    return this.attendanceService.getAttendanceStats(schoolId, date);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string, @CurrentSchool() schoolId: string) {
    return this.attendanceService.findOne(id, schoolId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @CurrentSchool() schoolId: string,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto, schoolId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  remove(@Param('id') id: string, @CurrentSchool() schoolId: string) {
    return this.attendanceService.remove(id, schoolId);
  }
}
