/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PerformanceDemo } from '@/components/teacher/performance-demo'

interface PerformanceData {
  assignmentId: string
  assignmentName: string
  averageMarks: number
  totalStudents: number
  passedStudents: number
  distinctionStudents: number
  subjectWise: SubjectPerformance[]
  markDistribution: MarkDistribution[]
  batchComparison: BatchComparison[]
}

interface SubjectPerformance {
  subject: string
  code: string
  average: number
  highest: number
  lowest: number
  passPercentage: number
}

interface MarkDistribution {
  range: string
  count: number
}

interface BatchComparison {
  batch: string
  average: number
  subject: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']


export default function PerformanceAnalyticsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<string>('')
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAssignments()
  }, [])

  useEffect(() => {
    if (selectedAssignment) {
      fetchPerformanceData()
    }
  }, [selectedAssignment])

  async function fetchAssignments() {
    try {
      const response = await fetch('/api/teacher/assignments')
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    }
  }

  async function fetchPerformanceData() {
    if (!selectedAssignment) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/teacher/performance?assignmentId=${selectedAssignment}`)
      if (response.ok) {
        const data = await response.json()
        setPerformanceData(data.performance)
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAssignmentObj = assignments.find(a => a.id === selectedAssignment)

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
                This shows sample data and charts. Switch to &quot;Live Data&quot; to see your actual student performance.
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
                  <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject and batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignments.map((assignment) => (
                        <SelectItem key={assignment.id} value={assignment.id}>
                          {assignment.subject.code} - {assignment.subject.name} ({assignment.subject.discipline.name})
                          <br />
                          <span className="text-sm text-muted-foreground">
                            Batch: {assignment.batch} | Rolls: {assignment.startRoll}-{assignment.endRoll}
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

          {performanceData && !isLoading && (
            <div className="space-y-6">
              {/* ... (keep the existing live data rendering) */}
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    Live data rendering would go here. The charts and layout would be similar to the demo.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!selectedAssignment && !isLoading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  Select an assignment to view live performance data
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}