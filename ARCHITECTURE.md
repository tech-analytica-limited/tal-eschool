# TAL-Eschool - SaaS Architecture Documentation

## 🏗️ System Overview

**TAL-Eschool** is a multi-tenant SaaS School Management System where multiple schools can register and get their own isolated management system. Each school operates as a separate tenant with complete data isolation.

### Core Concept
- **Main Domain**: `xyz.com` (TAL-Eschool Super Admin)
- **School Subdomains**: `{school-slug}.xyz.com` (Individual School Panels)
- **Multi-Tenancy Model**: Logical separation using `schoolId` column
- **Database**: Single PostgreSQL database (shared schema)

---

## 🧠 Multi-Tenancy Architecture

### Why Tenant-ID Based (Logical Multi-Tenancy)?

**✅ Chosen Approach: Shared Database + Tenant Column (schoolId)**

**Advantages:**
- Single database to maintain
- Cost-effective for scaling
- Easier backups and migrations
- Centralized management
- Lower infrastructure complexity

**Implementation:**
- Every data table contains `schoolId` column
- All queries automatically scoped by `schoolId`
- Tenant resolution via subdomain middleware
- Data isolation enforced at application layer

**❌ Not Using: Database-per-Tenant**
- Too many databases to manage
- Higher infrastructure cost
- Complex backup/migration
- Not suitable for this scale

---

## 🌐 Subdomain-Based Tenant Resolution

### DNS Configuration

```
*.xyz.com → Backend Server (Load Balancer)
```

**Wildcard DNS** routes all subdomains to the same backend application.

### Request Flow

```
User Request: https://abc.xyz.com/api/students
                    ↓
       DNS Resolution: *.xyz.com → Backend IP
                    ↓
       NestJS Application receives request
                    ↓
       Tenant Middleware extracts subdomain: "abc"
                    ↓
       Database lookup: SELECT * FROM schools WHERE slug = 'abc'
                    ↓
       Attach schoolId to request context
                    ↓
       Controller → Service → Prisma
                    ↓
       All queries include: WHERE schoolId = {resolved_school_id}
                    ↓
       Response sent back to user
```

### Domain Handling

| Domain | Purpose | User Type |
|--------|---------|-----------|
| `xyz.com` | TAL-Eschool Super Admin Panel | SUPER_ADMIN |
| `abc.xyz.com` | ABC School Management Panel | SCHOOL_ADMIN, TEACHER |
| `xyz-school.xyz.com` | XYZ School Management Panel | SCHOOL_ADMIN, TEACHER |

---

## 🔐 Authentication & Authorization (RBAC)

### User Roles

#### 1. SUPER_ADMIN
- **Access**: All schools across the platform
- **Permissions**:
  - Create/Delete/Activate schools
  - View all schools' data
  - Manage global settings
- **Login Domain**: `xyz.com`
- **schoolId**: `null` (global access)

#### 2. SCHOOL_ADMIN
- **Access**: Only their school
- **Permissions**:
  - Manage teachers
  - Manage students
  - Manage classrooms
  - View attendance
  - School-level settings
- **Login Domain**: `{school-slug}.xyz.com`
- **schoolId**: Specific school ID

#### 3. TEACHER
- **Access**: Only their school (limited)
- **Permissions**:
  - Mark attendance
  - View students
  - View classrooms
- **Login Domain**: `{school-slug}.xyz.com`
- **schoolId**: Specific school ID

### JWT Token Structure

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "SCHOOL_ADMIN",
  "schoolId": "school-uuid-here",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### RBAC Implementation

**Guards:**
- `JwtAuthGuard`: Validates JWT token
- `RolesGuard`: Checks user role
- `SchoolGuard`: Ensures schoolId scoping

**Decorators:**
- `@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')`: Role-based access
- `@CurrentUser()`: Extract user from request
- `@CurrentSchool()`: Extract schoolId from request

**Authorization Flow:**
```
Request → JwtAuthGuard → RolesGuard → SchoolGuard → Controller
```

---

## 🗄️ Database Schema Design

### Core Principles

