import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthSession } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session:AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student to know their discipline
    const student = await db.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get advice relevant to the student's discipline + general advice
    const advice = await db.advice.findMany({
      where: {
        OR: [
          { isGeneral: true },
          {
            subject: {
              discipline: {
                is: {
                  name: student.discipline,
                },
              },
            },
          },
        ],
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            name: true,
            batch: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get unique subjects and batches for filters
    const subjects = Array.from(new Set(
      advice
        .filter(a => !a.isGeneral && a.subject)
        .map(a => a.subject!.name)
    )).sort();

    const batches = Array.from(new Set(
      advice.map(a => a.student.batch)
    )).sort().reverse();

    return NextResponse.json({
      advice: advice.map(item => ({
        ...item,
        likes: Math.floor(Math.random() * 50), // Mock likes for now
        isLiked: Math.random() > 0.7, // Mock like status
      })),
      subjects,
      batches,
      summary: {
        totalAdvice: advice.length,
        generalAdvice: advice.filter(a => a.isGeneral).length,
        subjectAdvice: advice.filter(a => !a.isGeneral).length,
      },
    });

  } catch (error) {
    console.error("Error fetching advice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session:AuthSession|null = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { advice, isGeneral, subjectId } = await request.json();

    if (!advice || advice.trim().length < 10) {
      return NextResponse.json(
        { error: "Advice must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Get student
    const student = await db.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Create advice
    const newAdvice = await db.advice.create({
      data: {
        advice: advice.trim(),
        isGeneral,
        studentId: student.id,
        subjectId: isGeneral ? null : subjectId,
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            name: true,
            batch: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Advice submitted successfully",
      advice: newAdvice,
    });

  } catch (error) {
    console.error("Error submitting advice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}