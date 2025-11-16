import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  MessageSquare,
  Calendar
} from 'lucide-react'
import { AuthSession } from '@/types'

async function getStudentData(studentId: string) {
  const studentPromise = db.student.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  })

  const student = await studentPromise

  const [marks, recentAdvice] = await Promise.all([
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
    db.advice.findMany({
      where: {
        OR: [
          { isGeneral: true },
          { subject: { discipline: { name: student?.discipline } } }
        ],
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            name: true,
            batch: true,
          },
        },
      },
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ])

  // Calculate GPA and statistics
  const completedSubjects = marks.filter(mark => mark.total !== null && mark.total !== undefined)
  const totalMarks = completedSubjects.reduce((sum, mark) => sum + (mark.total || 0), 0)
  const averageMarks = completedSubjects.length > 0 ? totalMarks / completedSubjects.length : 0
  
  // Simple GPA calculation (you can enhance this)
  const gpa = completedSubjects.length > 0 ? (averageMarks / 10).toFixed(2) : '0.00'

  return {
    student,
    marks: completedSubjects,
    recentAdvice,
    stats: {
      totalSubjects: completedSubjects.length,
      averageMarks,
      gpa,
      semester: student?.batch ? getCurrentSemester(student.batch) : 1,
    },
  }
}

function getCurrentSemester(batch: string): number {
  const startYear = parseInt(batch.split('-')[0]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed

  // Calculate years passed since batch start
  const yearsPassed = currentYear - startYear;

  // Calculate semester: each year has 2 semesters
  let semester = yearsPassed * 2;

  // If current month is August or later, add 1 for the new semester
  if (currentMonth >= 8) {
    semester += 1;
  }

  // Ensure semester is at least 1 and at most 8
  return Math.max(1, Math.min(semester, 8));
}

const quickActions = [
  {
    title: 'View Results',
    description: 'Check your semester results',
    icon: BookOpen,
    href: '/student/results',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Read Advice',
    description: 'Get tips from seniors',
    icon: MessageSquare,
    href: '/student/advice',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Give Advice',
    description: 'Help your juniors',
    icon: Award,
    href: '/student/give-advice',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
]

export default async function StudentDashboard() {
  const session: AuthSession|null = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <div>Not authenticated</div>
  }

  // Get student ID from user
  const student = await db.student.findUnique({
    where: { userId: session.user.id }
  })

  if (!student) {
    return <div>Student profile not found</div>
  }

  const data = await getStudentData(student.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {student.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/student/results">
            <BookOpen className="w-4 h-4 mr-2" />
            View Results
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sem {data.stats.semester}</div>
            <p className="text-xs text-muted-foreground">
              {student.batch} Batch
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              With marks available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.averageMarks.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.gpa}</div>
            <p className="text-xs text-muted-foreground">
              Cumulative GPA
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Access frequently used features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  asChild
                >
                  <Link href={action.href}>
                    <div className={`p-2 rounded-lg mr-4 ${action.bgColor}`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Advice */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Advice</CardTitle>
            <CardDescription>
              Latest tips from seniors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentAdvice.map((advice) => (
              <div key={advice.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    {advice.isGeneral ? 'General Advice' : advice.subject?.name}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {advice.advice}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    By {advice.student.name} ({advice.student.batch})
                  </p>
                </div>
              </div>
            ))}
            
            {data.recentAdvice.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No advice available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
          <CardDescription>
            Your most recent subject marks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.marks.slice(0, 5).map((mark) => (
              <div key={mark.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium">{mark.teacherSubject.subject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mark.teacherSubject.subject.code} • Sem {mark.teacherSubject.subject.semester}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Total: {mark.total}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    M: {mark.midSem || '-'} E: {mark.endSem || '-'}
                  </p>
                </div>
              </div>
            ))}
            
            {data.marks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No marks available yet. Check back after your teachers upload results.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}