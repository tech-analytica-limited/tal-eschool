import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';

@Injectable()
export class SchoolGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const schoolIdFromRequest = request.schoolId;

    // Super admin can access all schools
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    // For other roles, ensure user belongs to the school
    if (!user.schoolId) {
      throw new ForbiddenException('User does not belong to any school');
    }

    // If subdomain has resolved a school, verify user belongs to that school
    if (schoolIdFromRequest && user.schoolId !== schoolIdFromRequest) {
      throw new ForbiddenException('Access denied: User does not belong to this school');
    }

    return true;
  }
}
