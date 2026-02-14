// User types
export interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER';
  schoolId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER';
  schoolId?: string;
}

// School types
export interface School {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchoolRequest {
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
}

export interface UpdateSchoolRequest extends Partial<CreateSchoolRequest> {
  isActive?: boolean;
}

export interface SchoolStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClassrooms: number;
  totalAttendanceRecords: number;
}

// Teacher types
export interface Teacher {
  id: string;
  userId: string;
  schoolId: string;
  name: string;
  designation?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateTeacherRequest {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  password: string;
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {}

// Student types
export interface Student {
  id: string;
  schoolId: string;
  classroomId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  classroom?: Classroom;
  attendance?: Attendance[];
}

export interface CreateStudentRequest {
  classroomId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  address: string;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {}

// Classroom types
export interface Classroom {
  id: string;
  schoolId: string;
  name: string;
  section: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  students?: Student[];
  _count?: {
    students: number;
  };
}

export interface CreateClassroomRequest {
  name: string;
  section: string;
  capacity: number;
}

export interface UpdateClassroomRequest extends Partial<CreateClassroomRequest> {}

// Attendance types
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface Attendance {
  id: string;
  schoolId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
}

export interface MarkAttendanceRequest {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BulkAttendanceRequest {
  date: string;
  attendances: {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
}

export interface AttendanceStats {
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  presentPercentage: number;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Error
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
