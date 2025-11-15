import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSubjectSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-expect-error user role exists
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();

    // Validate with Zod
    const validatedData = createSubjectSchema.parse(json);

    // Check if subject code already exists
    const existingSubject = await db.subject.findUnique({
      where: { code: validatedData.code },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "Subject with this code already exists" },
        { status: 400 }
      );
    }

    // Create subject
    const subject = await db.subject.create({
      data: {
        code: validatedData.code,
        name: validatedData.name,
        semester: validatedData.semester,
        disciplineId: validatedData.disciplineId,
      },
      include: {
        discipline: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ subject });
  } catch (error) {
    console.error("Error creating subject:", error);

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
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjects = await db.subject.findMany({
      include: {
        discipline: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          discipline: {
            name: "asc",
          },
        },
        {
          semester: "asc",
        },
        {
          code: "asc",
        },
      ],
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
