'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface UnusedFilesResponse {
  count: number
  files: string[]
}

export default function FileManagementPage() {
  const [unusedFiles, setUnusedFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUnusedFiles()
  }, [])

  const fetchUnusedFiles = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get<UnusedFilesResponse>('/api/admin/files/unused')
      setUnusedFiles(response.data.files)
    } catch (error) {
      setError('Failed to fetch unused files')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUnused = async () => {
    if (!confirm(`Are you sure you want to delete ${unusedFiles.length} unused images?`)) {
      return
    }

    setDeleting(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiClient.delete('/api/admin/files/unused')
      setSuccess(response.data.message)
      fetchUnusedFiles()
    } catch (error) {
      setError('Failed to delete unused files')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">File Management</h1>

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

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Unused Images</h2>
            <p className="text-gray-600 mt-1">
              {unusedFiles.length} unused image{unusedFiles.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {unusedFiles.length > 0 && (
            <button
              onClick={handleDeleteUnused}
              disabled={deleting}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : `Delete All (${unusedFiles.length})`}
            </button>
          )}
        </div>

        {unusedFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-gray-500 text-lg">No unused images found!</p>
            <p className="text-gray-400 text-sm mt-2">All uploaded images are being used.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unusedFiles.map((file, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="relative h-32 bg-gray-200 rounded mb-2">
                  <img
                    src={`${API_URL}${file}`}
                    alt="Unused"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <p className="text-xs text-gray-600 truncate" title={file}>
                  {file.split('/').pop()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}