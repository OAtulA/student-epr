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

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    console.log("🔍 Low performers filter - assignmentId:", assignmentId);

    // Get teacher
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Build where clause for assignments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = { teacherId: teacher.id };

    // If assignmentId is specified and not "all", filter by it
    if (assignmentId && assignmentId !== "all") {
      whereClause.id = assignmentId;
      console.log("🎯 Filtering by assignment:", assignmentId);
    }

    // Get assignments for this teacher
    const assignments = await db.teacherSubject.findMany({
      where: whereClause,
      include: {
        subject: true,
        marks: {
          include: {
            student: true,
          },
        },
      },
    });

    console.log("📊 Found assignments:", assignments.length);

    // Collect all low performers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lowPerformers: any[] = [];
    let totalMarks = 0;
    let totalMarksCount = 0;
    let totalStudents = 0;

    assignments.forEach((assignment) => {
      console.log(
        `📝 Processing assignment: ${assignment.subject.code} with ${assignment.marks.length} marks`
      );

      assignment.marks.forEach((mark) => {
        const total = mark.total || 0;
        totalMarks += total;
        totalMarksCount++;

        // Consider students with less than 40% as low performers
        if (total < 40) {
          const improvementNeeded = Math.ceil(40 - total); // How much they need to reach 40%

          lowPerformers.push({
            id: mark.student.id,
            name: mark.student.name,
            enrollNo: mark.student.enrollNo,
            rollNumber: parseInt(mark.student.enrollNo.substring(0, 3)) || 0,
            batch: mark.student.batch,
            discipline: mark.student.discipline,
            subject: assignment.subject.name,
            subjectCode: assignment.subject.code,
            assignmentId: assignment.id,
            midSem: mark.midSem,
            endSem: mark.endSem,
            total: total,
            needsAttention: total < 30,
            improvementNeeded: improvementNeeded,
          });

          console.log(
            `⚠️ Low performer: ${mark.student.name} - ${total}% in ${assignment.subject.code}`
          );
        }
      });

      // Count total students for this assignment
      totalStudents += assignment.marks.length;
    });

    console.log("📈 Total low performers found:", lowPerformers.length);

    // Remove duplicates (students who are low performers in multiple subjects)
    const uniqueLowPerformers = lowPerformers.reduce((acc, current) => {
        const existing = acc.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) =>
          item.id === current.id && item.subjectCode === current.subjectCode
      );
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log("👥 Unique low performers:", uniqueLowPerformers.length);

    const averagePerformance =
      totalMarksCount > 0 ? totalMarks / totalMarksCount : 0;

    return NextResponse.json({
      lowPerformers: uniqueLowPerformers,
      totalStudents,
      lowPerformerCount: uniqueLowPerformers.length,
      averagePerformance,
      subjects: Array.from(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Set(uniqueLowPerformers.map((lp: any) => lp.subject))
      ),
      filteredBy:
        assignmentId === "all"
          ? "All Subjects"
          : assignments[0]?.subject?.name || "Unknown",
    });
  } catch (error) {
    console.error("❌ Error fetching low performers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
