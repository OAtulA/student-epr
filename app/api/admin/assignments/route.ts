import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignTeacherSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-expect-error user role exists
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();

    // Validate with Zod
    const validatedData = assignTeacherSchema.parse(json);

    // Check if assignment already exists for this roll range
    const existingAssignment = await db.teacherSubject.findFirst({
      where: {
        subjectId: validatedData.subjectId,
        batch: validatedData.batch,
        OR: [
          {
            AND: [
              { startRoll: { lte: validatedData.startRoll } },
              { endRoll: { gte: validatedData.startRoll } },
            ],
          },
          {
            AND: [
              { startRoll: { lte: validatedData.endRoll } },
              { endRoll: { gte: validatedData.endRoll } },
            ],
          },
        ],
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "This roll range is already assigned to another teacher" },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await db.teacherSubject.create({
      data: {
        teacherId: validatedData.teacherId,
        subjectId: validatedData.subjectId,
        batch: validatedData.batch,
        startRoll: validatedData.startRoll,
        endRoll: validatedData.endRoll,
      },
      include: {
        teacher: {
          select: {
            name: true,
            teacherId: true,
          },
        },
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
    });

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Error creating assignment:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-expect-error user role exists
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await db.teacherSubject.findMany({
      include: {
        teacher: {
          select: {
            name: true,
            teacherId: true,
          },
        },
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
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
