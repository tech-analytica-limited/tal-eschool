'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolsApi } from '@/lib/api/schools';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Eye, Edit, Trash2, Power } from 'lucide-react';
import type { School } from '@/lib/types';

const schoolSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

export default function SchoolsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  const { data: schoolsData, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => schoolsApi.getAll({ page: 1, limit: 100 }),
  });

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      slug: '',
      address: '',
      phone: '',
      email: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: schoolsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School created successfully');
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create school');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SchoolFormValues }) =>
      schoolsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School updated successfully');
      setEditingSchool(null);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update school');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: schoolsApi.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School status updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: schoolsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete school');
    },
  });

  const onSubmit = (values: SchoolFormValues) => {
    if (editingSchool) {
      updateMutation.mutate({ id: editingSchool.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    form.reset({
      name: school.name,
      slug: school.slug,
      address: school.address,
      phone: school.phone,
      email: school.email,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this school?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schools Management</h1>
          <p className="text-muted-foreground">
            Manage all schools in the system
          </p>
        </div>
        <Dialog open={isCreateOpen || !!editingSchool} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingSchool(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create School
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSchool ? 'Edit School' : 'Create New School'}
              </DialogTitle>
              <DialogDescription>
                {editingSchool
                  ? 'Update school information'
                  : 'Add a new school to the system'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC School" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (for subdomain)</FormLabel>
                      <FormControl>
                        <Input placeholder="abc-school" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@abcschool.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="123 School Street, City, State"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingSchool(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSchool ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Schools</CardTitle>
          <CardDescription>
            Total: {schoolsData?.total || 0} school(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : schoolsData && schoolsData.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolsData.data.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>
                      <code className="text-xs">{school.slug}</code>
                    </TableCell>
                    <TableCell>{school.email}</TableCell>
                    <TableCell>{school.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={school.isActive ? 'default' : 'secondary'}
                      >
                        {school.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActiveMutation.mutate(school.id)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(school)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(school.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No schools found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
