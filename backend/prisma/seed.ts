import { PrismaClient, Role, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
  const hashedTeacherPassword = await bcrypt.hash('Teacher@123', 10);

  // 1. Create Super Admin (No school)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@xyz.com' },
    update: {},
    create: {
      email: 'superadmin@xyz.com',
      password: hashedAdminPassword,
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      schoolId: null,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // 2. Create Demo School 1: ABC School
  const abcSchool = await prisma.school.upsert({
    where: { slug: 'abc' },
    update: {},
    create: {
      name: 'ABC School',
      slug: 'abc',
      email: 'admin@abcschool.com',
      phone: '+1234567890',
      address: '123 Main St, City',
      isActive: true,
    },
  });

  console.log('✅ ABC School created:', abcSchool.slug);

  // 3. Create School Admin for ABC School
  const abcAdmin = await prisma.user.upsert({
    where: { email: 'admin@abc.com' },
    update: {},
    create: {
      email: 'admin@abc.com',
      password: hashedAdminPassword,
      name: 'ABC School Admin',
      role: Role.SCHOOL_ADMIN,
      schoolId: abcSchool.id,
    },
  });

  console.log('✅ ABC Admin created:', abcAdmin.email);

  // 4. Create Teacher for ABC School
  const abcTeacherUser = await prisma.user.upsert({
    where: { email: 'teacher1@abc.com' },
    update: {},
    create: {
      email: 'teacher1@abc.com',
      password: hashedTeacherPassword,
      name: 'John Doe',
      role: Role.TEACHER,
      schoolId: abcSchool.id,
    },
  });

  const abcTeacher = await prisma.teacher.upsert({
    where: { userId: abcTeacherUser.id },
    update: {},
    create: {
      userId: abcTeacherUser.id,
      name: 'John Doe',
      designation: 'Mathematics Teacher',
      phone: '+1234567891',
      schoolId: abcSchool.id,
    },
  });

  console.log('✅ ABC Teacher created:', abcTeacher.name);

  // 5. Create Classrooms for ABC School
  const class10A = await prisma.classroom.upsert({
    where: {
      name_section_schoolId: {
        name: 'Class 10',
        section: 'A',
        schoolId: abcSchool.id,
      },
    },
    update: {},
    create: {
      name: 'Class 10',
      section: 'A',
      schoolId: abcSchool.id,
    },
  });

  const class10B = await prisma.classroom.upsert({
    where: {
      name_section_schoolId: {
        name: 'Class 10',
        section: 'B',
        schoolId: abcSchool.id,
      },
    },
    update: {},
    create: {
      name: 'Class 10',
      section: 'B',
      schoolId: abcSchool.id,
    },
  });

  console.log('✅ Classrooms created: Class 10A, 10B');

  // 6. Create Students for ABC School
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.student.upsert({
      where: {
        rollNumber_schoolId: {
          rollNumber: `ABC${i.toString().padStart(3, '0')}`,
          schoolId: abcSchool.id,
        },
      },
      update: {},
      create: {
        name: `Student ${i}`,
        rollNumber: `ABC${i.toString().padStart(3, '0')}`,
        classroomId: i <= 3 ? class10A.id : class10B.id,
        schoolId: abcSchool.id,
        email: `student${i}@abc.com`,
      },
    });
    students.push(student);
  }

  console.log('✅ Students created: 5 students');

  // 7. Create Sample Attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const student of students) {
    await prisma.attendance.upsert({
      where: {
        studentId_date_schoolId: {
          studentId: student.id,
          date: today,
          schoolId: abcSchool.id,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        date: today,
        status: AttendanceStatus.PRESENT,
        markedBy: abcTeacherUser.id,
        schoolId: abcSchool.id,
      },
    });
  }

  console.log('✅ Attendance marked for today');

  // 8. Create Demo School 2: XYZ School
  const xyzSchool = await prisma.school.upsert({
    where: { slug: 'xyz-school' },
    update: {},
    create: {
      name: 'XYZ School',
      slug: 'xyz-school',
      email: 'admin@xyzschool.com',
      phone: '+1234567892',
      address: '456 Second St, City',
      isActive: true,
    },
  });

  console.log('✅ XYZ School created:', xyzSchool.slug);

  // 9. Create School Admin for XYZ School
  const xyzAdmin = await prisma.user.upsert({
    where: { email: 'admin@xyz-school.com' },
    update: {},
    create: {
      email: 'admin@xyz-school.com',
      password: hashedAdminPassword,
      name: 'XYZ School Admin',
      role: Role.SCHOOL_ADMIN,
      schoolId: xyzSchool.id,
    },
  });

  console.log('✅ XYZ Admin created:', xyzAdmin.email);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📝 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin:');
  console.log('  Email: superadmin@xyz.com');
  console.log('  Password: Admin@123');
  console.log('  Domain: xyz.com\n');
  console.log('ABC School Admin:');
  console.log('  Email: admin@abc.com');
  console.log('  Password: Admin@123');
  console.log('  Domain: abc.xyz.com\n');
  console.log('ABC School Teacher:');
  console.log('  Email: teacher1@abc.com');
  console.log('  Password: Teacher@123');
  console.log('  Domain: abc.xyz.com\n');
  console.log('XYZ School Admin:');
  console.log('  Email: admin@xyz-school.com');
  console.log('  Password: Admin@123');
  console.log('  Domain: xyz-school.xyz.com');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