1. **Every tenant data table contains `schoolId`**
2. **Global tables** (like `School`, `User`) may have nullable `schoolId`
3. **Foreign keys** must respect tenant boundaries
4. **Indexes** on `schoolId` for performance
5. **Composite indexes** on `(schoolId, id)` for frequent queries

### Schema Overview

```
┌─────────────┐
│   School    │ ← Tenant Table (No schoolId)
│  (Tenant)   │
└──────┬──────┘
       │
       │ schoolId FK
       ├────────────────┬──────────────┬───────────────┐
       │                │              │               │
┌──────▼──────┐  ┌──────▼──────┐  ┌───▼────────┐  ┌──▼──────┐
│    User     │  │   Teacher   │  │  Classroom │  │ Student │
│             │  │             │  │            │  │         │
└─────────────┘  └─────────────┘  └────┬───────┘  └────┬────┘
                                       │               │
                                       └───────┬───────┘
                                               │
                                        ┌──────▼──────┐
                                        │ Attendance  │
                                        │             │
                                        └─────────────┘
```

### Table Descriptions

#### School (Tenant Master)
```sql
- id: UUID (PK)
- name: String
- slug: String (UNIQUE) -- Used for subdomain
- email: String
- phone: String (optional)
- address: Text (optional)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### User (Multi-role)
```sql
- id: UUID (PK)
- email: String (UNIQUE)
- password: String (hashed)
- name: String
- role: Enum (SUPER_ADMIN, SCHOOL_ADMIN, TEACHER)
- schoolId: UUID (FK to School) -- NULL for SUPER_ADMIN
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### Teacher
```sql
- id: UUID (PK)
- userId: UUID (FK to User)
- name: String
- designation: String
- phone: String (optional)
- schoolId: UUID (FK to School) ← MUST HAVE
- createdAt: DateTime
- updatedAt: DateTime
```

#### Classroom
```sql
- id: UUID (PK)
- name: String (e.g., "Class 10")
- section: String (e.g., "A")
- schoolId: UUID (FK to School) ← MUST HAVE
- createdAt: DateTime
- updatedAt: DateTime
```

#### Student
```sql
- id: UUID (PK)
- name: String
- rollNumber: String
- classroomId: UUID (FK to Classroom)
- schoolId: UUID (FK to School) ← MUST HAVE
- email: String (optional)
- phone: String (optional)
- createdAt: DateTime
- updatedAt: DateTime
```

#### Attendance
```sql
- id: UUID (PK)
- studentId: UUID (FK to Student)
- date: Date
- status: Enum (PRESENT, ABSENT, LATE)
- remarks: Text (optional)
- markedBy: UUID (FK to User)
- schoolId: UUID (FK to School) ← MUST HAVE
- createdAt: DateTime
- updatedAt: DateTime

UNIQUE: (studentId, date, schoolId) -- One attendance per student per day
```

### Indexes Strategy

**Critical Indexes:**
```sql
-- Performance for tenant filtering
CREATE INDEX idx_teacher_school ON Teacher(schoolId);
CREATE INDEX idx_student_school ON Student(schoolId);
CREATE INDEX idx_classroom_school ON Classroom(schoolId);
CREATE INDEX idx_attendance_school ON Attendance(schoolId);

-- Composite indexes for frequent queries
CREATE INDEX idx_student_school_classroom ON Student(schoolId, classroomId);
CREATE INDEX idx_attendance_school_date ON Attendance(schoolId, date);
CREATE INDEX idx_attendance_school_student ON Attendance(schoolId, studentId);

-- Unique constraints
CREATE UNIQUE INDEX idx_school_slug ON School(slug);
CREATE UNIQUE INDEX idx_user_email ON User(email);
```

---

## 🔄 Request Lifecycle (End-to-End)

### Example: Get Students List

**Request:**
```
GET https://abc.xyz.com/api/students
Authorization: Bearer <jwt_token>
```

**Step-by-Step Flow:**

1. **DNS Resolution**
   - Browser resolves `abc.xyz.com` to backend server IP

2. **NestJS Receives Request**
   - Request hits the application

