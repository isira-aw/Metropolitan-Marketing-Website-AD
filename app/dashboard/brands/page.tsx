'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Icon Components
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

interface Brand {
  id: number
  name: string
  imageUrl?: string
  link?: string
  description?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export default function BrandManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  
  // Form fields
  const [formData, setFormData] = useState<{
    name: string
    imageUrl: string
    link: string
    description: string
    isActive: boolean
  }>({
    name: '',
    imageUrl: '',
    link: '',
    description: '',
    isActive: true,
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    filterBrands()
  }, [brands, searchTerm, filterActive])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<Brand[]>('/api/admin/brands')
      setBrands(response.data)
    } catch (error) {
      console.error('Error fetching brands:', error)
      setError('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const filterBrands = () => {
    let filtered = [...brands]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by active status
    if (filterActive === 'active') {
      filtered = filtered.filter(brand => brand.isActive)
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(brand => !brand.isActive)
    }

    setFilteredBrands(filtered)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    setUploading(true)
    setError('')

    try {
      const response = await apiClient.post('/api/admin/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }))
    } catch (error) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingBrand) {
        await apiClient.put(`/api/admin/brands/${editingBrand.id}`, formData)
        setSuccess('Brand updated successfully')
      } else {
        await apiClient.post('/api/admin/brands', formData)
        setSuccess('Brand created successfully')
      }
      setShowModal(false)
      resetForm()
      fetchBrands()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.response?.data || 'Failed to save brand')
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      imageUrl: brand.imageUrl || '',
      link: brand.link || '',
      description: brand.description || '',
      isActive: brand.isActive ?? true,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this brand? This may affect existing products.')) return

    try {
      await apiClient.delete(`/api/admin/brands/${id}`)
      setSuccess('Brand deleted successfully')
      fetchBrands()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to delete brand')
      setTimeout(() => setError(''), 3000)
    }
  }

  const toggleActiveStatus = async (brand: Brand) => {
    try {
      await apiClient.put(`/api/admin/brands/${brand.id}`, {
        ...brand,
        isActive: !brand.isActive
      })
      setSuccess(`Brand ${!brand.isActive ? 'activated' : 'deactivated'} successfully`)
      fetchBrands()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to update brand status')
      setTimeout(() => setError(''), 3000)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      imageUrl: '',
      link: '',
      description: '',
      isActive: true,
    })
    setEditingBrand(null)
    setError('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brands...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
          <p className="text-gray-600 mt-1">Manage your product brands and their information</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-lg"
        >
          <PlusIcon />
          Add New Brand
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search brands by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by Status */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                filterActive === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({brands.length})
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                filterActive === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({brands.filter(b => b.isActive).length})
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                filterActive === 'inactive'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive ({brands.filter(b => !b.isActive).length})
            </button>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-4">
            {searchTerm || filterActive !== 'all' ? 'No brands match your filters' : 'No brands yet'}
          </p>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <PlusIcon />
            Add Your First Brand
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
              {/* Brand Image */}
              <div className="relative h-48 bg-gray-100">
                {brand.imageUrl ? (
                  <Image
                    src={`${API_URL}${brand.imageUrl}`}
                    alt={brand.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{brand.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      brand.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {brand.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{brand.description}</p>
                )}

                {brand.link && (
                  <a
                    href={brand.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mb-3 block truncate"
                  >
                    Visit Website →
                  </a>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                  >
                    <EditIcon />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActiveStatus(brand)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition ${
                      brand.isActive
                        ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {brand.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Samsung, Apple, Sony"
                />
              </div>

              {/* Brand Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website / Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://brand-website.com"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description about the brand..."
                />
              </div>

              {/* Brand Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Logo
                </label>
                {formData.imageUrl && (
                  <div className="mb-4 relative h-48 w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={`${API_URL}${formData.imageUrl}`}
                      alt="Brand preview"
                      fill
                      className="object-contain p-4"
                      sizes="600px"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-200 w-fit">
                  <UploadIcon />
                  <span className="text-sm font-medium">
                    {uploading ? 'Uploading...' : formData.imageUrl ? 'Change Logo' : 'Upload Logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (Brand is visible and available for selection)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
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