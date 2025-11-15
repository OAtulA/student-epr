'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateStudentForm } from '@/components/admin/create-student-form'
import { CreateTeacherForm } from '@/components/admin/create-teacher-form'
import { UsersTable } from '@/components/admin/users-table'

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState('students')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage students and teachers in the system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="view">View All</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Student</CardTitle>
              <CardDescription>
                Create a new student account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateStudentForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Teacher</CardTitle>
              <CardDescription>
                Create a new teacher account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateTeacherForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}