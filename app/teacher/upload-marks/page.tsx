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
  internal?: number;
  total?: number;
}

export default function UploadMarksPage() {
  const [assignments, setAssignments] = useState<TeacherSubject[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<MarksData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (!selectedAssignment) return;

    try {
      const response = await fetch(
        `/api/teacher/students?assignmentId=${selectedAssignment}`
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);

        // Initialize marks data
        const initialMarks = data.students.map((student: Student) => ({
          studentId: student.id,
          teacherSubjectId: selectedAssignment,
          midSem: undefined,
          endSem: undefined,
          internal: undefined,
          total: undefined,
        }));
        setMarksData(initialMarks);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, [selectedAssignment]);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/assignments");
      if (response.ok) {
        const data = await response.json();
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
      fetchStudents();
    }
  }, [fetchStudents, selectedAssignment]);

  function handleMarksChange(studentId: string, field: string, value: string) {
    const numericValue = value === "" ? undefined : parseFloat(value);

    setMarksData((prev) =>
      prev.map((mark) =>
        mark.studentId === studentId
          ? {
              ...mark,
              [field]: numericValue,
              total: calculateTotal({ ...mark, [field]: numericValue }),
            }
          : mark
      )
    );
  }

  function calculateTotal(marks: MarksData): number | undefined {
    const { midSem, endSem, internal } = marks;
    if (
      midSem === undefined ||
      endSem === undefined ||
      internal === undefined
    ) {
      return undefined;
    }
    return midSem + endSem + internal;
  }

  async function handleSubmit() {
    if (!selectedAssignment) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/teacher/marks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ marks: marksData }),
      });

      if (response.ok) {
        alert("Marks uploaded successfully!");
        // Reset form
        setSelectedAssignment("");
        setStudents([]);
        setMarksData([]);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upload marks");
      }
    } catch (error) {
      console.error("Error uploading marks:", error);
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
          Upload mid-semester and end-semester marks for your students
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
                onValueChange={setSelectedAssignment}
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mid Sem (30)</TableHead>
                    <TableHead>End Sem (50)</TableHead>
                    <TableHead>Internal (20)</TableHead>
                    <TableHead>Total (100)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const mark = marksData.find(
                      (m) => m.studentId === student.id
                    );
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
                            max="30"
                            placeholder="0-30"
                            value={mark?.midSem || ""}
                            onChange={(e) =>
                              handleMarksChange(
                                student.id,
                                "midSem",
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
                            max="50"
                            placeholder="0-50"
                            value={mark?.endSem || ""}
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
                            max="20"
                            placeholder="0-20"
                            value={mark?.internal || ""}
                            onChange={(e) =>
                              handleMarksChange(
                                student.id,
                                "internal",
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
                            placeholder="Total"
                            value={mark?.total || ""}
                            disabled
                            className="w-20 bg-muted"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSubmit} disabled={isLoading} size="lg">
                {isLoading ? "Uploading..." : "Upload Marks"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