3. **Middleware: Tenant Resolution**
   ```typescript
   // Extract subdomain
   const hostname = request.hostname; // "abc.xyz.com"
   const parts = hostname.split('.');
   const subdomain = parts[0]; // "abc"
   
   // Lookup school
   const school = await prisma.school.findUnique({
     where: { slug: subdomain }
   });
   
   // Attach to request
   request.school = school;
   request.schoolId = school.id;
   ```

4. **Guard: JWT Authentication**
   - Validates JWT token
   - Extracts user info

5. **Guard: Role Authorization**
   - Checks if user has required role

6. **Guard: School Verification**
   - Ensures user belongs to the school (for non-SUPER_ADMIN)
   - Validates `user.schoolId === request.schoolId`

7. **Controller**
   ```typescript
   @Get()
   async getStudents(@CurrentSchool() schoolId: string) {
     return this.studentsService.findAll(schoolId);
   }
   ```

8. **Service Layer**
   ```typescript
   async findAll(schoolId: string) {
     return this.prisma.student.findMany({
       where: { schoolId },
       include: { classroom: true }
     });
   }
   ```

9. **Prisma Query**
   ```sql
   SELECT * FROM students 
   WHERE schoolId = 'abc-school-uuid'
   ```

10. **Response**
    - Filtered data sent back to client

---

## 🛡️ Security & Data Isolation

### Critical Security Measures

#### 1. Automatic Tenant Scoping
- **All queries MUST include `schoolId`**
- Enforced at service layer
- No direct Prisma access without schoolId

#### 2. Cross-Tenant Prevention
```typescript
// ❌ VULNERABLE - No schoolId check
async getStudent(id: string) {
  return this.prisma.student.findUnique({ where: { id } });
}

// ✅ SECURE - schoolId scoped
async getStudent(id: string, schoolId: string) {
  return this.prisma.student.findUnique({ 
    where: { id, schoolId } 
  });
}
```

#### 3. JWT Validation
- Token contains `schoolId`
- Compared against subdomain-resolved `schoolId`
- Mismatch = 403 Forbidden

#### 4. Role-Based Restrictions
- SUPER_ADMIN: Can bypass `schoolId` checks
- SCHOOL_ADMIN/TEACHER: Must match `schoolId`

#### 5. Input Validation
- Validate all inputs with class-validator
- Prevent SQL injection via Prisma (ORM protection)

#### 6. Foreign Key Constraints
- Ensure relationships respect tenant boundaries
- Student can only belong to Classroom in same school

---

## 🗑️ School Deletion (Safe Cascade)

### Deletion Strategy

**Important:** Deleting a school must remove all related data safely.

**Option 1: Soft Delete (Recommended)**
```typescript
async deleteSchool(schoolId: string) {
  return this.prisma.school.update({
    where: { id: schoolId },
    data: { isActive: false, deletedAt: new Date() }
  });
}
```

**Option 2: Hard Delete (Cascade)**
```typescript
async deleteSchool(schoolId: string) {
  // Delete in order (dependencies first)
  await this.prisma.attendance.deleteMany({ where: { schoolId } });
  await this.prisma.student.deleteMany({ where: { schoolId } });
  await this.prisma.classroom.deleteMany({ where: { schoolId } });
  await this.prisma.teacher.deleteMany({ where: { schoolId } });
  await this.prisma.user.deleteMany({ where: { schoolId } });
  await this.prisma.school.delete({ where: { id: schoolId } });
}
```

**Prisma Schema Cascade:**
```prisma
model School {
  id       String    @id @default(uuid())
  students Student[] // Will cascade on delete
  teachers Teacher[] // Will cascade on delete
}

model Student {
  id       String @id @default(uuid())
  school   School @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId String
}
```

---

