import { db } from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  console.log('Node env', process.env.NODE_ENV)
  // Clear existing data (optional - be careful in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Clearing existing data...')
    await db.advice.deleteMany()
    await db.marks.deleteMany()
    await db.teacherSubject.deleteMany()
    await db.subject.deleteMany()
    await db.student.deleteMany()
    await db.teacher.deleteMany()
    await db.user.deleteMany()
    await db.discipline.deleteMany()
  }

  // Create disciplines
  const disciplines = ['CSE', 'IT', 'ECE', 'EEE', 'ML', 'DS']
  
  for (const disciplineName of disciplines) {
    await db.discipline.upsert({
      where: { name: disciplineName },
      update: {},
      create: { name: disciplineName },
    })
  }
  console.log('✅ Disciplines created')

  // Get discipline IDs for subject creation
  const cseDiscipline = await db.discipline.findUnique({ where: { name: 'CSE' } })
  const itDiscipline = await db.discipline.findUnique({ where: { name: 'IT' } })
  const eceDiscipline = await db.discipline.findUnique({ where: { name: 'ECE' } })

  // Create sample subjects for different disciplines and semesters
  const subjects = [
    // CSE Subjects
    { code: 'CSE101', name: 'Programming Fundamentals', semester: 1, disciplineId: cseDiscipline!.id },
    { code: 'CSE102', name: 'Data Structures', semester: 2, disciplineId: cseDiscipline!.id },
    { code: 'CSE201', name: 'Algorithms', semester: 3, disciplineId: cseDiscipline!.id },
    { code: 'CSE202', name: 'Database Systems', semester: 4, disciplineId: cseDiscipline!.id },
    { code: 'CSE301', name: 'Operating Systems', semester: 5, disciplineId: cseDiscipline!.id },
    { code: 'CSE302', name: 'Computer Networks', semester: 6, disciplineId: cseDiscipline!.id },
    
    // IT Subjects (some same names but different discipline)
    { code: 'IT101', name: 'Programming Fundamentals', semester: 1, disciplineId: itDiscipline!.id },
    { code: 'IT102', name: 'Web Technologies', semester: 2, disciplineId: itDiscipline!.id },
    { code: 'IT201', name: 'Database Management', semester: 3, disciplineId: itDiscipline!.id },
    
    // ECE Subjects
    { code: 'ECE101', name: 'Basic Electronics', semester: 1, disciplineId: eceDiscipline!.id },
    { code: 'ECE102', name: 'Circuit Theory', semester: 2, disciplineId: eceDiscipline!.id },
    { code: 'ECE201', name: 'Digital Electronics', semester: 3, disciplineId: eceDiscipline!.id },
  ]

  for (const subject of subjects) {
    await db.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    })
  }
  console.log('✅ Sample subjects created')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  await db.user.upsert({
    where: { email: 'admin@epr.com' },
    update: {},
    create: {
      email: 'admin@epr.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created (admin@epr.com / admin123)')

  // Create sample teachers
  const hashedTeacherPassword = await bcrypt.hash('teacher123', 12)
  const teacherUser = await db.user.upsert({
    where: { email: 'teacher@epr.com' },
    update: {},
    create: {
      email: 'teacher@epr.com',
      password: hashedTeacherPassword,
      role: 'TEACHER',
      teacher: {
        create: {
          teacherId: 'T001',
          name: 'Dr. Alice Johnson',
          joiningDate: new Date('2020-01-15'),
        },
      },
    },
  })

  const teacherUser2 = await db.user.upsert({
    where: { email: 'teacher2@epr.com' },
    update: {},
    create: {
      email: 'teacher2@epr.com',
      password: hashedTeacherPassword,
      role: 'TEACHER',
      teacher: {
        create: {
          teacherId: 'T002',
          name: 'Prof. Robert Smith',
          joiningDate: new Date('2019-06-20'),
        },
      },
    },
  })
  console.log('✅ Sample teachers created (teacher@epr.com / teacher123)')

  // Create sample students
  const hashedStudentPassword = await bcrypt.hash('student123', 12)
  
  // CSE Students
  for (let i = 1; i <= 10; i++) {
    const enrollNo = `2022CSE${i.toString().padStart(3, '0')}`
    await db.user.upsert({
      where: { email: `student${i}@epr.com` },
      update: {},
      create: {
        email: `student${i}@epr.com`,
        password: hashedStudentPassword,
        role: 'STUDENT',
        student: {
          create: {
            enrollNo,
            name: `Student ${i}`,
            batch: '2022-2026',
            discipline: 'CSE',
          },
        },
      },
    })
  }

  // IT Students
  for (let i = 1; i <= 5; i++) {
    const enrollNo = `2022IT${i.toString().padStart(3, '0')}`
    await db.user.upsert({
      where: { email: `itstudent${i}@epr.com` },
      update: {},
      create: {
        email: `itstudent${i}@epr.com`,
        password: hashedStudentPassword,
        role: 'STUDENT',
        student: {
          create: {
            enrollNo,
            name: `IT Student ${i}`,
            batch: '2022-2026',
            discipline: 'IT',
          },
        },
      },
    })
  }
  console.log('✅ Sample students created (student1@epr.com / student123)')

  // Create sample teacher assignments
  const teacher1 = await db.teacher.findUnique({ where: { teacherId: 'T001' } })
  const teacher2 = await db.teacher.findUnique({ where: { teacherId: 'T002' } })
  const programmingSubject = await db.subject.findUnique({ where: { code: 'CSE101' } })
  const dsSubject = await db.subject.findUnique({ where: { code: 'CSE102' } })
  const algorithmsSubject = await db.subject.findUnique({ where: { code: 'CSE201' } })

  if (teacher1 && programmingSubject) {
    await db.teacherSubject.upsert({
      where: { 
        teacherId_subjectId_batch_startRoll_endRoll: {
          teacherId: teacher1.id,
          subjectId: programmingSubject.id,
          batch: '2022-2026',
          startRoll: 1,
          endRoll: 5
        }
      },
      update: {},
      create: {
        teacherId: teacher1.id,
        subjectId: programmingSubject.id,
        batch: '2022-2026',
        startRoll: 1,
        endRoll: 5
      },
    })
  }

  if (teacher2 && programmingSubject) {
    await db.teacherSubject.upsert({
      where: { 
        teacherId_subjectId_batch_startRoll_endRoll: {
          teacherId: teacher2.id,
          subjectId: programmingSubject.id,
          batch: '2022-2026',
          startRoll: 6,
          endRoll: 10
        }
      },
      update: {},
      create: {
        teacherId: teacher2.id,
        subjectId: programmingSubject.id,
        batch: '2022-2026',
        startRoll: 6,
        endRoll: 10
      },
    })
  }

  if (teacher1 && dsSubject) {
    await db.teacherSubject.upsert({
      where: { 
        teacherId_subjectId_batch_startRoll_endRoll: {
          teacherId: teacher1.id,
          subjectId: dsSubject.id,
          batch: '2022-2026',
          startRoll: 1,
          endRoll: 10
        }
      },
      update: {},
      create: {
        teacherId: teacher1.id,
        subjectId: dsSubject.id,
        batch: '2022-2026',
        startRoll: 1,
        endRoll: 10
      },
    })
  }
  console.log('✅ Sample teacher assignments created')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })