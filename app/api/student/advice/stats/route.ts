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

    // Get student
    const student = await db.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get advice stats
    const totalAdvice = await db.advice.count({
      where: {
        OR: [
          { isGeneral: true },
          { 
            subject: {
              discipline: {
                name: student.discipline,                
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({
      totalAdvice,
      aiReady: totalAdvice >= 5, // AI works better with more data
      themesCount: Math.min(8, Math.floor(totalAdvice / 3)),
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error fetching advice stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}