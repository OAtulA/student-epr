// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'

import {Toast, Toaster} from "react-hot-toast"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EPR Platform - Exam Performance Report',
  description: 'College EPR platform for teachers and students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}