// components/teacher/performance-demo.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

// Demo data
const demoPerformanceData = {
  averageMarks: 68.5,
  totalStudents: 45,
  passedStudents: 38,
  distinctionStudents: 12,
  subjectWise: [
    { subject: 'Data Structures', code: 'CSE102', average: 72.3, highest: 95, lowest: 42, passPercentage: 88.9 },
    { subject: 'Algorithms', code: 'CSE201', average: 65.8, highest: 92, lowest: 35, passPercentage: 82.2 },
    { subject: 'Database Systems', code: 'CSE202', average: 70.1, highest: 96, lowest: 48, passPercentage: 86.7 },
    { subject: 'Operating Systems', code: 'CSE301', average: 63.2, highest: 89, lowest: 28, passPercentage: 77.8 },
  ],
  markDistribution: [
    { range: '0-20', count: 0 },
    { range: '21-40', count: 3 },
    { range: '41-60', count: 12 },
    { range: '61-80', count: 20 },
    { range: '81-100', count: 10 },
  ],
  batchComparison: [
    { batch: '2022-2026', average: 68.5, subject: 'Overall' },
    { batch: '2021-2025', average: 65.2, subject: 'Overall' },
    { batch: '2020-2024', average: 71.8, subject: 'Overall' },
    { batch: '2019-2023', average: 69.3, subject: 'Overall' },
  ],
  lowPerformers: [
    { name: 'Student 001', enrollNo: '0012022CSE', marks: 35, subject: 'Algorithms' },
    { name: 'Student 015', enrollNo: '0152022CSE', marks: 28, subject: 'Operating Systems' },
    { name: 'Student 023', enrollNo: '0232022CSE', marks: 42, subject: 'Data Structures' },
    { name: 'Student 038', enrollNo: '0382022CSE', marks: 38, subject: 'Database Systems' },
  ]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function PerformanceDemo() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoPerformanceData.averageMarks.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Overall class average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoPerformanceData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              In current batch
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((demoPerformanceData.passedStudents / demoPerformanceData.totalStudents) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Students passed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distinction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoPerformanceData.distinctionStudents}</div>
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
              <BarChart data={demoPerformanceData.markDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Students" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pass/Fail Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Result Overview</CardTitle>
            <CardDescription>
              Pass vs Fail distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Passed', value: demoPerformanceData.passedStudents },
                    { name: 'Failed', value: demoPerformanceData.totalStudents - demoPerformanceData.passedStudents }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subject Performance Comparison</CardTitle>
            <CardDescription>
              Average marks across different subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demoPerformanceData.subjectWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" name="Average Marks" fill="#8884D8" />
                <Bar dataKey="highest" name="Highest Marks" fill="#00C49F" />
                <Bar dataKey="lowest" name="Lowest Marks" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Batch Comparison */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Batch Performance Comparison</CardTitle>
            <CardDescription>
              Compare performance across different batches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demoPerformanceData.batchComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="batch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" name="Average Marks" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Students Needing Attention</CardTitle>
          <CardDescription>
            Students scoring below 40% in any subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoPerformanceData.lowPerformers.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="shrink-0">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-red-600">!</span>
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
                {demoPerformanceData.subjectWise.map((subject, index) => (
                  <tr key={subject.code} className="border-b">
                    <td className="p-3">
                      <div className="font-medium">{subject.code}</div>
                      <div className="text-sm text-muted-foreground">{subject.subject}</div>
                    </td>
                    <td className="p-3 text-center font-medium">{subject.average.toFixed(1)}</td>
                    <td className="p-3 text-center text-green-600 font-medium">{subject.highest}</td>
                    <td className="p-3 text-center text-red-600 font-medium">{subject.lowest}</td>
                    <td className="p-3 text-center">{subject.passPercentage.toFixed(1)}%</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subject.average >= 70 
                          ? 'bg-green-100 text-green-800' 
                          : subject.average >= 60 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subject.average >= 70 ? 'Excellent' : subject.average >= 60 ? 'Good' : 'Needs Attention'}
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
  )
}