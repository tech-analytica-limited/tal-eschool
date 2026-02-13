import { IsNotEmpty, IsString, IsDateString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../common/enums/attendance-status.enum';

export class MarkAttendanceDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class BulkMarkAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkAttendanceDto)
  attendances: MarkAttendanceDto[];
}