## 📂 Backend Folder Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── schools/
│   │   │   ├── schools.controller.ts
│   │   │   ├── schools.service.ts
│   │   │   ├── schools.module.ts
│   │   │   └── dto/
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── teachers/
│   │   │   ├── teachers.controller.ts
│   │   │   ├── teachers.service.ts
│   │   │   └── teachers.module.ts
│   │   ├── students/
│   │   │   ├── students.controller.ts
│   │   │   ├── students.service.ts
│   │   │   └── students.module.ts
│   │   ├── classrooms/
│   │   │   ├── classrooms.controller.ts
│   │   │   ├── classrooms.service.ts
│   │   │   └── classrooms.module.ts
│   │   └── attendance/
│   │       ├── attendance.controller.ts
│   │       ├── attendance.service.ts
│   │       └── attendance.module.ts
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── school.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-school.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── middleware/
│   │   │   └── tenant-resolution.middleware.ts
│   │   ├── interfaces/
│   │   │   ├── user.interface.ts
│   │   │   └── school.interface.ts
│   │   └── enums/
│   │       ├── role.enum.ts
│   │       └── attendance-status.enum.ts
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── config/
│   │   └── configuration.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 🎨 Frontend Folder Structure (Next.js + shadcn)

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (super-admin)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── schools/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   └── [id]/
│   │   └── layout.tsx
│   ├── (school)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── teachers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── students/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── classrooms/
│   │   │   └── page.tsx
│   │   ├── attendance/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layouts/
│   │   ├── super-admin-layout.tsx
│   │   └── school-admin-layout.tsx
│   ├── forms/
│   │   ├── school-form.tsx
│   │   ├── teacher-form.tsx
│   │   └── student-form.tsx
│   └── tables/
│       ├── schools-table.tsx
│       ├── teachers-table.tsx
│       └── students-table.tsx
├── lib/
│   ├── api/
│   │   ├── axios.ts
│   │   ├── auth.api.ts
│   │   ├── schools.api.ts
│   │   ├── teachers.api.ts
│   │   └── students.api.ts
│   ├── query/
│   │   └── query-client.ts
│   ├── store/
│   │   └── auth.store.ts
│   └── utils.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-schools.ts
│   └── use-tenant.ts
├── types/
│   ├── auth.types.ts
│   ├── school.types.ts
│   └── api.types.ts
├── .env.local
├── next.config.js
├── tailwind.config.js
├── components.json (shadcn)
└── package.json
```

---

## 🚀 Deployment Considerations

### Production Checklist

1. **DNS Wildcard Setup**
   - Configure `*.xyz.com` → Load Balancer/Server

2. **Environment Variables**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `DOMAIN` (e.g., xyz.com)

3. **Database**
   - Enable connection pooling
   - Set up regular backups
   - Monitor query performance

4. **Backend**
   - Enable CORS for subdomains
   - Rate limiting
   - Helmet.js for security headers

5. **Frontend**
   - Build optimized bundle
   - CDN for static assets
   - Enable SSR where needed

6. **SSL/TLS**
   - Wildcard certificate for `*.xyz.com`

---

## 🔍 Testing Strategy

### Unit Tests
- Service layer methods
- Tenant resolution logic
- RBAC guards

### Integration Tests
- API endpoints with different roles
- Cross-tenant data isolation
- Subdomain resolution

### Security Tests
- Attempt cross-school data access
- Token manipulation tests
- SQL injection prevention

---

## 📊 Performance Optimization

1. **Database Indexes** on `schoolId`
2. **Query Optimization** with proper includes
3. **Caching** (Redis for session/school data)
4. **Pagination** for large datasets
5. **Lazy Loading** in frontend
6. **API Response Compression**

---

## 🎯 Scalability Considerations

- **Horizontal Scaling**: Multiple backend instances behind load balancer
- **Database Sharding**: If needed later (shard by schoolId)
- **Caching Layer**: Redis for frequently accessed school data
- **CDN**: For static frontend assets
- **Queue System**: For async tasks (bulk operations)

---

## 📚 Key Takeaways

✅ **Single Database** with logical tenant separation  
✅ **Subdomain-based** tenant resolution  
✅ **schoolId scoping** on ALL queries  
✅ **Role-based access** control (RBAC)  
✅ **JWT authentication** with tenant context  
✅ **Data isolation** enforced at application layer  
✅ **Clean architecture** for maintainability  

---

**Document Version**: 1.0  
**Last Updated**: February 2026
