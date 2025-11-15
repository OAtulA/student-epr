/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/teacher/performance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthSession } from "@/types";

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

    let performanceData;

    if (assignmentId) {
      // Single assignment performance
      performanceData = await getAssignmentPerformance(assignmentId, teacher.id);
    } else {
      // Overall teacher performance across all assignments
      performanceData = await getOverallTeacherPerformance(teacher.id);
    }

    return NextResponse.json({ performance: performanceData });
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getAssignmentPerformance(assignmentId: string, teacherId: string) {
  // Verify assignment belongs to teacher
  const assignment = await db.teacherSubject.findUnique({
    where: { id: assignmentId },
    include: {
      subject: true,
      marks: {
        include: {
          student: true,
        },
      },
    },
  });

  if (!assignment || assignment.teacherId !== teacherId) {
    throw new Error("Unauthorized");
  }

  const marks = assignment.marks;
  const totalStudents = marks.length;

  if (totalStudents === 0) {
    return {
      assignmentId,
      assignmentName: `${assignment.subject.code} - ${assignment.subject.name}`,
      averageMarks: 0,
      totalStudents: 0,
      passedStudents: 0,
      distinctionStudents: 0,
      subjectWise: [],
      markDistribution: [],
      batchComparison: [],
    };
  }

  // Calculate averages and statistics
  const totalMarks = marks.reduce((sum, mark) => sum + (mark.total || 0), 0);
  const averageMarks = totalMarks / totalStudents;
  const passedStudents = marks.filter(mark => (mark.total || 0) >= 40).length;
  const distinctionStudents = marks.filter(mark => (mark.total || 0) >= 75).length;

  // Mark distribution (0-20, 21-40, 41-60, 61-80, 81-100)
  const markDistribution = [
    { range: "0-20", count: marks.filter(m => (m.total || 0) <= 20).length },
    { range: "21-40", count: marks.filter(m => (m.total || 0) > 20 && (m.total || 0) <= 40).length },
    { range: "41-60", count: marks.filter(m => (m.total || 0) > 40 && (m.total || 0) <= 60).length },
    { range: "61-80", count: marks.filter(m => (m.total || 0) > 60 && (m.total || 0) <= 80).length },
    { range: "81-100", count: marks.filter(m => (m.total || 0) > 80).length },
  ];

  // Subject-wise performance (for this single subject)
  const subjectWise = [{
    subject: assignment.subject.name,
    code: assignment.subject.code,
    average: averageMarks,
    highest: Math.max(...marks.map(m => m.total || 0)),
    lowest: Math.min(...marks.map(m => m.total || 0)),
    passPercentage: (passedStudents / totalStudents) * 100,
  }];

  // Get batch comparison data
  const batchComparison = await getBatchComparison(assignment.subject.id, teacherId);

  return {
    assignmentId,
    assignmentName: `${assignment.subject.code} - ${assignment.subject.name}`,
    averageMarks,
    totalStudents,
    passedStudents,
    distinctionStudents,
    subjectWise,
    markDistribution,
    batchComparison,
  };
}

async function getOverallTeacherPerformance(teacherId: string) {
  // Get all assignments for this teacher
  const assignments = await db.teacherSubject.findMany({
    where: { teacherId },
    include: {
      subject: true,
      marks: true,
    },
  });

  // Calculate overall statistics
  const allMarks = assignments.flatMap(assignment => assignment.marks);
  const totalStudents = allMarks.length;

  if (totalStudents === 0) {
    return {
      averageMarks: 0,
      totalStudents: 0,
      passedStudents: 0,
      distinctionStudents: 0,
      subjectWise: [],
      markDistribution: [],
      batchComparison: [],
    };
  }

  const totalMarks = allMarks.reduce((sum, mark) => sum + (mark.total || 0), 0);
  const averageMarks = totalMarks / totalStudents;
  const passedStudents = allMarks.filter(mark => (mark.total || 0) >= 40).length;
  const distinctionStudents = allMarks.filter(mark => (mark.total || 0) >= 75).length;

  // Mark distribution
  const markDistribution = [
    { range: "0-20", count: allMarks.filter(m => (m.total || 0) <= 20).length },
    { range: "21-40", count: allMarks.filter(m => (m.total || 0) > 20 && (m.total || 0) <= 40).length },
    { range: "41-60", count: allMarks.filter(m => (m.total || 0) > 40 && (m.total || 0) <= 60).length },
    { range: "61-80", count: allMarks.filter(m => (m.total || 0) > 60 && (m.total || 0) <= 80).length },
    { range: "81-100", count: allMarks.filter(m => (m.total || 0) > 80).length },
  ];

  // Subject-wise performance
  const subjectPerformanceMap = new Map();
  
  assignments.forEach(assignment => {
    const subjectMarks = assignment.marks;
    if (subjectMarks.length > 0) {
      const subjectKey = assignment.subject.code;
      if (!subjectPerformanceMap.has(subjectKey)) {
        subjectPerformanceMap.set(subjectKey, {
          subject: assignment.subject.name,
          code: assignment.subject.code,
          marks: [],
        });
      }
      subjectPerformanceMap.get(subjectKey).marks.push(...subjectMarks);
    }
  });

  const subjectWise = Array.from(subjectPerformanceMap.values()).map(data => {
    const marks = data.marks;
    const avg = marks.reduce((sum: number, mark: any) => sum + (mark.total || 0), 0) / marks.length;
    const passed = marks.filter((mark: any) => (mark.total || 0) >= 40).length;
    
    return {
      subject: data.subject,
      code: data.code,
      average: avg,
      highest: Math.max(...marks.map((m: any) => m.total || 0)),
      lowest: Math.min(...marks.map((m: any) => m.total || 0)),
      passPercentage: (passed / marks.length) * 100,
    };
  });

  // Batch comparison (simplified)
  const batchComparison = await getBatchComparisonForTeacher(teacherId);

  return {
    averageMarks,
    totalStudents,
    passedStudents,
    distinctionStudents,
    subjectWise,
    markDistribution,
    batchComparison,
  };
}

async function getBatchComparison(subjectId: string, teacherId: string) {
  const assignments = await db.teacherSubject.findMany({
    where: {
      teacherId,
      subjectId,
    },
    include: {
      marks: true,
      subject: true,
    },
  });

  return assignments.map(assignment => {
    const marks = assignment.marks;
    const average = marks.length > 0 
      ? marks.reduce((sum, mark) => sum + (mark.total || 0), 0) / marks.length 
      : 0;
    
    return {
      batch: assignment.batch,
      average: Math.round(average * 10) / 10,
      subject: assignment.subject.name,
    };
  });
}

async function getBatchComparisonForTeacher(teacherId: string) {
  const assignments = await db.teacherSubject.findMany({
    where: { teacherId },
    include: {
      marks: true,
      subject: true,
    },
  });

  const batchMap = new Map();
  
  assignments.forEach(assignment => {
    const marks = assignment.marks;
    if (marks.length > 0) {
      const average = marks.reduce((sum, mark) => sum + (mark.total || 0), 0) / marks.length;
      
      if (!batchMap.has(assignment.batch)) {
        batchMap.set(assignment.batch, {
          total: 0,
          count: 0,
        });
      }
      
      const batchData = batchMap.get(assignment.batch);
      batchData.total += average;
      batchData.count += 1;
    }
  });

  return Array.from(batchMap.entries()).map(([batch, data]) => ({
    batch,
    average: Math.round((data.total / data.count) * 10) / 10,
    subject: "Overall",
  }));
}