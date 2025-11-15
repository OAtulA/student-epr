import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  createStudentSchema,
  createTeacherSchema,
} from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-expect-error session user role exists
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { role, ...data } = json;

    if (role === "STUDENT") {
      // Validate student data
      const validatedData = createStudentSchema.parse(data);

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }

      // Check if enrollment number exists
      const existingStudent = await db.student.findUnique({
        where: { enrollNo: validatedData.enrollNo },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: "Student with this enrollment number already exists" },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user and student
      const user = await db.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          role: "STUDENT",
          student: {
            create: {
              enrollNo: validatedData.enrollNo,
              name: validatedData.name,
              batch: validatedData.batch,
              discipline: validatedData.discipline,
            },
          },
        },
        include: {
          student: true,
        },
      });

      return NextResponse.json({ user });
    } else if (role === "TEACHER") {
      // Validate teacher data
      const validatedData = createTeacherSchema.parse(data);

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }

      // Check if teacher ID exists
      const existingTeacher = await db.teacher.findUnique({
        where: { teacherId: validatedData.teacherId },
      });

      if (existingTeacher) {
        return NextResponse.json(
          { error: "Teacher with this ID already exists" },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user and teacher
      const user = await db.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          role: "TEACHER",
          teacher: {
            create: {
              teacherId: validatedData.teacherId,
              name: validatedData.name,
              joiningDate: new Date(validatedData.joiningDate),
            },
          },
        },
        include: {
          teacher: true,
        },
      });

      return NextResponse.json({ user });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-expect-error session user role exists
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db.user.findMany({
      include: {
        student: true,
        teacher: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
