'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Blog {
  blogId: number
  topic: string
  date: string
  division: string
  imageUrl: string
  shortDescription: string
  paragraph: string
  slug: string
  published: boolean
  viewCount: number
  displayOrder: number
  createdAt: string
  updatedAt: string
}

interface PageResponse {
  content: Blog[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  empty: boolean
}

const DIVISIONS = ['CentralAC', 'Elevator', 'Fire', 'Generator', 'Solar', 'ELV']

export default function BlogsManagementPage() {
  const [pageData, setPageData] = useState<PageResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Filter states
  const [selectedDivision, setSelectedDivision] = useState<string>('')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')

  const [formData, setFormData] = useState({
    topic: '',
    date: new Date().toISOString().split('T')[0],
    division: 'Solar',
    imageUrl: '',
    shortDescription: '',
    paragraph: '',
    slug: '',
    published: true,
    displayOrder: 0
  })

  useEffect(() => {
    fetchBlogs()
  }, [currentPage, pageSize, selectedDivision, searchKeyword])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      let url = ''
      
      // Build URL based on filters
      if (selectedDivision && searchKeyword) {
        // Division + Search
        url = `/api/admin/blogs/division/${selectedDivision}/search?keyword=${encodeURIComponent(searchKeyword)}&page=${currentPage}&size=${pageSize}`
      } else if (selectedDivision) {
        // Division only
        url = `/api/admin/blogs/division/${selectedDivision}?page=${currentPage}&size=${pageSize}`
      } else if (searchKeyword) {
        // Search only
        url = `/api/admin/blogs/search?keyword=${encodeURIComponent(searchKeyword)}&page=${currentPage}&size=${pageSize}`
      } else {
        // All blogs
        url = `/api/admin/blogs?page=${currentPage}&size=${pageSize}`
      }

      const response = await apiClient.get(url)
      setPageData(response.data)
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    setUploading(true)
    setError('')

    try {
      const response = await apiClient.post('/api/admin/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }))
    } catch (error) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const generateSlug = (topic: string) => {
    return topic
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTopicChange = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topic,
      slug: generateSlug(topic)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (editingBlog) {
        await apiClient.put(`/api/admin/blogs/${editingBlog.blogId}`, formData)
      } else {
        await apiClient.post('/api/admin/blogs', formData)
      }
      setShowModal(false)
      resetForm()
      fetchBlogs()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save blog')
    }
  }

  const resetForm = () => {
    setFormData({
      topic: '',
      date: new Date().toISOString().split('T')[0],
      division: 'Solar',
      imageUrl: '',
      shortDescription: '',
      paragraph: '',
      slug: '',
      published: true,
      displayOrder: 0
    })
    setEditingBlog(null)
  }

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog)
    setFormData({
      topic: blog.topic,
      date: blog.date,
      division: blog.division,
      imageUrl: blog.imageUrl,
      shortDescription: blog.shortDescription,
      paragraph: blog.paragraph,
      slug: blog.slug,
      published: blog.published,
      displayOrder: blog.displayOrder
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      await apiClient.delete(`/api/admin/blogs/${id}`)
      fetchBlogs()
    } catch (error) {
      alert('Failed to delete blog')
    }
  }

  const togglePublishStatus = async (id: number) => {
    try {
      await apiClient.patch(`/api/admin/blogs/${id}/toggle-publish`)
      fetchBlogs()
    } catch (error) {
      alert('Failed to toggle status')
    }
  }

  const handleSearch = () => {
    setSearchKeyword(searchInput)
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setSelectedDivision('')
    setSearchKeyword('')
    setSearchInput('')
    setCurrentPage(0)
  }

  if (loading && !pageData) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blogs Management</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Blog
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Division Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Division</label>
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value)
                setCurrentPage(0)
              }}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Divisions</option>
              {DIVISIONS.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search topic, description..."
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedDivision || searchKeyword) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedDivision && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Division: {selectedDivision}
              </span>
            )}
            {searchKeyword && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Search: "{searchKeyword}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {pageData && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {pageData.content.length} of {pageData.totalElements} results
        </div>
      )}

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageData?.content.map((blog) => (
          <div key={blog.blogId} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-48 bg-gray-200">
              <Image
                src={`${API_URL}${blog.imageUrl}`}
                alt={blog.topic}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {!blog.published && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  UNPUBLISHED
                </div>
              )}
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                {blog.division}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-1">{new Date(blog.date).toLocaleDateString()}</div>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">{blog.topic}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">{blog.shortDescription}</p>
              <div className="text-xs text-gray-500 mb-4">
                👁 {blog.viewCount} views
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(blog)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => togglePublishStatus(blog.blogId)}
                  className={`px-3 py-1 rounded text-sm ${
                    blog.published
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {blog.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(blog.blogId)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {pageData?.empty && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No blogs found.</p>
          {(selectedDivision || searchKeyword) && (
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:underline"
            >
              Clear filters to see all blogs
            </button>
          )}
        </div>
      )}

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
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={pageData.first}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-1">
              Page {pageData.pageNumber + 1} of {pageData.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={pageData.last}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(pageData.totalPages - 1)}
              disabled={pageData.last}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingBlog ? 'Edit Blog' : 'Add New Blog'}
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Topic & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Topic *</label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => handleTopicChange(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Division */}
                <div>
                  <label className="block text-sm font-medium mb-2">Division *</label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    {DIVISIONS.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium mb-2">Slug (URL-friendly)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    placeholder="Auto-generated from topic"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /blogs/{formData.slug || 'your-slug-here'}
                  </p>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image *</label>
                  {formData.imageUrl && (
                    <div className="mb-4 relative h-48 bg-gray-200 rounded">
                      <Image
                        src={`${API_URL}${formData.imageUrl}`}
                        alt="Preview"
                        fill
                        className="object-cover rounded"
                        sizes="500px"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 border rounded-lg"
                    disabled={uploading}
                  />
                  {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Short Description *</label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Brief summary for blog cards..."
                    required
                  />
                </div>

                {/* Full Paragraph */}
                <div>
                  <label className="block text-sm font-medium mb-2">Full Content (Paragraph) *</label>
                  <textarea
                    value={formData.paragraph}
                    onChange={(e) => setFormData({ ...formData, paragraph: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Full blog content..."
                    required
                  />
                </div>

                {/* Publish & Display Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium">Published</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  disabled={uploading || !formData.imageUrl}
                >
                  {editingBlog ? 'Update Blog' : 'Create Blog'}
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