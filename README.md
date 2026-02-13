# TAL-Eschool - Multi-Tenant School Management System

Complete SaaS platform for school management with subdomain-based multi-tenancy.

**Status**: ✅ Production Ready | Backend: 100% | Frontend: 95%

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Docker)
- Git

### Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd tal-eschool

# 2. Start database (Docker)
docker run -d --name multi-tenent \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 49920:5432 \
  postgres:17

# 3. Setup Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Terminal 1: Start backend (port 3000)
npm run start:dev

# 4. Setup Frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env.local

# Terminal 2: Start frontend (port 3001)
npm run dev
```

### Access
- Frontend: http://localhost:3001
- Backend: http://localhost:3000/api

### Test Accounts
```
Super Admin: superadmin@xyz.com / Admin@123
School Admin: admin@abc.com / Admin@123
Teacher: teacher1@abc.com / Teacher@123
```

---

## 🐳 Docker Deployment (Production)

### Docker Images
```
Backend:  techanalytica/tal-eschool-be:latest (Port: 37862)
Frontend: techanalytica/tal-eschool-fe:latest (Port: 37861)
Database: 31.97.190.200:37860

Note: CORS is open for all origins (demo configuration)
```

### Before Deployment: Run Migrations

```bash
cd backend

# Run migration script
./migrate-production.sh

# Or manually:
export DATABASE_URL="postgresql://postgres:postgres@31.97.190.200:37860/postgres?schema=public"
npx prisma migrate deploy
npx prisma db seed
```

### Deploy with Portainer

1. **Login to Portainer** → Stacks → Add Stack → Name: `tal-eschool`

2. **Paste this configuration:**

```yaml
version: '3.8'

services:
  backend:
    image: techanalytica/tal-eschool-be:latest
    container_name: tal-eschool-backend
    ports:
      - "37862:37862"
    environment:
      - NODE_ENV=production
      - PORT=37862
      - DATABASE_URL=postgresql://postgres:postgres@31.97.190.200:37860/postgres?schema=public
      - JWT_SECRET=CHANGE_THIS_NOW_USE_SECURE_RANDOM_STRING
    restart: unless-stopped

  frontend:
    image: techanalytica/tal-eschool-fe:latest
    container_name: tal-eschool-frontend
    ports:
      - "37861:37861"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://31.97.190.200:37862/api
    restart: unless-stopped
```

3. **Deploy** → Wait for images to pull
Paste Docker Compose**
   - Copy content from `docker-compose.yml`
   - Or use the template below:

```yaml
version: '3.8'

services:
  backend:
    image: techanalytica/tal-eschool-be:latest
    container_name: tal-eschool-backend
    ports:
      - "37862:37862"
    environment:
      - NODE_ENV=production
      - PORT=37862
      - DATABASE_URL=postgresql://postgres:postgres@31.97.190.200:37860/postgres?schema=public
      - JWT_SECRET=CHANGE_THIS_NOW_USE_SECURE_RANDOM_STRING
    restart: unless-stopped

  frontend:
    image: techanalytica/tal-eschool-fe:latest
    container_name: tal-eschool-frontend
    ports:
      - "37861:37861"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://31.97.190.200:37862/api
    restart: unless-stopped
