'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Settings,
  LogOut
} from 'lucide-react'

const adminRoutes = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/users',
    label: 'User Management',
    icon: Users,
  },
  {
    href: '/admin/disciplines',
    label: 'Disciplines',
    icon: BookOpen,
  },
  {
    href: '/admin/subjects',
    label: 'Subjects',
    icon: GraduationCap,
  },
  {
    href: '/admin/assignments',
    label: 'Assignments',
    icon: Settings,
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
            {adminRoutes.map((route) => {
              const isActive = pathname === route.href
              return (
                <Button
                  key={route.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* User Info & Logout */}
      {/* <div className="absolute bottom-4 left-4 right-4 "> */}
        <div className={cn(className+"absolute bottom-4 left-0 px-4")}>
        <div className="space-y-2">
          <div className="px-2 py-1 text-sm border rounded-lg bg-muted/50">
            <div className="font-medium truncate">{user.name || 'Admin'}</div>
            <div className="text-muted-foreground text-xs">{user.role}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => signOut({ callbackUrl: '/auth' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}