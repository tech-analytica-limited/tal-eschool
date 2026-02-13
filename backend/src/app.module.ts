import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { StudentsModule } from './modules/students/students.module';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TenantResolutionMiddleware } from './common/middleware/tenant-resolution.middleware';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Prisma module
    PrismaModule,
    // Auth module
    AuthModule,
    // Schools module
    SchoolsModule,
    // Teachers module
    TeachersModule,
    // Students module
    StudentsModule,
    // Classrooms module
    ClassroomsModule,
    // Attendance module
    AttendanceModule,
    // Dashboard module
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply tenant resolution middleware to all routes
    consumer
      .apply(TenantResolutionMiddleware)
      .forRoutes('*');
  }
}
