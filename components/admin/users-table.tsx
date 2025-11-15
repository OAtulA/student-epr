'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
  id: string
  email: string
  role: string
  createdAt: string
  student: {
    id: string
    enrollNo: string
    name: string
    batch: string
    discipline: string
  } | null
  teacher: {
    id: string
    teacherId: string
    name: string
    joiningDate: string
  } | null
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()
        setUsers(data.users)
      } catch (error) {
        setError('Failed to load users')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: 'destructive',
      TEACHER: 'default',
      STUDENT: 'secondary',
    } as const

    return (
      <Badge variant={variants[role as keyof typeof variants]}>
        {role}
      </Badge>
    )
  }

  if (isLoading) {
    return <div>Loading users...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          Manage all users in the system. Total: {users.length} users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>ID/Enrollment</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="font-medium">
                  {user.teacher?.name || user.student?.name || 'N/A'}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.teacher?.teacherId || user.student?.enrollNo || 'N/A'}
                </TableCell>
                <TableCell>
                  {user.role === 'STUDENT' && (
                    <div className="text-sm">
                      {user.student?.discipline} • {user.student?.batch}
                    </div>
                  )}
                  {user.role === 'TEACHER' && (
                    <div className="text-sm">
                      Joined: {new Date(user.teacher!.joiningDate).toLocaleDateString()}
                    </div>
                  )}
                  {user.role === 'ADMIN' && (
                    <div className="text-sm">Administrator</div>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found. Create the first user above.
          </div>
        )}
      </CardContent>
    </Card>
  )
}