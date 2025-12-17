'use client'

import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/gallery">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
            <div className="text-4xl mb-4">🖼️</div>
            <h2 className="text-xl font-semibold mb-2">Gallery Management</h2>
            <p className="text-gray-600">Manage gallery items, upload images, and reorder</p>
          </div>
        </Link>

        <Link href="/dashboard/about">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
            <div className="text-4xl mb-4">ℹ️</div>
            <h2 className="text-xl font-semibold mb-2">About Us</h2>
            <p className="text-gray-600">Edit company and team information</p>
          </div>
        </Link>

        <Link href="/dashboard/contact">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
            <div className="text-4xl mb-4">📞</div>
            <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
            <p className="text-gray-600">Update contact details and social media</p>
          </div>
        </Link>
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Quick Tips</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Changes made here will reflect on the customer website</li>
          <li>Use the Gallery section to add and organize images</li>
          <li>Keep your About Us and Contact info up to date</li>
          <li>Customer website updates automatically via ISR (every 60 seconds)</li>
        </ul>
      </div>
    </div>
  )
}
