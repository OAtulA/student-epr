import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthSession } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const session: AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { marks, updateType } = json;

    console.log("📥 Received marks data:", { marks, updateType });

    // Get teacher
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Process each mark
    const results = [];
    for (const markData of marks) {
      console.log("🔄 Processing mark:", markData);

      // Verify assignment belongs to teacher
      const assignment = await db.teacherSubject.findUnique({
        where: { id: markData.teacherSubjectId },
      });

      if (!assignment || assignment.teacherId !== teacher.id) {
        console.log("❌ Unauthorized assignment:", markData.teacherSubjectId);
        continue; // Skip this mark
      }

      // Calculate total if both marks are present
      let total = undefined;
      if (markData.midSem !== undefined && markData.endSem !== undefined) {
        total = markData.midSem + markData.endSem;
      } else if (updateType === "mid" && markData.midSem !== undefined) {
        total = markData.midSem; // For mid-sem only, total is just midSem
      }

      console.log("🧮 Calculated total:", total);

      // Upsert the mark
      const result = await db.marks.upsert({
        where: {
          studentId_teacherSubjectId: {
            studentId: markData.studentId,
            teacherSubjectId: markData.teacherSubjectId,
          },
        },
        update: {
          // Update only provided fields
          ...(markData.midSem !== undefined && { midSem: markData.midSem }),
          ...(markData.endSem !== undefined && { endSem: markData.endSem }),
          ...(total !== undefined && { total }),
        },
        create: {
          studentId: markData.studentId,
          teacherSubjectId: markData.teacherSubjectId,
          midSem: markData.midSem,
          endSem: markData.endSem,
          total,
        },
        include: {
          student: {
            select: {
              name: true,
              enrollNo: true,
            },
          },
        },
      });

      results.push(result);
      console.log("✅ Mark saved:", result);
    }

    return NextResponse.json({
      message: `Marks uploaded successfully (${updateType}-sem)`,
      marks: results,
    });
  } catch (error) {
    console.error("❌ Error uploading marks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session:AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    console.log("📥 Fetching marks for assignment:", assignmentId);

    // Get teacher
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      teacherSubject: {
        teacherId: teacher.id,
      },
    };

    if (assignmentId) {
      whereClause.teacherSubjectId = assignmentId;
    }

    const marks = await db.marks.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            name: true,
            enrollNo: true,
            batch: true,
            discipline: true,
          },
        },
        teacherSubject: {
          include: {
            subject: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log("✅ Marks fetched:", marks.length);

    return NextResponse.json({ marks });
  } catch (error) {
    console.error("Error fetching marks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}