'use client'

import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-between z-50">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-gray-800 text-white flex flex-col fixed h-screen z-50 transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-6 hidden lg:block">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="block px-6 py-3 hover:bg-gray-700 transition">
            📊 Dashboard
          </Link>
          <Link href="/dashboard/home" className="block px-6 py-3 hover:bg-gray-700 transition">
            🏠 Home
          </Link>
          <Link href="/dashboard/divisions" className="block px-6 py-3 hover:bg-gray-700 transition">
            🔧 Divisions
          </Link>
          <Link href="/dashboard/news" className="block px-6 py-3 hover:bg-gray-700 transition">
            📰 News
          </Link>
          <Link href="/dashboard/blogs" className="block px-6 py-3 hover:bg-gray-700 transition">
            🧲 Blogs
          </Link>
          <Link href="/dashboard/brands" className="block px-6 py-3 hover:bg-gray-700 transition">
            🏷️ Brands
          </Link>
          <Link href="/dashboard/about" className="block px-6 py-3 hover:bg-gray-700 transition">
            ℹ️ About Us
          </Link>
          <Link href="/dashboard/contact" className="block px-6 py-3 hover:bg-gray-700 transition">
            📞 Contact
          </Link>
          <Link href="/dashboard/files" className="block px-6 py-3 hover:bg-gray-700 transition">
            🗂️ Files
          </Link>
          <Link href="/dashboard/admins" className="block px-6 py-3 hover:bg-gray-700 transition">
            👥 Admins
          </Link>
          <Link href="/dashboard/profile" className="block px-6 py-3 hover:bg-gray-700 transition">
            👤 Profile
          </Link>
        </nav>
        <div className="p-6 border-t border-gray-700">
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
      <main className="flex-1 lg:ml-64 p-8 pt-20 lg:pt-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}