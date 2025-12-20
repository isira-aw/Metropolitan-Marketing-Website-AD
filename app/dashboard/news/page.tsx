'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface NewsItem {
  id: number
  title: string
  imageUrl: string
  thumbnailUrl?: string
  description: string
  content?: string
  category: 'CORPORATE' | 'BUSINESS' | 'PUBLIC' | 'IMPACT' | 'TECHNOLOGY' | 'EVENTS' | 'ANNOUNCEMENTS'
  displayOrder: number
  isFeatured: boolean
  isPublished: boolean
  expireDate?: string
  author?: string
  viewCount: number
  createdAt: string
  updatedAt: string
}

interface PageResponse {
  content: NewsItem[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  empty: boolean
}

export default function NewsManagementPage() {
  const [pageData, setPageData] = useState<PageResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'CORPORATE' as NewsItem['category'],
    imageUrl: '',
    thumbnailUrl: '',
    author: '',
    isFeatured: false,
    isPublished: true,
    expireDate: '',
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    fetchItems()
  }, [currentPage, pageSize])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/api/admin/news?page=${currentPage}&size=${pageSize}`)
      setPageData(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchItems()
      return
    }
    
    setLoading(true)
    try {
      const response = await apiClient.get(
        `/api/admin/news/search?keyword=${searchKeyword}&page=${currentPage}&size=${pageSize}`
      )
      setPageData(response.data)
    } catch (error) {
      console.error('Error searching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'thumbnailUrl') => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setError('')

    try {
      const response = await apiClient.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFormData(prev => ({ ...prev, [field]: response.data.url }))
    } catch (error) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (editingItem) {
        await apiClient.put(`/api/admin/news/${editingItem.id}`, formData)
      } else {
        await apiClient.post('/api/admin/news', formData)
      }
      setShowModal(false)
      resetForm()
      fetchItems()
    } catch (error) {
      setError('Failed to save item')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      category: 'CORPORATE',
      imageUrl: '',
      thumbnailUrl: '',
      author: '',
      isFeatured: false,
      isPublished: true,
      expireDate: '',
    })
    setEditingItem(null)
  }

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content || '',
      category: item.category,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl || '',
      author: item.author || '',
      isFeatured: item.isFeatured,
      isPublished: item.isPublished,
      expireDate: item.expireDate || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await apiClient.delete(`/api/admin/news/${id}`)
      fetchItems()
    } catch (error) {
      alert('Failed to delete item')
    }
  }

  const togglePublishStatus = async (id: number) => {
    try {
      await apiClient.patch(`/api/admin/news/${id}/toggle-publish`)
      fetchItems()
    } catch (error) {
      alert('Failed to toggle publish status')
    }
  }

  const toggleFeaturedStatus = async (id: number) => {
    try {
      await apiClient.patch(`/api/admin/news/${id}/toggle-featured`)
      fetchItems()
    } catch (error) {
      alert('Failed to toggle featured status')
    }
  }

  if (loading && !pageData) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">News Management</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + Add News
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search news..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearchKeyword('')
            fetchItems()
          }}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          Clear
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {pageData?.content.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-48 bg-gray-200">
              <Image
                src={`${API_URL}${item.imageUrl}`}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {item.isFeatured && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                  FEATURED
                </div>
              )}
              {!item.isPublished && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  DRAFT
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="text-sm text-blue-600 mb-1">{item.category}</div>
              <h3 className="text-lg font-semibold mb-2 line-clamp-1">{item.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</p>
              {item.author && (
                <p className="text-xs text-gray-500 mb-2">By {item.author}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>👁 {item.viewCount} views</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => togglePublishStatus(item.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    item.isPublished
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {item.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => toggleFeaturedStatus(item.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    item.isFeatured
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {item.isFeatured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pageData && !pageData.empty && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {pageData.pageNumber * pageData.pageSize + 1} to{' '}
            {Math.min((pageData.pageNumber + 1) * pageData.pageSize, pageData.totalElements)} of{' '}
            {pageData.totalElements} results
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentPage(0)}
              disabled={pageData.first}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={pageData.first}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-1">
              Page {pageData.pageNumber + 1} of {pageData.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={pageData.last}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(pageData.totalPages - 1)}
              disabled={pageData.last}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(0)
              }}
              className="px-3 py-1 border rounded ml-4"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingItem ? 'Edit News' : 'Add New News'}
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as NewsItem['category'] })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="CORPORATE">Corporate</option>
                    <option value="BUSINESS">Business</option>
                    <option value="PUBLIC">Public</option>
                    <option value="IMPACT">Impact</option>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="EVENTS">Events</option>
                    <option value="ANNOUNCEMENTS">Announcements</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Main Image *</label>
                {formData.imageUrl && (
                  <div className="mb-4 relative h-48 bg-gray-200 rounded">
                    <Image
                      src={`${API_URL}${formData.imageUrl}`}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'imageUrl')}
                  className="w-full px-4 py-2 border rounded-lg"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail (Optional)</label>
                {formData.thumbnailUrl && (
                  <div className="mb-4 relative h-32 bg-gray-200 rounded">
                    <Image
                      src={`${API_URL}${formData.thumbnailUrl}`}
                      alt="Thumbnail"
                      fill
                      className="object-cover rounded"
                      sizes="200px"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'thumbnailUrl')}
                  className="w-full px-4 py-2 border rounded-lg"
                  disabled={uploading}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Published</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Featured</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expire Date</label>
                  <input
                    type="datetime-local"
                    value={formData.expireDate}
                    onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {uploading && <p className="text-sm text-blue-600">Uploading...</p>}

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  disabled={uploading || !formData.imageUrl}
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}