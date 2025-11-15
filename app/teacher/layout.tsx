import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { TeacherSidebarNav } from '@/components/layout/teacher-sidebar-nav'
import { AuthSession } from '@/types'

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session: AuthSession | null = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth')
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden w-64 border-r bg-muted/40 md:block relative">
        <TeacherSidebarNav user={session.user} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}