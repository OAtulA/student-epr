/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SidebarNav } from '@/components/layout/sidebar-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth')
  }
// @ts-expect-error session user role exists
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 border-r bg-muted/40 md:block">
        <SidebarNav user={session.user as any} />
      </div>
      <div className="flex-1">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}