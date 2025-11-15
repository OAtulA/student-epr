'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Discipline {
  id: string
  name: string
  subjects: Subject[]
}

interface Subject {
  id: string
  code: string
  name: string
  semester: number
}

export default function DisciplinesPage() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newDiscipline, setNewDiscipline] = useState('')

  useEffect(() => {
    fetchDisciplines()
  }, [])

  async function fetchDisciplines() {
    try {
      const response = await fetch('/api/admin/disciplines')
      if (response.ok) {
        const data = await response.json()
        setDisciplines(data.disciplines)
      }
    } catch (error) {
      console.error('Error fetching disciplines:', error)
    }
  }

  async function handleAddDiscipline(event: React.FormEvent) {
    event.preventDefault()
    if (!newDiscipline.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/disciplines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newDiscipline.trim() }),
      })

      if (response.ok) {
        setNewDiscipline('')
        fetchDisciplines()
      }
    } catch (error) {
      console.error('Error adding discipline:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discipline Management</h1>
        <p className="text-muted-foreground">
          Manage academic disciplines and their subjects
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Discipline</CardTitle>
            <CardDescription>
              Create a new academic discipline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDiscipline} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discipline">Discipline Name</Label>
                <Input
                  id="discipline"
                  placeholder="e.g., CSE, IT, ECE"
                  value={newDiscipline}
                  onChange={(e) => setNewDiscipline(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Discipline'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Disciplines</CardTitle>
            <CardDescription>
              All academic disciplines in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subjects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplines.map((discipline) => (
                  <TableRow key={discipline.id}>
                    <TableCell className="font-medium">{discipline.name}</TableCell>
                    <TableCell>{discipline.subjects.length} subjects</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {disciplines.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No disciplines found. Add your first discipline.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}