import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentSchool = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    // First check subdomain-resolved schoolId, then fallback to user's schoolId
    return request.schoolId || request.user?.schoolId || null;
  },
);
