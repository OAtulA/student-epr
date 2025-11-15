import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthSession } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try { 
    const session: AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teacher
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get teacher's assignments
    const assignments = await db.teacherSubject.findMany({
      where: { teacherId: teacher.id },
      include: {
        subject: {
          include: {
            discipline: true,
          },
        },
      },
    });

    console.log(`📊 Teacher has ${assignments.length} assignments`);

    // Get ALL students (for now, we'll filter later)
    const allStudents = await db.student.findMany({
      select: {
        id: true,
        name: true,
        enrollNo: true,
        batch: true,
        discipline: true,
      },
      orderBy: {
        enrollNo: 'asc',
      },
    });

    console.log(`👥 Total students in system: ${allStudents.length}`);

    // Create student map
    const studentMap = new Map();

    // For each student, check if they belong to any of the teacher's assignments
    for (const student of allStudents) {
      const rollNumber = extractRollNumber(student.enrollNo);
      
      // Find assignments where this student belongs
      const studentAssignments = [];
      
      for (const assignment of assignments) {
        // Check if student matches assignment criteria
        const matchesBatch = student.batch === assignment.batch;
        const matchesDiscipline = student.discipline === assignment.subject.discipline?.name;
        const inRollRange = rollNumber >= assignment.startRoll && rollNumber <= assignment.endRoll;
        
        if (matchesBatch && matchesDiscipline && inRollRange) {
          // Find marks for this student in this assignment
          const marks = await db.marks.findUnique({
            where: {
              studentId_teacherSubjectId: {
                studentId: student.id,
                teacherSubjectId: assignment.id,
              },
            },
          });

          let status: "completed" | "partial" | "pending" = "pending";
          if (marks?.midSem !== null && marks?.endSem !== null) {
            status = "completed";
          } else if (marks?.midSem !== null || marks?.endSem !== null) {
            status = "partial";
          }

          studentAssignments.push({
            id: assignment.id,
            subject: assignment.subject.name,
            subjectCode: assignment.subject.code,
            batch: assignment.batch,
            midSem: marks?.midSem || undefined,
            endSem: marks?.endSem || undefined,
            total: marks?.total || undefined,
            status: status,
          });
        }
      }

      // Only include students who have at least one assignment with this teacher
      if (studentAssignments.length > 0) {
        studentMap.set(student.id, {
          id: student.id,
          name: student.name,
          enrollNo: student.enrollNo,
          rollNumber: rollNumber,
          batch: student.batch,
          discipline: student.discipline,
          assignments: studentAssignments,
        });
      }
    }

    const students = Array.from(studentMap.values())
      .sort((a, b) => a.rollNumber - b.rollNumber);

    console.log(`✅ Final result: ${students.length} students with assignments`);

    return NextResponse.json({
      students: students,
      summary: {
        totalStudents: students.length,
        totalAssignments: assignments.length,
      }
    });

  } catch (error) {
    console.error("Error in students-all API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function extractRollNumber(enrollNo: string): number {
  const firstThreeDigits = enrollNo.substring(0, 3);
  const rollNumber = parseInt(firstThreeDigits);
  return isNaN(rollNumber) ? 0 : rollNumber;
}