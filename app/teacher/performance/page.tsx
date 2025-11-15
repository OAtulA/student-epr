// app/teacher/performance/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceDemo } from "@/components/teacher/performance-demo";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface PerformanceData {
  assignmentId: string;
  assignmentName: string;
  averageMarks: number;
  totalStudents: number;
  passedStudents: number;
  distinctionStudents: number;
  subjectWise: SubjectPerformance[];
  markDistribution: MarkDistribution[];
  batchComparison: BatchComparison[];
  lowPerformers?: LowPerformer[];
}

interface SubjectPerformance {
  subject: string;
  code: string;
  average: number;
  highest: number;
  lowest: number;
  passPercentage: number;
}

interface MarkDistribution {
  range: string;
  count: number;
}

interface BatchComparison {
  batch: string;
  average: number;
  subject: string;
}

interface LowPerformer {
  name: string;
  enrollNo: string;
  marks: number;
  subject: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function PerformanceAnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchPerformanceDataHelper() {
    if (!selectedAssignment) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/teacher/performance?assignmentId=${selectedAssignment}`
      );
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data.performance);
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchPerformanceData = useCallback(fetchPerformanceDataHelper, [
    selectedAssignment,
  ]);
  useEffect(() => {
    if (selectedAssignment) {
      fetchPerformanceData();
    }
  }, [fetchPerformanceData, selectedAssignment]);

  async function fetchAssignments() {
    try {
      const response = await fetch("/api/teacher/assignments");
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectedAssignmentObj = assignments.find(
    (a) => a.id === selectedAssignment
  );

  const renderLivePerformance = () => {
    if (!performanceData) return null;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Marks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performanceData.averageMarks.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Overall class average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performanceData.totalStudents}
              </div>
              <p className="text-xs text-muted-foreground">
                In this assignment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pass Percentage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  (performanceData.passedStudents /
                    performanceData.totalStudents) *
                  100
                ).toFixed(1)}
                %
              </div>
              <p className="text-xs text-muted-foreground">Students passed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distinction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performanceData.distinctionStudents}
              </div>
              <p className="text-xs text-muted-foreground">
                Students &gt;= 75%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Marks Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Marks Distribution</CardTitle>
              <CardDescription>
                How students are distributed across mark ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.markDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="Number of Students"
                    fill="#0088FE"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pass/Fail Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Result Overview</CardTitle>
              <CardDescription>Pass vs Fail distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Passed", value: performanceData.passedStudents },
                      {
                        name: "Failed",
                        value:
                          performanceData.totalStudents -
                          performanceData.passedStudents,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent! * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Performance Comparison */}
          {performanceData.subjectWise.length > 1 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Subject Performance Comparison</CardTitle>
                <CardDescription>
                  Average marks across different subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData.subjectWise}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="code" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="average"
                      name="Average Marks"
                      fill="#8884D8"
                    />
                    <Bar
                      dataKey="highest"
                      name="Highest Marks"
                      fill="#00C49F"
                    />
                    <Bar dataKey="lowest" name="Lowest Marks" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Batch Comparison */}
          {performanceData.batchComparison.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Batch Performance Comparison</CardTitle>
                <CardDescription>
                  Compare performance across different batches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData.batchComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="batch" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="average"
                      name="Average Marks"
                      stroke="#0088FE"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Low Performers */}
        {performanceData.lowPerformers &&
          performanceData.lowPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Students Needing Attention</CardTitle>
                <CardDescription>
                  Students scoring below 40% in any subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.lowPerformers.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="shrink-0">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-red-600">
                              !
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.enrollNo} • {student.subject}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {student.marks}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Needs improvement
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Detailed Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Subject Performance</CardTitle>
            <CardDescription>
              In-depth analysis of each subject&apos;s performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Subject</th>
                    <th className="p-3 text-center font-medium">Average</th>
                    <th className="p-3 text-center font-medium">Highest</th>
                    <th className="p-3 text-center font-medium">Lowest</th>
                    <th className="p-3 text-center font-medium">Pass %</th>
                    <th className="p-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                   {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                  {performanceData.subjectWise.map((subject, index) => (
                    <tr key={subject.code} className="border-b">
                      <td className="p-3">
                        <div className="font-medium">{subject.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {subject.subject}
                        </div>
                      </td>
                      <td className="p-3 text-center font-medium">
                        {subject.average.toFixed(1)}
                      </td>
                      <td className="p-3 text-center text-green-600 font-medium">
                        {subject.highest}
                      </td>
                      <td className="p-3 text-center text-red-600 font-medium">
                        {subject.lowest}
                      </td>
                      <td className="p-3 text-center">
                        {subject.passPercentage.toFixed(1)}%
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subject.average >= 70
                              ? "bg-green-100 text-green-800"
                              : subject.average >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {subject.average >= 70
                            ? "Excellent"
                            : subject.average >= 60
                            ? "Good"
                            : "Needs Attention"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <p className="text-muted-foreground">
          Analyze student performance with detailed charts and insights
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList>
          <TabsTrigger value="demo">Demo View</TabsTrigger>
          <TabsTrigger value="live">Live Data</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demo Performance Dashboard</CardTitle>
              <CardDescription>
                This shows sample data and charts. Switch to &quot;Live
                Data&quot; to see your actual student performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceDemo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Assignment</CardTitle>
              <CardDescription>
                Choose a subject and batch to view performance analytics
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
                          {assignment.subject.code} - {assignment.subject.name}{" "}
                          ({assignment.subject.discipline.name})
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

          {isLoading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">Loading performance data...</div>
              </CardContent>
            </Card>
          )}

          {performanceData && !isLoading && renderLivePerformance()}

          {!selectedAssignment && !isLoading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  Select an assignment to view live performance data
                </div>
              </CardContent>
            </Card>
          )}

          {selectedAssignment && !performanceData && !isLoading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  No performance data available for this assignment. Try
                  uploading marks first.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
