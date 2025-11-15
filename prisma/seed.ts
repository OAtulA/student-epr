import { db } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Create disciplines
  const disciplines = ["CSE", "IT", "ECE", "EEE", "ML", "DS"];

  for (const disciplineName of disciplines) {
    await db.discipline.upsert({
      where: { name: disciplineName },
      update: {},
      create: { name: disciplineName },
    });
  }
  console.log("✅ Disciplines created");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  await db.user.upsert({
    where: { email: "admin@epr.com" },
    update: {},
    create: {
      email: "admin@epr.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created (admin@epr.com / admin123)");

  // Create sample subjects for CSE
  const cseDiscipline = await db.discipline.findUnique({
    where: { name: "CSE" },
  });

  if (cseDiscipline) {
    const cseSubjects = [
      { code: "CSE101", name: "Programming Fundamentals", semester: 1 },
      { code: "CSE102", name: "Data Structures", semester: 2 },
      { code: "CSE201", name: "Algorithms", semester: 3 },
      { code: "CSE202", name: "Database Systems", semester: 4 },
    ];

    for (const subject of cseSubjects) {
      await db.subject.upsert({
        where: { code: subject.code },
        update: {},
        create: {
          code: subject.code,
          name: subject.name,
          semester: subject.semester,
          disciplineId: cseDiscipline.id,
        },
      });
    }
    console.log("✅ Sample CSE subjects created");
  }

  // Create sample teacher
  const hashedTeacherPassword = await bcrypt.hash("teacher123", 12);
  const teacherUser = await db.user.upsert({
    where: { email: "teacher@epr.com" },
    update: {},
    create: {
      email: "teacher@epr.com",
      password: hashedTeacherPassword,
      role: "TEACHER",
      teacher: {
        create: {
          teacherId: "T001",
          name: "Dr. Alice Johnson",
          joiningDate: new Date("2020-01-15"),
        },
      },
    },
  });
  console.log("✅ Sample teacher created (teacher@epr.com / teacher123)");

  // Create sample student
  const hashedStudentPassword = await bcrypt.hash("student123", 12);
  const studentUser = await db.user.upsert({
    where: { email: "student@epr.com" },
    update: {},
    create: {
      email: "student@epr.com",
      password: hashedStudentPassword,
      role: "STUDENT",
      student: {
        create: {
          enrollNo: "2022001",
          name: "John Doe",
          batch: "2022-2026",
          discipline: "CSE",
        },
      },
    },
  });
  console.log("✅ Sample student created (student@epr.com / student123)");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
