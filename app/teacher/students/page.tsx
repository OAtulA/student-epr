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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users, BookOpen, Filter } from "lucide-react";

interface Student {
  id: string;
  name: string;
  enrollNo: string;
  rollNumber: number;
  batch: string;
  discipline: string;
  assignments: Assignment[];
}

interface Assignment {
  id: string;
  subject: string;
  subjectCode: string;
  midSem?: number;
  endSem?: number;
  total?: number;
  status: "completed" | "partial" | "pending";
}

export default function MyStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");

  const filterStudents = useCallback(() => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.enrollNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply batch filter
    if (batchFilter !== "all") {
      filtered = filtered.filter((student) => student.batch === batchFilter);
    }

    // Apply discipline filter
    if (disciplineFilter !== "all") {
      filtered = filtered.filter(
        (student) => student.discipline === disciplineFilter
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, batchFilter, disciplineFilter]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, batchFilter, disciplineFilter, filterStudents]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/teacher/students-all");
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
      pending: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge
        variant="secondary"
        className={variants[status as keyof typeof variants]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPerformanceColor = (marks?: number) => {
    if (!marks) return "text-gray-400";
    if (marks >= 75) return "text-green-600";
    if (marks >= 60) return "text-blue-600";
    if (marks >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const batches = Array.from(new Set(students.map((s) => s.batch)));
  const disciplines = Array.from(new Set(students.map((s) => s.discipline)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-muted-foreground">
          View all students assigned to you across different subjects and
          batches
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Batches</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
            <p className="text-xs text-muted-foreground">Different batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplines</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disciplines.length}</div>
            <p className="text-xs text-muted-foreground">
              Different disciplines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Students</CardTitle>
          <CardDescription>
            Search and filter your students by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discipline">Discipline</Label>
              <Select
                value={disciplineFilter}
                onValueChange={setDisciplineFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All disciplines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disciplines</SelectItem>
                  {disciplines.map((discipline) => (
                    <SelectItem key={discipline} value={discipline}>
                      {discipline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actions">Actions</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setBatchFilter("all");
                  setDisciplineFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>
            Detailed view of all students with their performance across subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading students data...</div>
          ) : filteredStudents.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.rollNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{student.name}</div>
                      </TableCell>
                      <TableCell>{student.enrollNo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.batch}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.discipline}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-xs">
                          {student.assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="truncate">
                                {assignment.subjectCode}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-xs font-medium ${getPerformanceColor(
                                    assignment.total
                                  )}`}
                                >
                                  {assignment.total
                                    ? `${assignment.total}%`
                                    : "-"}
                                </span>
                                {getStatusBadge(assignment.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {student.assignments.map((assignment) => (
                            <div key={assignment.id} className="text-xs">
                              <div className="flex justify-between">
                                <span>{assignment.subjectCode}:</span>
                                <span>
                                  M: {assignment.midSem ?? "-"} / E:{" "}
                                  {assignment.endSem ?? "-"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No Students Found</h3>
              <p className="text-muted-foreground">
                {students.length === 0
                  ? "You don't have any students assigned yet."
                  : "No students match your current filters."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
