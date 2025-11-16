/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Award, TrendingUp, Calendar } from 'lucide-react'
import { AuthSession } from '@/types'

async function getStudentResults(studentId: string) {
  const [student, marks] = await Promise.all([
    db.student.findUnique({
      where: { id: studentId },
    }),
    db.marks.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        teacherSubject: {
          include: {
            subject: {
              select: {
                name: true,
                code: true,
                semester: true,
              },
            },
            teacher: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        teacherSubject: {
          subject: {
            semester: 'asc',
          },
        },
      },
    }),
  ])

  // Organize marks by semester
  const marksBySemester: { [key: number]: any[] } = {}
  marks.forEach(mark => {
    const semester = mark.teacherSubject.subject.semester
    if (!marksBySemester[semester]) {
      marksBySemester[semester] = []
    }
    marksBySemester[semester].push(mark)
  })

  // Calculate semester-wise and overall statistics
  const semesterStats: { [key: number]: any } = {}
  let totalMarks = 0
  let totalSubjects = 0

  Object.keys(marksBySemester).forEach(sem => {
    const semester = parseInt(sem)
    const semesterMarks = marksBySemester[semester]
    const semesterTotal = semesterMarks.reduce((sum, mark) => sum + (mark.total || 0), 0)
    const semesterAverage = semesterMarks.length > 0 ? semesterTotal / semesterMarks.length : 0
    
    semesterStats[semester] = {
      average: semesterAverage,
      totalSubjects: semesterMarks.length,
      gpa: (semesterAverage / 10).toFixed(2),
    }

    totalMarks += semesterTotal
    totalSubjects += semesterMarks.length
  })

  const overallAverage = totalSubjects > 0 ? totalMarks / totalSubjects : 0
  const overallGpa = (overallAverage / 10).toFixed(2)

  return {
    student,
    marksBySemester,
    semesterStats,
    overall: {
      average: overallAverage,
      gpa: overallGpa,
      totalSubjects,
    },
  }
}

function getGrade(marks: number): string {
  if (marks >= 90) return 'A+'
  if (marks >= 80) return 'A'
  if (marks >= 70) return 'B+'
  if (marks >= 60) return 'B'
  if (marks >= 50) return 'C'
  if (marks >= 40) return 'D'
  return 'F'
}

function getGradeColor(marks: number): string {
  if (marks >= 80) return 'text-green-600 bg-green-50'
  if (marks >= 60) return 'text-blue-600 bg-blue-50'
  if (marks >= 40) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

export default async function StudentResultsPage() {
  const session: AuthSession|null = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <div>Not authenticated</div>
  }

  const student = await db.student.findUnique({
    where: { userId: session.user.id }
  })

  if (!student) {
    return <div>Student profile not found</div>
  }

  const data = await getStudentResults(student.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Results</h1>
        <p className="text-muted-foreground">
          View your academic performance across all semesters
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall.gpa}</div>
            <p className="text-xs text-muted-foreground">
              Cumulative Grade Point
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Percentage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall.average.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Across all semesters
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Batch</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.batch}</div>
            <p className="text-xs text-muted-foreground">
              {student.discipline}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Semester-wise Results */}
      {Object.keys(data.marksBySemester).length > 0 ? (
        Object.keys(data.marksBySemester)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(semester => {
            const sem = parseInt(semester)
            const semesterMarks = data.marksBySemester[sem]
            const stats = data.semesterStats[sem]

            return (
              <Card key={sem}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Semester {sem}</CardTitle>
                      <CardDescription>
                        {semesterMarks.length} subjects • Average: {stats.average.toFixed(1)}% • GPA: {stats.gpa}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      Semester {sem}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {semesterMarks.map((mark) => (
                      <div key={mark.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium">{mark.teacherSubject.subject.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {mark.teacherSubject.subject.code} • Taught by {mark.teacherSubject.teacher.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(mark.total || 0)}`}>
                            {mark.total}% • {getGrade(mark.total || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            M: {mark.midSem || '-'} • E: {mark.endSem || '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No Results Available</h3>
              <p className="text-muted-foreground">
                Your results will appear here once your teachers upload marks.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}