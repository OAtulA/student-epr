import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthSession } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session: AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student to know their discipline
    const student = await db.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get subjects for the student's discipline
    const subjects = await db.subject.findMany({
      where: {
        discipline: {
          name: student.discipline,
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        semester: true,
      },
      orderBy: [
        {
          semester: "asc",
        },
        {
          code: "asc",
        },
      ],
    });

    return NextResponse.json({
      subjects,
    });

  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}