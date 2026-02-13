import { IsOptional, IsString } from 'class-validator';

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
