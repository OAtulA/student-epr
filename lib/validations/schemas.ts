import { z } from 'zod'

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
})

// User Schemas
export const createStudentSchema = z.object({
  enrollNo: z.string().min(1, 'Enrollment number is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  batch: z.string().min(4, 'Batch must be in format YYYY-YYYY'),
  discipline: z.enum(['CSE', 'IT', 'ECE', 'EEE', 'ML', 'DS']),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const createTeacherSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Marks Schemas
export const marksSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  teacherSubjectId: z.string().min(1, 'Subject assignment is required'),
  midSem: z.number().min(0).max(100).optional(),
  endSem: z.number().min(0).max(100).optional(),
  internal: z.number().min(0).max(100).optional(),
})

export const uploadMarksSchema = z.array(marksSchema)

// Subject Schemas
export const createSubjectSchema = z.object({
  code: z.string().min(1, 'Subject code is required'),
  name: z.string().min(2, 'Subject name is required'),
  semester: z.number().min(1).max(8),
  batch: z.string().min(4, 'Batch is required (e.g., 2022-2026)'),
  disciplineId: z.string().min(1, 'Discipline is required'),
})

export const assignTeacherSchema = z.object({
  teacherId: z.string().min(1, 'Teacher is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  batch: z.string().min(4, 'Batch is required'),
  startRoll: z.number().min(1, 'Start roll is required'),
  endRoll: z.number().min(1, 'End roll is required'),
})

// Advice Schemas
export const adviceSchema = z.object({
  subjectId: z.string().optional(),
  advice: z.string().min(10, 'Advice must be at least 10 characters'),
  isGeneral: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>
export type MarksInput = z.infer<typeof marksSchema>
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type AssignTeacherInput = z.infer<typeof assignTeacherSchema>
export type AdviceInput = z.infer<typeof adviceSchema>