'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomsApi } from '@/lib/api/classrooms';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import type { Classroom } from '@/lib/types';

const classroomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  section: z.string().min(1, 'Section is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
});

type ClassroomFormValues = z.infer<typeof classroomSchema>;

export default function ClassroomsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  const { data: classroomsData, isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomsApi.getAll({ page: 1, limit: 100 }),
  });

  const form = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: '',
      section: '',
      capacity: 30,
    },
  });

  const createMutation = useMutation({
    mutationFn: classroomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Classroom created successfully');
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create classroom');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClassroomFormValues> }) =>
      classroomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Classroom updated successfully');
      setEditingClassroom(null);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update classroom');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: classroomsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Classroom deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete classroom');
    },
  });

  const onSubmit = (data: ClassroomFormValues) => {
    if (editingClassroom) {
      updateMutation.mutate({ id: editingClassroom.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    form.reset({
      name: classroom.name,
      section: classroom.section,
      capacity: classroom.capacity,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this classroom?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsCreateOpen(false);
    setEditingClassroom(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Classrooms</h2>
          <p className="text-muted-foreground">
            Manage your school classrooms
          </p>
        </div>
        <Dialog
          open={isCreateOpen || !!editingClassroom}
          onOpenChange={(open) => {
            if (!open) handleDialogClose();
            else setIsCreateOpen(true);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Classroom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClassroom ? 'Edit Classroom' : 'Create New Classroom'}
              </DialogTitle>
              <DialogDescription>
                {editingClassroom
                  ? 'Update classroom information'
                  : 'Add a new classroom to your school'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Grade 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Input placeholder="A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingClassroom ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Classrooms</CardTitle>
          <CardDescription>
            {classroomsData?.meta.total || 0} total classrooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Loading classrooms...</p>
            </div>
          ) : classroomsData?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground">No classrooms found</p>
              <p className="text-sm text-muted-foreground">
                Create your first classroom to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classroomsData?.data.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">{classroom.name}</TableCell>
                    <TableCell>{classroom.section}</TableCell>
                    <TableCell>{classroom.capacity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{classroom._count?.students || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(classroom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(classroom.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
