'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

const adminRoutes = [
  {
    href: '/admin',
    label: 'Dashboard',
  },
  {
    href: '/admin/users',
    label: 'User Management',
  },
  {
    href: '/admin/disciplines',
    label: 'Disciplines',
  },
  {
    href: '/admin/subjects',
    label: 'Subjects',
  },
  {
    href: '/admin/assignments',
    label: 'Assignments',
  },
]

interface SidebarNavProps {
  className?: string
  user: {
    name?: string | null
    role?: string
  }
}

export function SidebarNav({ className, user }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Admin Panel
          </h2>
          <div className="space-y-1">
            {adminRoutes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href={route.href}>
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 py-2">
        <div className="text-sm text-muted-foreground px-2 mb-2">
          Logged in as: {user.name} ({user.role})
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => signOut({ callbackUrl: '/auth' })}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}