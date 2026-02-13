import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserFromRequest } from '../interfaces/user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserFromRequest => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
