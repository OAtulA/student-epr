import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-expect-error role exists on user
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Discipline name is required" },
        { status: 400 }
      );
    }

    // Check if discipline already exists
    const existingDiscipline = await db.discipline.findUnique({
      where: { name },
    });

    if (existingDiscipline) {
      return NextResponse.json(
        { error: "Discipline already exists" },
        { status: 400 }
      );
    }

    const discipline = await db.discipline.create({
      data: {
        name: name.toUpperCase(),
      },
    });

    return NextResponse.json({ discipline });
  } catch (error) {
    console.error("Error creating discipline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-expect-error role exists on user
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const disciplines = await db.discipline.findMany({
      include: {
        subjects: {
          orderBy: {
            semester: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ disciplines });
  } catch (error) {
    console.error("Error fetching disciplines:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
