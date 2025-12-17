'use client'

import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/dashboard"
            className="block px-6 py-3 hover:bg-gray-700 transition"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/dashboard/gallery"
            className="block px-6 py-3 hover:bg-gray-700 transition"
          >
            🖼️ Gallery
          </Link>
          <Link
            href="/dashboard/about"
            className="block px-6 py-3 hover:bg-gray-700 transition"
          >
            ℹ️ About Us
          </Link>
          <Link
            href="/dashboard/contact"
            className="block px-6 py-3 hover:bg-gray-700 transition"
          >
            📞 Contact
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold">{user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
