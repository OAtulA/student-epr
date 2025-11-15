"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle, TrendingDown, Users, BookOpen } from "lucide-react";

interface LowPerformer {
  id: string;
  name: string;
  enrollNo: string;
  rollNumber: number;
  batch: string;
  discipline: string;
  subject: string;
  subjectCode: string;
  midSem?: number;
  endSem?: number;
  total: number;
  needsAttention: boolean;
  improvementNeeded: number; // Percentage improvement needed to reach 40%
}

interface LowPerformersData {
  lowPerformers: LowPerformer[];
  totalStudents: number;
  lowPerformerCount: number;
  averagePerformance: number;
  subjects: string[];
}

export default function LowPerformersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("all");
  const [lowPerformersData, setLowPerformersData] = useState<LowPerformersData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
// Update the fetchLowPerformers function in /app/teacher/low-performers/page.tsx
const fetchLowPerformers = useCallback(async () => {
  setIsLoading(true);
  try {
    console.log("🔄 Fetching low performers with filter:", selectedAssignment);
    
    const url = selectedAssignment === "all" 
      ? "/api/teacher/low-performers"
      : `/api/teacher/low-performers?assignmentId=${selectedAssignment}`;
    
    console.log("📡 API URL:", url);
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Low performers data received:", data);
      setLowPerformersData(data);
    } else {
      console.error("❌ Failed to fetch low performers");
      const error = await response.json();
      console.error("Error details:", error);
    }
  } catch (error) {
    console.error("❌ Network error fetching low performers:", error);
  } finally {
    setIsLoading(false);
  }
},[selectedAssignment]);
  //   const fetchLowPerformers = useCallback( async () => {
  //   setIsLoading(true);
  //   try {
  //     const url = selectedAssignment === "all" 
  //       ? "/api/teacher/low-performers"
  //       : `/api/teacher/low-performers?assignmentId=${selectedAssignment}`;
      
  //     const response = await fetch(url);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setLowPerformersData(data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching low performers:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // },[selectedAssignment]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (assignments.length > 0) {
      fetchLowPerformers();
    }
  }, [selectedAssignment, assignments, fetchLowPerformers]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/teacher/assignments");
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };



  const getPerformanceColor = (marks: number) => {
    if (marks < 20) return "text-red-600 bg-red-50";
    if (marks < 30) return "text-orange-600 bg-orange-50";
    return "text-yellow-600 bg-yellow-50";
  };

  const getImprovementText = (improvement: number) => {
    if (improvement > 30) return "Needs significant improvement";
    if (improvement > 15) return "Needs moderate improvement";
    return "Needs slight improvement";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Low Performers</h1>
        <p className="text-muted-foreground">
          Identify and support students who need extra attention
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Students</CardTitle>
          <CardDescription>
            Focus on specific subjects or view all low performers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignment">Subject Filter</Label>
              <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject to filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.subject.code} - {assignment.subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      {lowPerformersData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowPerformersData.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Across all assignments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Performers</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {lowPerformersData.lowPerformerCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Students below 40%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lowPerformersData.averagePerformance.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Class average
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((lowPerformersData.lowPerformerCount / lowPerformersData.totalStudents) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Percentage of low performers
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low Performers List */}
      <Card>
        <CardHeader>
          <CardTitle>Students Needing Attention</CardTitle>
          <CardDescription>
            Students scoring below 40% in one or more subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading low performers data...</div>
          ) : lowPerformersData && lowPerformersData.lowPerformers.length > 0 ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
              {lowPerformersData.lowPerformers.map((student, index) => (
                <div key={`${student.id}-${student.subjectCode}`} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="shrink-0">
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <Badge variant="outline" className="text-xs">
                          Roll: {student.rollNumber}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {student.enrollNo} • {student.batch} • {student.discipline}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm font-medium">{student.subject}</span>
                        <Badge variant="secondary" className="text-xs">
                          {student.subjectCode}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(student.total)}`}>
                      {student.total}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Needs +{student.improvementNeeded}% to pass
                    </div>
                    <div className="text-xs text-red-600">
                      {getImprovementText(student.improvementNeeded)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-600 mb-2">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Low Performers Found</h3>
              <p className="text-muted-foreground">
                Great job! All your students are performing well above the passing threshold.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      {lowPerformersData && lowPerformersData.lowPerformerCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Improvement Strategies</CardTitle>
            <CardDescription>
              Recommended actions to help low performing students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Extra Classes</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Schedule remedial classes focusing on fundamental concepts
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Peer Support</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pair with high-performing students for study groups
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium">Regular Assessments</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Conduct weekly quizzes to track improvement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}