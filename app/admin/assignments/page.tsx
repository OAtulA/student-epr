'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface Teacher {
  id: string
  teacherId: string
  name: string
}

interface Subject {
  id: string
  code: string
  name: string
  semester: number
  discipline: {
    name: string
  }
}

interface Assignment {
  id: string
  batch: string
  startRoll: number
  endRoll: number
  teacher: {
    name: string
    teacherId: string
  }
  subject: {
    code: string
    name: string
    discipline: {
      name: string
    }
  }
}

export default function AssignmentsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    batch: '',
    startRoll: 1,
    endRoll: 60
  })

  const batches = ['2022-2026', '2023-2027', '2024-2028', '2025-2029']

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [teachersRes, subjectsRes, assignmentsRes] = await Promise.all([
        fetch('/api/admin/teachers'),
        fetch('/api/admin/subjects'),
        fetch('/api/admin/assignments')
      ])

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData.teachers)
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json()
        setSubjects(subjectsData.subjects)
      }

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json()
        setAssignments(assignmentsData.assignments)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  async function handleAssignTeacher(event: React.FormEvent) {
    event.preventDefault()
    if (!formData.teacherId || !formData.subjectId || !formData.batch) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          teacherId: '',
          subjectId: '',
          batch: '',
          startRoll: 1,
          endRoll: 60
        })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to assign teacher')
      }
    } catch (error) {
      console.error('Error assigning teacher:', error)
      alert('Failed to assign teacher')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Assignments</h1>
        <p className="text-muted-foreground">
          Assign teachers to subjects and student batches
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assign Teacher</CardTitle>
            <CardDescription>
              Assign a teacher to teach a subject for a specific batch and roll range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher</Label>
                <Select 
                  value={formData.teacherId} 
                  onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.teacherId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={formData.subjectId} 
                  onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name} ({subject.discipline.name} Sem {subject.semester})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Select 
                    value={formData.batch} 
                    onValueChange={(value) => setFormData({ ...formData, batch: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startRoll">Start Roll Number</Label>
                  <Input
                    id="startRoll"
                    type="number"
                    min="1"
                    value={formData.startRoll}
                    onChange={(e) => setFormData({ ...formData, startRoll: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endRoll">End Roll Number</Label>
                  <Input
                    id="endRoll"
                    type="number"
                    min="1"
                    value={formData.endRoll}
                    onChange={(e) => setFormData({ ...formData, endRoll: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Assigning...' : 'Assign Teacher'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>
              All teacher-subject assignments in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Roll Range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.teacher.name}
                        <div className="text-sm text-muted-foreground">
                          ID: {assignment.teacher.teacherId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{assignment.subject.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.subject.name}
                        </div>
                        <div className="text-xs">
                          {assignment.subject.discipline.name}
                        </div>
                      </TableCell>
                      <TableCell>{assignment.batch}</TableCell>
                      <TableCell>
                        {assignment.startRoll} - {assignment.endRoll}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {assignments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No assignments found. Assign your first teacher.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}