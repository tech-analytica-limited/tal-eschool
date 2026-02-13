# Frontend - TAL-Eschool

Next.js frontend for TAL-Eschool multi-tenant school management system.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Access: http://localhost:3001

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form + Zod

## Project Structure

```
app/
  ├── login/              # Login page
  ├── super-admin/        # Super Admin dashboard & schools
  │   ├── profile/        # Super Admin profile
  │   └── schools/        # Schools management
  └── dashboard/          # School Admin/Teacher dashboard
      ├── teachers/       # Teachers management
      ├── students/       # Students management
      ├── classrooms/     # Classrooms management
      ├── attendance/     # Attendance tracking
      └── profile/        # User profile

lib/
  ├── api/               # API client services
  ├── api-client.ts      # Axios instance
  ├── types.ts           # TypeScript types
  └── stores/            # Zustand stores
```

## Available Features

✅ Login with JWT authentication  
✅ Super Admin dashboard & schools management  
✅ School dashboard with statistics  
✅ Teachers CRUD  
✅ Students CRUD  
✅ Classrooms CRUD  
✅ Attendance tracking (single + bulk)  
✅ Profile pages  

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
```
