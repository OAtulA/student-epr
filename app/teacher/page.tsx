import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { 
  Upload, 
  BarChart3, 
  Users, 
  TrendingDown,
  BookOpen
} from 'lucide-react'
import { AuthSession } from '@/types'

async function getTeacherData(teacherId: string) {
  const [subjectsCount, studentsCount, assignments, recentMarks] = await Promise.all([
    db.teacherSubject.count({
      where: { teacherId }
    }),
    db.teacherSubject.aggregate({
      where: { teacherId },
      _sum: {
        endRoll: true,
        startRoll: true
      }
    }),
    db.teacherSubject.findMany({
      where: { teacherId },
      include: {
        subject: {
          include: {
            discipline: {
              select: { name: true }
            }
          }
        }
      },
      take: 5,
      orderBy: { batch: 'desc' }
    }),
    db.marks.findMany({
      where: {
        teacherSubject: {
          teacherId
        }
      },
      include: {
        student: {
          select: { name: true, enrollNo: true }
        },
        teacherSubject: {
          include: {
            subject: {
              select: { name: true, code: true }
            }
          }
        }
      },
      take: 5,
      orderBy: { id: 'desc' }
    })
  ])

  const totalStudents = (studentsCount._sum.endRoll || 0) - (studentsCount._sum.startRoll || 0) + 1

  return {
    subjectsCount,
    totalStudents,
    assignments,
    recentMarks
  }
}

const quickActions = [
  {
    title: 'Upload Marks',
    description: 'Upload mid/end sem marks',
    icon: Upload,
    href: '/teacher/upload-marks',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'View Analytics',
    description: 'Performance charts & insights',
    icon: BarChart3,
    href: '/teacher/performance',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Low Performers',
    description: 'Identify struggling students',
    icon: TrendingDown,
    href: '/teacher/low-performers',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    title: 'My Students',
    description: 'View all assigned students',
    icon: Users,
    href: '/teacher/students',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
]

export default async function TeacherDashboard() {
  const session: AuthSession|null = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <div>Not authenticated</div>
  }

  // Get teacher ID from user
  const teacher = await db.teacher.findUnique({
    where: { userId: session.user.id }
  })

  if (!teacher) {
    return <div>Teacher profile not found</div>
  }

  const data = await getTeacherData(teacher.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {teacher.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/upload-marks">
            <Upload className="w-4 h-4 mr-2" />
            Upload Marks
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.subjectsCount}</div>
            <p className="text-xs text-muted-foreground">
              Active subjects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all batches
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recentMarks.length}</div>
            <p className="text-xs text-muted-foreground">
              Last marks entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teacher ID</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.teacherId}</div>
            <p className="text-xs text-muted-foreground">
              Your teacher ID
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
              Frequently used teaching tasks
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

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>
              Your teaching assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{assignment.subject.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {assignment.subject.name}
                  </p>
                  <p className="text-xs">
                    {assignment.batch} • Rolls {assignment.startRoll}-{assignment.endRoll}
                  </p>
                </div>
              </div>
            ))}
            
            {data.assignments.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No assignments found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Marks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Marks Uploaded</CardTitle>
          <CardDescription>
            Your recently uploaded student marks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentMarks.map((mark) => (
              <div key={mark.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium">{mark.student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mark.student.enrollNo} • {mark.teacherSubject.subject.code}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Total: {mark.total || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    M: {mark.midSem || '-'} E: {mark.endSem || '-'}
                  </p>
                </div>
              </div>
            ))}
            
            {data.recentMarks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No marks uploaded yet. Start by uploading marks.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}