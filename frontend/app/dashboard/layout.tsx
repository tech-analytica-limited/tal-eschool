'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GraduationCap, LogOut, User, Users, BookOpen, ClipboardCheck } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  useEffect(() => {
    if (!mounted) return;
    
    console.log('Dashboard Layout - Auth check:', { isAuthenticated, user: user?.email });
    
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
    } else if (user.role === 'SUPER_ADMIN') {
      console.log('Super admin detected, redirecting');
      router.push('/super-admin');
    }
  }, [isAuthenticated, user, router, mounted]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role === 'SUPER_ADMIN') {
    return null;
  }

  const initials = user.email.substring(0, 2).toUpperCase();
  const isAdmin = user.role === 'SCHOOL_ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">EasySchool</h1>
            <span className="ml-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {user.role === 'SCHOOL_ADMIN' ? 'School Admin' : 'Teacher'}
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            {isAdmin && (
              <>
                <Link href="/dashboard/teachers">
                  <Button variant="ghost">
                    <Users className="mr-2 h-4 w-4" />
                    Teachers
                  </Button>
                </Link>
                <Link href="/dashboard/classrooms">
                  <Button variant="ghost">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Classrooms
                  </Button>
                </Link>
              </>
            )}
            <Link href="/dashboard/students">
              <Button variant="ghost">
                <GraduationCap className="mr-2 h-4 w-4" />
                Students
              </Button>
            </Link>
            <Link href="/dashboard/attendance">
              <Button variant="ghost">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Attendance
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