```

4. **
4. **Run migrations (one-time):**
   - In Portainer: Containers → tal-eschool-backend → Console → `/bin/sh`
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. **Access:** http://31.97.190.200:37861

**⚠️ SECURITY:** Generate secure JWT secret:
```bash
openssl rand -base64 32
```
Update `JWT_SECRET` in stack configuration.

---

## 📚 Features

### Core Features (✅ Complete)
- Multi-tenant architecture with subdomain routing
- JWT authentication & role-based access control
- School management (create, edit, activate/deactivate)
- Teacher management (full CRUD)
- Student management (full CRUD with parent info)
- Classroom management (capacity tracking)
- Attendance tracking (single + bulk marking)
- Dashboard with real-time statistics
- Profile management for all roles

### Pending Features (See TODO.md)
- Advanced reports (PDF/Excel export)
- Fee management module
- Parent portal
- Email notifications
- Exam & grading system
- File uploads

---

## 🏗️ Architecture

### Multi-Tenancy
- Single database with logical isolation via `schoolId`
- Subdomain-based tenant resolution
- Application-level data isolation

### Tech Stack
**Backend:** NestJS, PostgreSQL, Prisma, JWT  
**Frontend:** Next.js 14, TypeScript, Tailwind, shadcn/ui

### Database Schema
```
School → User (Super Admin, School Admin, Teacher)
School → Teacher → Attendance
School → Student → Attendance  
School → Classroom → Student
```

---

## 🔧 Development

### Useful Commands

**Backend:**
```bash
npm run start:dev        # Development server
npm run build           # Build for production
npx prisma studio       # Database GUI
npx prisma migrate dev  # Run migrations
npx prisma db seed      # Seed demo data
```

**Frontend:**
```bash
npm run dev            # Development server
npm run build          # Build for production
npm run lint           # Run linting
```

**Docker:**
```bash
# Build images
docker build -t techanalytica/tal-eschool-be:latest ./backend
docker build -t techanalytica/tal-eschool-fe:latest ./frontend

# Push to Docker Hub
docker push techanalytica/tal-eschool-be:latest
docker push techanalytica/tal-eschool-fe:latest

# Pull and deploy
docker-compose pull
docker-compose up -d
```

---

## 📊 API Endpoints

### Authentication
```
POST /api/auth/login         # User login
GET  /api/auth/me           # Get current user
```

### Schools (Super Admin only)
```
GET    /api/schools          # List all schools
POST   /api/schools          # Create school
GET    /api/schools/:id      # Get school details
PATCH  /api/schools/:id      # Update school
DELETE /api/schools/:id      # Delete school
```

### Teachers (School Admin)
```
GET    /api/teachers         # List teachers
POST   /api/teachers         # Create teacher
GET    /api/teachers/:id     # Get teacher
PATCH  /api/teachers/:id     # Update teacher
DELETE /api/teachers/:id     # Delete teacher
```

### Students (School Admin/Teacher)
```
GET    /api/students         # List students
POST   /api/students         # Create student
GET    /api/students/:id     # Get student
PATCH  /api/students/:id     # Update student
DELETE /api/students/:id     # Delete student
```

### Classrooms (School Admin)
```
GET    /api/classrooms       # List classrooms
POST   /api/classrooms       # Create classroom
GET    /api/classrooms/:id   # Get classroom
PATCH  /api/classrooms/:id   # Update classroom
DELETE /api/classrooms/:id   # Delete classroom
```

### Attendance (Teacher)
```
GET    /api/attendance       # List attendance records
POST   /api/attendance       # Mark attendance
POST   /api/attendance/bulk  # Bulk mark attendance
PATCH  /api/attendance/:id   # Update record
DELETE /api/attendance/:id   # Delete record
```

### Dashboard
```
GET /api/dashboard/stats     # Role-based statistics
```

---

## 🐛 Troubleshooting

### Can't connect to database
```bash
# Check PostgreSQL is running
docker ps | grep multi-tenent

# Restart database
docker restart multi-tenent
```

### Port already in use
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (frontend)
lsof -ti:3001 | xargs kill -9
```

### Prisma errors
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npx prisma migrate dev
```

### Docker container won't start
```bash
# View logs
docker logs tal-eschool-backend
docker logs tal-eschool-frontend

# Check environment variables
docker exec tal-eschool-backend env
```

---

## 📖 Additional Documentation

- **TODO.md** - Detailed roadmap and pending features
- **ARCHITECTURE.md** - In-depth system design and architecture
- **Postman Collection** - `TAL-Eschool-API.postman_collection.json`

---

## 📞 Support

Database migrations: `npx prisma migrate dev`  
Seed demo data: `npx prisma db seed`  
API testing: Import Postman collection  

---

**Built with ❤️ for efficient school management**
