'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log('Login successful, data:', data);
      
      // Set auth immediately
      setAuth(data.user, data.accessToken);
      
      // Verify storage
      const storedToken = localStorage.getItem('accessToken');
      console.log('Token stored:', storedToken ? 'YES' : 'NO');
      
      toast.success('Login successful!');
      setIsLoading(false);
      
      // Redirect based on role
      if (data.user.role === 'SUPER_ADMIN') {
        console.log('Redirecting to super-admin');
        router.push('/super-admin');
      } else {
        console.log('Redirecting to dashboard');
        router.push('/dashboard');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      toast.error(error?.response?.data?.message || 'Login failed');
      setIsLoading(false);
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setIsLoading(true);
    loginMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            EasySchool
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p className="font-medium">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Super Admin:</strong> superadmin@xyz.com / Admin@123</p>
              <p><strong>ABC Admin:</strong> admin@abc.com / Admin@123</p>
              <p><strong>ABC Teacher:</strong> teacher1@abc.com / Teacher@123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
