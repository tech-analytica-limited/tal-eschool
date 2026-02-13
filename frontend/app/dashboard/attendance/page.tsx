'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/lib/api/attendance';
import { studentsApi } from '@/lib/api/students';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Calendar, Users } from 'lucide-react';
import type { AttendanceStatus } from '@/lib/types';

const attendanceSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
  remarks: z.string().optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', selectedDate, selectedClassroom],
    queryFn: () =>
      attendanceApi.getAll({
        page: 1,
        limit: 100,
        date: selectedDate,
        classroomId: selectedClassroom === 'all' ? undefined : selectedClassroom,
      }),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', selectedClassroom],
    queryFn: () =>
      studentsApi.getAll({
        page: 1,
        limit: 100,
        classroomId: selectedClassroom === 'all' ? undefined : selectedClassroom,
      }),
  });

  const { data: classroomsData } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomsApi.getAll({ page: 1, limit: 100 }),
  });

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      studentId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      remarks: '',
    },
  });

  const markMutation = useMutation({
    mutationFn: attendanceApi.mark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance marked successfully');
      setIsMarkOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark attendance');
    },
  });

  const bulkMarkMutation = useMutation({
    mutationFn: attendanceApi.markBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Bulk attendance marked successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark bulk attendance');
    },
  });

  const onSubmit = (data: AttendanceFormValues) => {
    markMutation.mutate(data);
  };

  const handleBulkMarkPresent = () => {
    if (!studentsData?.data || studentsData.data.length === 0) {
      toast.error('No students found for bulk marking');
      return;
    }

    const attendances = studentsData.data.map((student) => ({
      studentId: student.id,
      status: 'PRESENT' as AttendanceStatus,
    }));

    bulkMarkMutation.mutate({
      date: selectedDate,
      attendances,
    });
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Present
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            Absent
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
            Late
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">
            Mark and manage student attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkMarkPresent}>
            <Users className="mr-2 h-4 w-4" />
            Mark All Present
          </Button>
          <Dialog open={isMarkOpen} onOpenChange={setIsMarkOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogDescription>
                  Record attendance for a student
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {studentsData?.data.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.firstName} {student.lastName} -{' '}
                                {student.rollNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PRESENT">Present</SelectItem>
                            <SelectItem value="ABSENT">Absent</SelectItem>
                            <SelectItem value="LATE">Late</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes..."
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
                      onClick={() => setIsMarkOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={markMutation.isPending}>
                      Mark Attendance
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Classroom</label>
              <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Classrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classrooms</SelectItem>
                  {classroomsData?.data.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name} - {classroom.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {attendanceData?.total || 0} records for {selectedDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Loading attendance...</p>
            </div>
          ) : attendanceData?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No attendance records found</p>
              <p className="text-sm text-muted-foreground">
                Mark attendance to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData?.data.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.student
                        ? `${record.student.firstName} ${record.student.lastName}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{record.student?.rollNumber || 'N/A'}</TableCell>
                    <TableCell>
                      {record.student?.classroom
                        ? `${record.student.classroom.name} - ${record.student.classroom.section}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>{record.remarks || '-'}</TableCell>
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
