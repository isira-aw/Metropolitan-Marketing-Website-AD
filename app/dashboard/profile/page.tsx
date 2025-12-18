'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'

interface AdminProfile {
  id: number
  username: string
  email: string
  license: boolean
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    license: true,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<AdminProfile>('/api/admin/profile')
      setProfile(response.data)
      setFormData({
        username: response.data.username,
        email: response.data.email,
        password: '',
        confirmPassword: '',
        license: response.data.license,
      })
    } catch (error) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSaving(true)

    try {
      const payload: any = {
        username: formData.username,
        email: formData.email,
        license: formData.license,
      }

      if (formData.password) {
        payload.password = formData.password
      }

      await apiClient.put('/api/admin/profile', payload)
      setSuccess('Profile updated successfully!')
      setFormData({ ...formData, password: '', confirmPassword: '' })
      fetchProfile()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="license"
              checked={formData.license}
              onChange={(e) => setFormData({ ...formData, license: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
            />
            <label htmlFor="license" className="text-sm font-medium">
              Admin Panel Access (License) - {formData.license ? 'Enabled ✓' : 'Disabled ✗'}
            </label>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <p className="text-sm text-gray-600 mb-4">Leave blank to keep current password</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">⚠️ Important Notes</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Changing your username will require you to login again</li>
          <li>Disabling your license will revoke admin panel access</li>
          <li>Password must be at least 6 characters</li>
          <li>All changes take effect immediately</li>
        </ul>
      </div>
    </div>
  )
}