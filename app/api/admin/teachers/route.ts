import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    //    @ts-expect-error user role exists
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teachers = await db.teacher.findMany({
      select: {
        id: true,
        teacherId: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
