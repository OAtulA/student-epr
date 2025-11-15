
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthSession } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session: AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Get the assignment to get roll range, batch, and discipline
    const assignment = await db.teacherSubject.findUnique({
      where: { id: assignmentId },
      include: {
        subject: {
          include: {
            discipline: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Get teacher to verify ownership
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher || assignment.teacherId !== teacher.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get discipline name from the subject
    const disciplineName = assignment.subject.discipline.name;

    // Get all students in the batch and discipline
    const allStudents = await db.student.findMany({
      where: {
        batch: assignment.batch,
        discipline: disciplineName,
      },
      select: {
        id: true,
        enrollNo: true,
        name: true,
      },
      orderBy: {
        enrollNo: "asc",
      },
    });

    // Extract roll numbers from enrollNo - FIRST 3 DIGITS are roll number
    const studentsInRange = allStudents
      .map((student) => {
        // Extract FIRST 3 digits from enrollNo as roll number
        const firstThreeDigits = student.enrollNo.substring(0, 3);
        const rollNumber = parseInt(firstThreeDigits);
        
        return {
          ...student,
          rollNumber: isNaN(rollNumber) ? 0 : rollNumber,
        };
      })
      .filter((student) => {
        return (
          student.rollNumber >= assignment.startRoll &&
          student.rollNumber <= assignment.endRoll
        );
      })
      .sort((a, b) => a.rollNumber - b.rollNumber);

    // If no students found in the roll range, return empty array with warning
    if (studentsInRange.length === 0) {
      console.warn(`No students found in roll range ${assignment.startRoll}-${assignment.endRoll} for batch ${assignment.batch}, discipline ${disciplineName}`);
    }

    return NextResponse.json({ students: studentsInRange });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}