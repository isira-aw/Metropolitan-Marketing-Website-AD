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

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

interface BrandItem {
  imageUrl: string
  link: string
  name: string
}

interface CustomerItem {
  imageUrl: string
  link: string
  name: string
}

interface PlatformItem {
  imageUrl: string
  link: string
  name: string
}

interface RecommendationItem {
  imageUrl: string
  link: string
  name: string
  message: string
  rating: number
}

interface HomeContent {
  id: number
  welcomeMessage: string
  shortParagraph: string
  ourBrands: BrandItem[]
  ourCustomers: CustomerItem[]
  ourPlatforms: PlatformItem[]
  recommendations: RecommendationItem[]
}

export default function HomeManagementPage() {
  const [data, setData] = useState<HomeContent>({
    id: 0,
    welcomeMessage: '',
    shortParagraph: '',
    ourBrands: [],
    ourCustomers: [],
    ourPlatforms: [],
    recommendations: [],
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({})
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/api/admin/home')
      setData(response.data)
    } catch (error) {
      console.error('Error fetching home content:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploadingFields(prev => ({ ...prev, [fieldKey]: true }))
    setError('')

    try {
      const response = await apiClient.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      callback(response.data.url)
    } catch (error) {
      setError('Failed to upload image')
    } finally {
      setUploadingFields(prev => ({ ...prev, [fieldKey]: false }))
    }
  }

  // Brand Functions
  const addBrand = () => {
    setData(prev => ({
      ...prev,
      ourBrands: [...prev.ourBrands, { imageUrl: '', link: '', name: '' }]
    }))
  }

  const updateBrand = (index: number, field: keyof BrandItem, value: string) => {
    const updated = [...data.ourBrands]
    updated[index] = { ...updated[index], [field]: value }
    setData(prev => ({ ...prev, ourBrands: updated }))
  }

  const removeBrand = (index: number) => {
    setData(prev => ({
      ...prev,
      ourBrands: prev.ourBrands.filter((_, i) => i !== index)
    }))
  }

  const handleBrandImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    handleFileUpload(e, `brand-${index}`, (url) => {
      updateBrand(index, 'imageUrl', url)
    })
  }

  // Customer Functions
  const addCustomer = () => {
    setData(prev => ({
      ...prev,
      ourCustomers: [...prev.ourCustomers, { imageUrl: '', link: '', name: '' }]
    }))
  }

  const updateCustomer = (index: number, field: keyof CustomerItem, value: string) => {
    const updated = [...data.ourCustomers]
    updated[index] = { ...updated[index], [field]: value }
    setData(prev => ({ ...prev, ourCustomers: updated }))
  }

  const removeCustomer = (index: number) => {
    setData(prev => ({
      ...prev,
      ourCustomers: prev.ourCustomers.filter((_, i) => i !== index)
    }))
  }

  const handleCustomerImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    handleFileUpload(e, `customer-${index}`, (url) => {
      updateCustomer(index, 'imageUrl', url)
    })
  }

  // Platform Functions
  const addPlatform = () => {
    setData(prev => ({
      ...prev,
      ourPlatforms: [...prev.ourPlatforms, { imageUrl: '', link: '', name: '' }]
    }))
  }

  const updatePlatform = (index: number, field: keyof PlatformItem, value: string) => {
    const updated = [...data.ourPlatforms]
    updated[index] = { ...updated[index], [field]: value }
    setData(prev => ({ ...prev, ourPlatforms: updated }))
  }

  const removePlatform = (index: number) => {
    setData(prev => ({
      ...prev,
      ourPlatforms: prev.ourPlatforms.filter((_, i) => i !== index)
    }))
  }

  const handlePlatformImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    handleFileUpload(e, `platform-${index}`, (url) => {
      updatePlatform(index, 'imageUrl', url)
    })
  }

  // Recommendation Functions
  const addRecommendation = () => {
    setData(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, { imageUrl: '', link: '', name: '', message: '', rating: 5 }]
    }))
  }

  const updateRecommendation = (index: number, field: keyof RecommendationItem, value: string | number) => {
    const updated = [...data.recommendations]
    updated[index] = { ...updated[index], [field]: value }
    setData(prev => ({ ...prev, recommendations: updated }))
  }

  const removeRecommendation = (index: number) => {
    setData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }))
  }

  const handleRecommendationImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    handleFileUpload(e, `recommendation-${index}`, (url) => {
      updateRecommendation(index, 'imageUrl', url)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      await apiClient.put('/api/admin/home', data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError('Failed to save data')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Home Page Management</h1>

      {success && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Changes saved successfully!
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Welcome Section</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message
              </label>
              <input
                type="text"
                value={data.welcomeMessage}
                onChange={(e) => setData({ ...data, welcomeMessage: e.target.value })}
                placeholder="Enter welcome message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Paragraph
              </label>
              <textarea
                value={data.shortParagraph}
                onChange={(e) => setData({ ...data, shortParagraph: e.target.value })}
                rows={4}
                placeholder="Enter a short description about your company..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Our Brands Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Our Brands</h2>
            <button
              type="button"
              onClick={addBrand}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <PlusIcon />
              Add Brand
            </button>
          </div>

          <div className="space-y-4">
            {data.ourBrands.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No brands added yet</p>
                <button
                  type="button"
                  onClick={addBrand}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <PlusIcon />
                  Add First Brand
                </button>
              </div>
            ) : (
              data.ourBrands.map((brand, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Brand #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeBrand(index)}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <TrashIcon />
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={brand.name}
                        onChange={(e) => updateBrand(index, 'name', e.target.value)}
                        placeholder="Brand name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                      <input
                        type="url"
                        value={brand.link}
                        onChange={(e) => updateBrand(index, 'link', e.target.value)}
                        placeholder="https://brand.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    {brand.imageUrl && (
                      <div className="mb-3 relative h-32 w-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={`${API_URL}${brand.imageUrl}`}
                          alt={brand.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-200 w-fit">
                      <UploadIcon />
                      <span className="text-sm font-medium">
                        {uploadingFields[`brand-${index}`] ? 'Uploading...' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleBrandImageUpload(e, index)}
                        className="hidden"
                        disabled={uploadingFields[`brand-${index}`]}
                      />
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Our Customers Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Our Customers</h2>
            <button
              type="button"
              onClick={addCustomer}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <PlusIcon />
              Add Customer
            </button>
          </div>

          <div className="space-y-4">
            {data.ourCustomers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No customers added yet</p>
                <button
                  type="button"
                  onClick={addCustomer}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <PlusIcon />
                  Add First Customer
                </button>
              </div>
            ) : (
              data.ourCustomers.map((customer, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Customer #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCustomer(index)}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <TrashIcon />
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={customer.name}
                        onChange={(e) => updateCustomer(index, 'name', e.target.value)}
                        placeholder="Customer name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                      <input
                        type="url"
                        value={customer.link}
                        onChange={(e) => updateCustomer(index, 'link', e.target.value)}
                        placeholder="https://customer.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    {customer.imageUrl && (
                      <div className="mb-3 relative h-32 w-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={`${API_URL}${customer.imageUrl}`}
                          alt={customer.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-200 w-fit">
                      <UploadIcon />
                      <span className="text-sm font-medium">
                        {uploadingFields[`customer-${index}`] ? 'Uploading...' : 'Upload Logo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCustomerImageUpload(e, index)}
                        className="hidden"
                        disabled={uploadingFields[`customer-${index}`]}
                      />
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Our Platforms Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Our Platforms</h2>
            <button
              type="button"
              onClick={addPlatform}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <PlusIcon />
              Add Platform
            </button>
          </div>

          <div className="space-y-4">
            {data.ourPlatforms.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No platforms added yet</p>
                <button
                  type="button"
                  onClick={addPlatform}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <PlusIcon />
                  Add First Platform
                </button>
              </div>
            ) : (
              data.ourPlatforms.map((platform, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Platform #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removePlatform(index)}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <TrashIcon />
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={platform.name}
                        onChange={(e) => updatePlatform(index, 'name', e.target.value)}
                        placeholder="Platform name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                      <input
                        type="url"
                        value={platform.link}
                        onChange={(e) => updatePlatform(index, 'link', e.target.value)}
                        placeholder="https://platform.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    {platform.imageUrl && (
                      <div className="mb-3 relative h-32 w-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={`${API_URL}${platform.imageUrl}`}
                          alt={platform.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-200 w-fit">
                      <UploadIcon />
                      <span className="text-sm font-medium">
                        {uploadingFields[`platform-${index}`] ? 'Uploading...' : 'Upload Logo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePlatformImageUpload(e, index)}
                        className="hidden"
                        disabled={uploadingFields[`platform-${index}`]}
                      />
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Recommendations / Testimonials</h2>
            <button
              type="button"
              onClick={addRecommendation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <PlusIcon />
              Add Recommendation
            </button>
          </div>

          <div className="space-y-6">
            {data.recommendations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No recommendations added yet</p>
                <button
                  type="button"
                  onClick={addRecommendation}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <PlusIcon />
                  Add First Recommendation
                </button>
              </div>
            ) : (
              data.recommendations.map((rec, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Recommendation #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeRecommendation(index)}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <TrashIcon />
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={rec.name}
                        onChange={(e) => updateRecommendation(index, 'name', e.target.value)}
                        placeholder="Person's name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link (LinkedIn, Website, etc.)
                      </label>
                      <input
                        type="url"
                        value={rec.link}
                        onChange={(e) => updateRecommendation(index, 'link', e.target.value)}
                        placeholder="https://linkedin.com/in/person"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={rec.message}
                      onChange={(e) => updateRecommendation(index, 'message', e.target.value)}
                      rows={3}
                      placeholder="Enter recommendation message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (1-5)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={rec.rating}
                          onChange={(e) => updateRecommendation(index, 'rating', parseInt(e.target.value) || 5)}
                          className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-1 text-yellow-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon key={star} filled={star <= rec.rating} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                      {rec.imageUrl && (
                        <div className="mb-3 relative h-24 w-24 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
                          <Image
                            src={`${API_URL}${rec.imageUrl}`}
                            alt={rec.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-200 w-fit">
                        <UploadIcon />
                        <span className="text-sm font-medium">
                          {uploadingFields[`recommendation-${index}`] ? 'Uploading...' : 'Upload Photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleRecommendationImageUpload(e, index)}
                          className="hidden"
                          disabled={uploadingFields[`recommendation-${index}`]}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-white py-4 border-t">
          <button
            type="button"
            onClick={fetchData}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving || Object.values(uploadingFields).some(v => v)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save All Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}