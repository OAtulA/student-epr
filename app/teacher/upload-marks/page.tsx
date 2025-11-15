"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeacherSubject {
  id: string;
  batch: string;
  startRoll: number;
  endRoll: number;
  subject: {
    id: string;
    code: string;
    name: string;
    discipline: {
      name: string;
    };
  };
}

interface Student {
  id: string;
  enrollNo: string;
  name: string;
  rollNumber: number;
}

interface MarksData {
  studentId: string;
  teacherSubjectId: string;
  midSem?: number;
  endSem?: number;
  total?: number;
}

export default function UploadMarksPage() {
  const [assignments, setAssignments] = useState<TeacherSubject[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<MarksData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("mid");

  // Debug logs
  useEffect(() => {
    console.log("📊 marksData updated:", marksData);
  }, [marksData]);

  useEffect(() => {
    console.log("👥 students updated:", students);
  }, [students]);

  const fetchStudents = useCallback(async () => {
    if (!selectedAssignment) return;

    console.log("🔄 Fetching students for assignment:", selectedAssignment);
    
    try {
      const response = await fetch(
        `/api/teacher/students?assignmentId=${selectedAssignment}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Students fetched:", data.students);
        setStudents(data.students);
        
        // Initialize empty marks data first
        const initialMarks = data.students.map((student: Student) => ({
          studentId: student.id,
          teacherSubjectId: selectedAssignment,
          midSem: undefined,
          endSem: undefined,
          total: undefined,
        }));
        console.log("📝 Initial marks data:", initialMarks);
        setMarksData(initialMarks);
        
        // Then fetch existing marks
        await fetchExistingMarks();
      } else {
        console.error("❌ Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, [selectedAssignment]);

  const fetchExistingMarks = async () => {
    if (!selectedAssignment) return;

    console.log("🔄 Fetching existing marks for assignment:", selectedAssignment);
    
    try {
      const response = await fetch(
        `/api/teacher/marks?assignmentId=${selectedAssignment}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Existing marks fetched:", data.marks);
        
        if (data.marks && data.marks.length > 0) {
          // Update marks data with existing values
          setMarksData(prev => 
            prev.map(mark => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const existingMark = data.marks.find((m: any) => m.studentId === mark.studentId);
              if (existingMark) {
                console.log("🔄 Updating mark for student:", mark.studentId, "with:", existingMark);
                return {
                  ...mark,
                  midSem: existingMark.midSem ?? undefined,
                  endSem: existingMark.endSem ?? undefined,
                  total: existingMark.total ?? undefined,
                };
              }
              return mark;
            })
          );
        }
      } else {
        console.log("ℹ️ No existing marks found");
      }
    } catch (error) {
      console.error("Error fetching existing marks:", error);
    }
  };

  const fetchAssignments = useCallback(async () => {
    try {
      console.log("🔄 Fetching assignments");
      const response = await fetch("/api/teacher/assignments");
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Assignments fetched:", data.assignments);
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    if (selectedAssignment) {
      console.log("🎯 Assignment selected:", selectedAssignment);
      fetchStudents();
    }
  }, [selectedAssignment]);

  function handleMarksChange(studentId: string, field: string, value: string) {
    console.log("✏️ Mark change:", { studentId, field, value });
    
    const numericValue = value === "" ? undefined : parseFloat(value);
    console.log("📊 Numeric value:", numericValue);

    setMarksData((prev) =>
      prev.map((mark) => {
        if (mark.studentId === studentId) {
          const updatedMark = {
            ...mark,
            [field]: numericValue,
          };
          
          // Calculate total
          if (activeTab === "mid") {
            updatedMark.total = updatedMark.midSem;
          } else if (activeTab === "end") {
            updatedMark.total = 
              updatedMark.midSem !== undefined && updatedMark.endSem !== undefined 
                ? updatedMark.midSem + updatedMark.endSem 
                : undefined;
          }
          
          console.log("🔄 Updated mark:", updatedMark);
          return updatedMark;
        }
        return mark;
      })
    );
  }

  async function handleSubmit() {
    if (!selectedAssignment) return;

    console.log("🚀 Submitting marks:", { marksData, activeTab });

    // Validate based on active tab
    let incompleteMarks: MarksData[] = [];
    
    if (activeTab === "mid") {
      incompleteMarks = marksData.filter(
        (mark) => mark.midSem === undefined || mark.midSem === null
      );
    } else if (activeTab === "end") {
      incompleteMarks = marksData.filter(
        (mark) => mark.endSem === undefined || mark.endSem === null
      );
    }

    console.log("📋 Incomplete marks:", incompleteMarks);

    if (incompleteMarks.length > 0) {
      alert(`Please fill all ${activeTab}-semester marks for all students before submitting.`);
      return;
    }

    setIsLoading(true);
    try {
      console.log("📤 Sending API request...");
      
      const response = await fetch("/api/teacher/marks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          marks: marksData,
          updateType: activeTab
        }),
      });

      console.log("📥 API Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ API Success:", result);
        alert(`${activeTab === 'mid' ? 'Mid-Semester' : 'End-Semester'} marks uploaded successfully!`);
        
        // Refresh existing marks
        await fetchExistingMarks();
      } else {
        const error = await response.json();
        console.error("❌ API Error:", error);
        alert(error.error || "Failed to upload marks");
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("Failed to upload marks");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedAssignmentObj = assignments.find(
    (a) => a.id === selectedAssignment
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Marks</h1>
        <p className="text-muted-foreground">
          Upload mid-semester (25) and end-semester (75) marks for your students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Assignment</CardTitle>
          <CardDescription>
            Choose the subject and batch to upload marks for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignment">Teaching Assignment</Label>
              <Select
                value={selectedAssignment}
                onValueChange={(value) => {
                  console.log("🔄 Assignment changed to:", value);
                  setSelectedAssignment(value);
                  setActiveTab("mid");
                  setStudents([]);
                  setMarksData([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject and batch" />
                </SelectTrigger>
                <SelectContent>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.subject.code} - {assignment.subject.name} (
                      {assignment.subject.discipline.name})
                      <br />
                      <span className="text-sm text-muted-foreground">
                        Batch: {assignment.batch} | Rolls:{" "}
                        {assignment.startRoll}-{assignment.endRoll}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedAssignmentObj && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Marks</CardTitle>
            <CardDescription>
              Enter marks for students in {selectedAssignmentObj.subject.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mid">Mid-Semester Marks</TabsTrigger>
                <TabsTrigger value="end">End-Semester Marks</TabsTrigger>
              </TabsList>

              <TabsContent value="mid" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Enrollment</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Mid Sem (25)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const mark = marksData.find(
                          (m) => m.studentId === student.id
                        );
                        console.log("📋 Rendering student:", student.id, "mark:", mark);
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.rollNumber}
                            </TableCell>
                            <TableCell>{student.enrollNo}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="25"
                                step="0.5"
                                placeholder="0-25"
                                value={mark?.midSem ?? ""}
                                onChange={(e) => {
                                  console.log("📝 Input change:", e.target.value);
                                  handleMarksChange(
                                    student.id,
                                    "midSem",
                                    e.target.value
                                  );
                                }}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              {mark?.midSem !== undefined ? (
                                <span className="text-green-600 text-sm">✓ Entered: {mark.midSem}</span>
                              ) : (
                                <span className="text-gray-400 text-sm">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    You can upload mid-semester marks now and end-semester marks later.
                  </div>
                  <Button onClick={handleSubmit} disabled={isLoading} size="lg">
                    {isLoading ? "Uploading..." : "Upload Mid-Sem Marks"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="end" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Enrollment</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Mid Sem (25)</TableHead>
                        <TableHead>End Sem (75)</TableHead>
                        <TableHead>Total (100)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const mark = marksData.find(
                          (m) => m.studentId === student.id
                        );
                        const hasMidSem = mark?.midSem !== undefined;
                        const hasEndSem = mark?.endSem !== undefined;
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.rollNumber}
                            </TableCell>
                            <TableCell>{student.enrollNo}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="25"
                                value={mark?.midSem ?? ""}
                                disabled
                                className="w-20 bg-muted"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="75"
                                step="0.5"
                                placeholder="0-75"
                                value={mark?.endSem ?? ""}
                                onChange={(e) =>
                                  handleMarksChange(
                                    student.id,
                                    "endSem",
                                    e.target.value
                                  )
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={mark?.total ?? ""}
                                disabled
                                className="w-20 bg-muted"
                              />
                            </TableCell>
                            <TableCell>
                              {hasMidSem && hasEndSem ? (
                                <span className="text-green-600 text-sm">✓ Complete</span>
                              ) : hasMidSem ? (
                                <span className="text-blue-600 text-sm">Mid Done</span>
                              ) : (
                                <span className="text-gray-400 text-sm">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Complete the final marks by adding end-semester marks.
                  </div>
                  <Button onClick={handleSubmit} disabled={isLoading} size="lg">
                    {isLoading ? "Uploading..." : "Upload End-Sem Marks"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}