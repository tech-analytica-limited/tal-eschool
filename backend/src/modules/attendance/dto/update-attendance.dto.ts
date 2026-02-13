import { IsOptional, IsEnum, IsString } from 'class-validator';
import { AttendanceStatus } from '../../../common/enums/attendance-status.enum';

export class UpdateAttendanceDto {
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}
