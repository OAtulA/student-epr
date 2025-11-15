'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createStudentSchema } from '@/lib/validations/schemas'
import toast from 'react-hot-toast'

const disciplines = ['CSE', 'IT', 'ECE', 'EEE', 'ML', 'DS'] as const
const batches = ['2022-2026', '2023-2027', '2024-2028', '2025-2029'] as const

export function CreateStudentForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    enrollNo: '',
    name: '',
    batch: '',
    discipline: '',
    email: '',
    password: ''
  })

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate with Zod
      createStudentSchema.parse(formData)

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'STUDENT'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
          toast.error(error.message || 'Failed to create student')
        throw new Error(error.message || 'Failed to create student')
      }

      toast.success('Student created successfully')
      // Reset form using state
      setFormData({
        enrollNo: '',
        name: '',
        batch: '',
        discipline: '',
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
          <Label htmlFor="enrollNo">Enrollment Number</Label>
          <Input
            id="enrollNo"
            name="enrollNo"
            placeholder="Enter enrollment number"
            value={formData.enrollNo}
            onChange={(e) => handleInputChange('enrollNo', e.target.value)}
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
          <Label htmlFor="batch">Batch</Label>
          <Select 
            value={formData.batch} 
            onValueChange={(value) => handleInputChange('batch', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch} value={batch}>
                  {batch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discipline">Discipline</Label>
          <Select 
            value={formData.discipline} 
            onValueChange={(value) => handleInputChange('discipline', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select discipline" />
            </SelectTrigger>
            <SelectContent>
              {disciplines.map((discipline) => (
                <SelectItem key={discipline} value={discipline}>
                  {discipline}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Student'}
      </Button>
    </form>
  )
}