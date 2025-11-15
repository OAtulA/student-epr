import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { marksSchema, uploadMarksSchema } from "@/lib/validations/schemas";
import { AuthSession } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const session: AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();

    // Validate with Zod
    const validatedData = uploadMarksSchema.parse(json);

    // Get teacher
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Verify that the teacher owns all the assignments being modified
    for (const markData of validatedData.marks) {
      const assignment = await db.teacherSubject.findUnique({
        where: { id: markData.teacherSubjectId },
      });

      if (!assignment || assignment.teacherId !== teacher.id) {
        return NextResponse.json(
          { error: "Unauthorized to modify marks for this assignment" },
          { status: 401 }
        );
      }

      // Verify student exists and is in the correct batch/discipline
      const student = await db.student.findUnique({
        where: { id: markData.studentId },
        include: {
          user: {
            select: {
              role: true,
            },
          },
        },
      });

      if (!student || student.user.role !== "STUDENT") {
        return NextResponse.json(
          { error: "Invalid student" },
          { status: 400 }
        );
      }
    }

    // Use transaction to ensure all marks are created/updated
    const results = await db.$transaction(
      validatedData.marks.map((markData) =>
        db.marks.upsert({
          where: {
            studentId_teacherSubjectId: {
              studentId: markData.studentId,
              teacherSubjectId: markData.teacherSubjectId,
            },
          },
          update: {
            midSem: markData.midSem,
            endSem: markData.endSem,
            internal: markData.internal,
            total: markData.total,
          },
          create: {
            studentId: markData.studentId,
            teacherSubjectId: markData.teacherSubjectId,
            midSem: markData.midSem,
            endSem: markData.endSem,
            internal: markData.internal,
            total: markData.total,
          },
          include: {
            student: {
              select: {
                name: true,
                enrollNo: true,
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
        })
      )
    );

    return NextResponse.json({
      message: "Marks uploaded successfully",
      marks: results,
    });
  } catch (error) {
    console.error("Error uploading marks:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid marks data provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session: AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

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
    //   orderBy: {
    //     updatedAt: "desc",
    //   },
      take: 50, // Limit to recent marks
    });

    return NextResponse.json({ marks });
  } catch (error) {
    console.error("Error fetching marks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}