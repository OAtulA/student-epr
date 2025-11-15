// app/api/teacher/assignments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthSession } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session: AuthSession | null = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teacher ID from user
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get teacher's assignments
    const assignments = await db.teacherSubject.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        subject: {
          include: {
            discipline: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          batch: "desc",
        },
        {
          subject: {
            code: "asc",
          },
        },
      ],
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching teacher assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}