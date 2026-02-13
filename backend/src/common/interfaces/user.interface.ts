import { Role } from '../enums/role.enum';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  schoolId?: string;
}

export interface UserFromRequest {
  id: string;
  email: string;
  name: string;
  role: Role;
  schoolId?: string;
}
