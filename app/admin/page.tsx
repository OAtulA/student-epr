
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'
import Link from 'next/link'
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Settings,
  PlusCircle,
  ArrowRight
} from 'lucide-react'

async function getStats() {
  const [
    teachersCount,
    studentsCount,
    disciplinesCount,
    subjectsCount,
    assignmentsCount,
    recentUsers
  ] = await Promise.all([
    db.teacher.count(),
    db.student.count(),
    db.discipline.count(),
    db.subject.count(),
    db.teacherSubject.count(),
    db.user.findMany({
      include: {
        student: true,
        teacher: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })
  ])

  return {
    teachersCount,
    studentsCount,
    disciplinesCount,
    subjectsCount,
    assignmentsCount,
    recentUsers
  }
}

const quickActions = [
  {
    title: 'Add Student',
    description: 'Create new student account',
    icon: Users,
    href: '/admin/users',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Add Teacher',
    description: 'Create new teacher account',
    icon: GraduationCap,
    href: '/admin/users',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Manage Subjects',
    description: 'Add or edit subjects',
    icon: BookOpen,
    href: '/admin/subjects',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Assign Teachers',
    description: 'Assign teachers to subjects',
    icon: Settings,
    href: '/admin/assignments',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
]

export default async function AdminDashboard() {
  const stats = await getStats()

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: 'bg-red-100 text-red-800',
      TEACHER: 'bg-blue-100 text-blue-800',
      STUDENT: 'bg-green-100 text-green-800',
    } as const

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[role as keyof typeof variants]}`}>
        {role}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the EPR Platform Admin Panel
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add User
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachersCount}</div>
            <p className="text-xs text-muted-foreground">
              Active teachers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered students
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplines</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disciplinesCount}</div>
            <p className="text-xs text-muted-foreground">
              Academic disciplines
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignmentsCount}</div>
            <p className="text-xs text-muted-foreground">
              Teacher assignments
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
              Frequently used administrative tasks
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

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Platform overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Academic Year</span>
              <Badge variant="secondary">2024-25</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Subjects</span>
              <Badge variant="secondary">{stats.subjectsCount}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Recently created user accounts
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {(user.teacher?.name || user.student?.name || 'N/A').charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {user.teacher?.name || user.student?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.teacher?.teacherId || user.student?.enrollNo || ''}
                  </div>
                </div>
              </div>
            ))}
            
            {stats.recentUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found. Create your first user.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Features */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
          <CardDescription>
            Available features for different user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Teacher Features</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Upload mid/end sem marks</li>
                <li>• View student performance</li>
                <li>• Compare batch performance</li>
                <li>• Identify low performers</li>
              </ul>
            </div>
            
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Student Features</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View semester results</li>
                <li>• Calculate GPA and percentage</li>
                <li>• Submit advice for juniors</li>
                <li>• Read senior advice</li>
              </ul>
            </div>
            
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Admin Features</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Manage all users</li>
                <li>• Configure disciplines</li>
                <li>• Setup subjects and semesters</li>
                <li>• Assign teachers to batches</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}