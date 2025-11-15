'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTeacherSchema } from '@/lib/validations/schemas'
import toast from 'react-hot-toast'

export function CreateTeacherForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    teacherId: '',
    name: '',
    joiningDate: '',
    email: '',
    password: ''
  })

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate with Zod
      createTeacherSchema.parse(formData)

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'TEACHER'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || 'Failed to create teacher')
        throw new Error(error.message || 'Failed to create teacher')
      }

      toast.success('Teacher created successfully')
      // Reset form using state
      setFormData({
        teacherId: '',
        name: '',
        joiningDate: '',
        email: '',
        password: ''
      })
      
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
            value={formData.teacherId}
            onChange={(e) => handleInputChange('teacherId', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
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
            value={formData.joiningDate}
            onChange={(e) => handleInputChange('joiningDate', e.target.value)}
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
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
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
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
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