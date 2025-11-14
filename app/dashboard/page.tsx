'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth')
      return
    }

    // Redirect based on role
    // @ts-expect-error session user role
    if (session?.user?.role === 'ADMIN') {
      router.push('/admin')
      // @ts-expect-error session user role
    } else if (session?.user?.role === 'TEACHER') {
      router.push('/teacher')
      // @ts-expect-error session user role
    } else if (session?.user?.role === 'STUDENT') {
      router.push('/student')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to EPR Platform</CardTitle>
          <CardDescription>
            Redirecting you to your dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}