'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTeacherSchema } from '@/lib/validations/schemas'

export function CreateTeacherForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const data = {
      teacherId: formData.get('teacherId') as string,
      name: formData.get('name') as string,
      joiningDate: formData.get('joiningDate') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      // Validate with Zod
      createTeacherSchema.parse(data)

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          role: 'TEACHER'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create teacher')
      }

      // Reset form
      event.currentTarget.reset()
      router.refresh()
      setError('')
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Something went wrong')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="teacherId">Teacher ID</Label>
          <Input
            id="teacherId"
            name="teacherId"
            placeholder="Enter teacher ID"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter full name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="joiningDate">Joining Date</Label>
          <Input
            id="joiningDate"
            name="joiningDate"
            type="date"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter temporary password"
          required
        />
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Teacher'}
      </Button>
    </form>
  )
}