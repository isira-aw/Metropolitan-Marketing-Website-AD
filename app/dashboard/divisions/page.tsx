'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Division {
  divisionsId: string
  divisionsName: string
  slug: string
  status: string
  displayOrder: number
  basicInfo?: {
    shortDescription: string
    longDescription: string
    bannerImage: string
  }
  subDivisions?: SubDivision[]
  contactUs?: {
    location: { latitude: string; longitude: string }
    contacts: Contact[]
  }
  createdAt: string
  updatedAt: string
}

interface SubDivision {
  subDivisionsName: string
  simpleDivisions: string
  keyFeatures: string[]
  globalPartners: Partner[]
  brands: Partner[]
  sections: Section[]
  responsiblePersons: ResponsiblePerson[]
}

interface Partner {
  imageUrl: string
  link: string
  name: string
}

interface Section {
  title: string
  description: string
}

interface ResponsiblePerson {
  profileImage: string
  name: string
  designation: string
  contactNumber: string
  email: string
  whatsAppNumber: string
  vCard: string
}

interface Contact {
  title: string
  description: string
  email: string
  number: string
}

export default function DivisionsAdminPage() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDivision, setEditingDivision] = useState<Division | null>(null)
  const [activeTab, setActiveTab] = useState<string>('basic')
  const [activeSubDivIndex, setActiveSubDivIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    divisionsId: '',
    divisionsName: '',
    slug: '',
    status: 'active',
    displayOrder: 0,
    basicInfo: {
      shortDescription: '',
      longDescription: '',
      bannerImage: ''
    },
    subDivisions: [] as SubDivision[],
    contactUs: {
      location: { latitude: '', longitude: '' },
      contacts: [] as Contact[]
    }
  })

  useEffect(() => {
    fetchDivisions()
  }, [])

  const fetchDivisions = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/api/admin/divisions/all')
      setDivisions(response.data)
    } catch (error) {
      console.error('Error fetching divisions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'banner' | 'partner' | 'brand' | 'person', subDivIndex?: number, itemIndex?: number) => {
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

      const url = response.data.url

      if (field === 'banner') {
        setFormData(prev => ({
          ...prev,
          basicInfo: { ...prev.basicInfo, bannerImage: url }
        }))
      } else if (field === 'partner' && subDivIndex !== undefined && itemIndex !== undefined) {
        setFormData(prev => {
          const newSubDivs = [...prev.subDivisions]
          newSubDivs[subDivIndex].globalPartners[itemIndex].imageUrl = url
          return { ...prev, subDivisions: newSubDivs }
        })
      } else if (field === 'brand' && subDivIndex !== undefined && itemIndex !== undefined) {
        setFormData(prev => {
          const newSubDivs = [...prev.subDivisions]
          newSubDivs[subDivIndex].brands[itemIndex].imageUrl = url
          return { ...prev, subDivisions: newSubDivs }
        })
      } else if (field === 'person' && subDivIndex !== undefined && itemIndex !== undefined) {
        setFormData(prev => {
          const newSubDivs = [...prev.subDivisions]
          newSubDivs[subDivIndex].responsiblePersons[itemIndex].profileImage = url
          return { ...prev, subDivisions: newSubDivs }
        })
      }
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
      if (editingDivision) {
        await apiClient.put(`/api/admin/divisions/${editingDivision.divisionsId}`, formData)
      } else {
        await apiClient.post('/api/admin/divisions', formData)
      }
      setShowModal(false)
      resetForm()
      fetchDivisions()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save division')
    }
  }

  const resetForm = () => {
    setFormData({
      divisionsId: '',
      divisionsName: '',
      slug: '',
      status: 'active',
      displayOrder: 0,
      basicInfo: {
        shortDescription: '',
        longDescription: '',
        bannerImage: ''
      },
      subDivisions: [],
      contactUs: {
        location: { latitude: '', longitude: '' },
        contacts: []
      }
    })
    setEditingDivision(null)
    setActiveTab('basic')
    setActiveSubDivIndex(0)
  }

  const handleEdit = (division: Division) => {
    setEditingDivision(division)
    setFormData({
      divisionsId: division.divisionsId,
      divisionsName: division.divisionsName,
      slug: division.slug,
      status: division.status,
      displayOrder: division.displayOrder,
      basicInfo: division.basicInfo || {
        shortDescription: '',
        longDescription: '',
        bannerImage: ''
      },
      subDivisions: division.subDivisions || [],
      contactUs: division.contactUs || {
        location: { latitude: '', longitude: '' },
        contacts: []
      }
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this division?')) return

    try {
      await apiClient.delete(`/api/admin/divisions/${id}`)
      fetchDivisions()
    } catch (error) {
      alert('Failed to delete division')
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      await apiClient.patch(`/api/admin/divisions/${id}/toggle-status`)
      fetchDivisions()
    } catch (error) {
      alert('Failed to toggle status')
    }
  }

  // Sub-division management
  const addSubDivision = () => {
    setFormData(prev => ({
      ...prev,
      subDivisions: [...prev.subDivisions, {
        subDivisionsName: '',
        simpleDivisions: '',
        keyFeatures: [],
        globalPartners: [],
        brands: [],
        sections: [],
        responsiblePersons: []
      }]
    }))
    setActiveSubDivIndex(formData.subDivisions.length)
  }

  const removeSubDivision = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subDivisions: prev.subDivisions.filter((_, i) => i !== index)
    }))
    if (activeSubDivIndex >= formData.subDivisions.length - 1) {
      setActiveSubDivIndex(Math.max(0, formData.subDivisions.length - 2))
    }
  }

  const updateSubDivision = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      subDivisions: prev.subDivisions.map((sd, i) =>
        i === index ? { ...sd, [field]: value } : sd
      )
    }))
  }

  // Array item management
  const addKeyFeature = (subDivIndex: number) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex].keyFeatures.push('')
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const updateKeyFeature = (subDivIndex: number, featureIndex: number, value: string) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex].keyFeatures[featureIndex] = value
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const removeKeyFeature = (subDivIndex: number, featureIndex: number) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex].keyFeatures = newSubDivs[subDivIndex].keyFeatures.filter((_, i) => i !== featureIndex)
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const addPartner = (subDivIndex: number, type: 'globalPartners' | 'brands') => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex][type].push({ imageUrl: '', link: '', name: '' })
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const updatePartner = (subDivIndex: number, type: 'globalPartners' | 'brands', partnerIndex: number, field: string, value: string) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex][type][partnerIndex] = {
        ...newSubDivs[subDivIndex][type][partnerIndex],
        [field]: value
      }
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const removePartner = (subDivIndex: number, type: 'globalPartners' | 'brands', partnerIndex: number) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex][type] = newSubDivs[subDivIndex][type].filter((_, i) => i !== partnerIndex)
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const addSection = (subDivIndex: number) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex].sections.push({ title: '', description: '' })
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const updateSection = (subDivIndex: number, sectionIndex: number, field: string, value: string) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex].sections[sectionIndex] = {
        ...newSubDivs[subDivIndex].sections[sectionIndex],
        [field]: value
      }
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const removeSection = (subDivIndex: number, sectionIndex: number) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex].sections = newSubDivs[subDivIndex].sections.filter((_, i) => i !== sectionIndex)
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const addResponsiblePerson = (subDivIndex: number) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex].responsiblePersons.push({
        profileImage: '',
        name: '',
        designation: '',
        contactNumber: '',
        email: '',
        whatsAppNumber: '',
        vCard: ''
      })
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const updateResponsiblePerson = (subDivIndex: number, personIndex: number, field: string, value: string) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex].responsiblePersons[personIndex] = {
        ...newSubDivs[subDivIndex].responsiblePersons[personIndex],
        [field]: value
      }
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const removeResponsiblePerson = (subDivIndex: number, personIndex: number) => {
    setFormData(prev => {
      const newSubDivs = [...prev.subDivisions]
      newSubDivs[subDivIndex].responsiblePersons = newSubDivs[subDivIndex].responsiblePersons.filter((_, i) => i !== personIndex)
      return { ...prev, subDivisions: newSubDivs }
    })
  }

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contactUs: {
        ...prev.contactUs,
        contacts: [...prev.contactUs.contacts, { title: '', description: '', email: '', number: '' }]
      }
    }))
  }

  const updateContact = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactUs: {
        ...prev.contactUs,
        contacts: prev.contactUs.contacts.map((c, i) =>
          i === index ? { ...c, [field]: value } : c
        )
      }
    }))
  }

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contactUs: {
        ...prev.contactUs,
        contacts: prev.contactUs.contacts.filter((_, i) => i !== index)
      }
    }))
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Divisions Management</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Division
        </button>
      </div>

      {/* Divisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {divisions.map((division) => (
          <div key={division.divisionsId} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {division.basicInfo?.bannerImage && (
              <div className="relative h-48 bg-gray-200">
                <Image
                  src={`${API_URL}${division.basicInfo.bannerImage}`}
                  alt={division.divisionsName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {division.status === 'inactive' && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    INACTIVE
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-1">{division.divisionsId}</div>
              <h3 className="text-lg font-semibold mb-2">{division.divisionsName}</h3>
              <p className="text-sm text-gray-600 mb-1">Slug: /{division.slug}</p>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {division.basicInfo?.shortDescription}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(division)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleStatus(division.divisionsId)}
                  className={`px-3 py-1 rounded text-sm ${
                    division.status === 'active'
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {division.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(division.divisionsId)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingDivision ? 'Edit Division' : 'Add New Division'}
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto border-b">
              {['basic', 'sub-divisions', 'contact'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Basic Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Division ID *</label>
                      <input
                        type="text"
                        value={formData.divisionsId}
                        onChange={(e) => setFormData({ ...formData, divisionsId: e.target.value.toUpperCase() })}
                        placeholder="IND_DISPLAY_001"
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                        disabled={!!editingDivision}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Division Name *</label>
                      <input
                        type="text"
                        value={formData.divisionsName}
                        onChange={(e) => setFormData({ ...formData, divisionsName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Slug *</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                        placeholder="india-display"
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Short Description *</label>
                    <textarea
                      value={formData.basicInfo.shortDescription}
                      onChange={(e) => setFormData({
                        ...formData,
                        basicInfo: { ...formData.basicInfo, shortDescription: e.target.value }
                      })}
                      rows={2}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Long Description</label>
                    <textarea
                      value={formData.basicInfo.longDescription}
                      onChange={(e) => setFormData({
                        ...formData,
                        basicInfo: { ...formData.basicInfo, longDescription: e.target.value }
                      })}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Banner Image *</label>
                    {formData.basicInfo.bannerImage && (
                      <div className="mb-4 relative h-48 bg-gray-200 rounded">
                        <Image
                          src={`${API_URL}${formData.basicInfo.bannerImage}`}
                          alt="Banner Preview"
                          fill
                          className="object-cover rounded"
                          sizes="500px"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'banner')}
                      className="w-full px-4 py-2 border rounded-lg"
                      disabled={uploading}
                    />
                    {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
                  </div>
                </div>
              )}

              {/* Sub-Divisions Tab */}
              {activeTab === 'sub-divisions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Sub-Divisions</h3>
                    <button
                      type="button"
                      onClick={addSubDivision}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      + Add Sub-Division
                    </button>
                  </div>

                  {formData.subDivisions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No sub-divisions yet. Click "+ Add Sub-Division" to create one.
                    </div>
                  ) : (
                    <>
                      {/* Sub-Division Tabs */}
                      <div className="flex gap-2 overflow-x-auto border-b mb-4">
                        {formData.subDivisions.map((sd, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setActiveSubDivIndex(index)}
                            className={`px-4 py-2 whitespace-nowrap ${
                              activeSubDivIndex === index
                                ? 'border-b-2 border-green-600 text-green-600 font-medium'
                                : 'text-gray-600'
                            }`}
                          >
                            {sd.subDivisionsName || `Sub-Division ${index + 1}`}
                          </button>
                        ))}
                      </div>

                      {/* Active Sub-Division Content */}
                      {formData.subDivisions[activeSubDivIndex] && (
                        <div className="space-y-6 border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Sub-Division {activeSubDivIndex + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeSubDivision(activeSubDivIndex)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove This Sub-Division
                            </button>
                          </div>

                          {/* Basic Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Sub-Division Name</label>
                              <input
                                type="text"
                                value={formData.subDivisions[activeSubDivIndex].subDivisionsName}
                                onChange={(e) => updateSubDivision(activeSubDivIndex, 'subDivisionsName', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Simple Description</label>
                              <input
                                type="text"
                                value={formData.subDivisions[activeSubDivIndex].simpleDivisions}
                                onChange={(e) => updateSubDivision(activeSubDivIndex, 'simpleDivisions', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>
                          </div>

                          {/* Key Features */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium">Key Features</label>
                              <button
                                type="button"
                                onClick={() => addKeyFeature(activeSubDivIndex)}
                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                + Add Feature
                              </button>
                            </div>
                            {formData.subDivisions[activeSubDivIndex].keyFeatures.map((feature, fIndex) => (
                              <div key={fIndex} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={feature}
                                  onChange={(e) => updateKeyFeature(activeSubDivIndex, fIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border rounded"
                                  placeholder="Feature description"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeKeyFeature(activeSubDivIndex, fIndex)}
                                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Global Partners */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium">Global Partners</label>
                              <button
                                type="button"
                                onClick={() => addPartner(activeSubDivIndex, 'globalPartners')}
                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                + Add Partner
                              </button>
                            </div>
                            {formData.subDivisions[activeSubDivIndex].globalPartners.map((partner, pIndex) => (
                              <div key={pIndex} className="border rounded p-3 mb-2 bg-white">
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">Partner {pIndex + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => removePartner(activeSubDivIndex, 'globalPartners', pIndex)}
                                    className="text-red-600 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                                {partner.imageUrl && (
                                  <div className="mb-2 relative h-16 w-16 bg-gray-200 rounded">
                                    <Image src={`${API_URL}${partner.imageUrl}`} alt="Partner" fill className="object-contain" sizes="64px" />
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, 'partner', activeSubDivIndex, pIndex)}
                                  className="text-xs px-2 py-1 border rounded w-full mb-2"
                                  disabled={uploading}
                                />
                                <input
                                  type="text"
                                  value={partner.name}
                                  onChange={(e) => updatePartner(activeSubDivIndex, 'globalPartners', pIndex, 'name', e.target.value)}
                                  placeholder="Partner Name"
                                  className="w-full px-2 py-1 border rounded mb-2"
                                />
                                <input
                                  type="text"
                                  value={partner.link}
                                  onChange={(e) => updatePartner(activeSubDivIndex, 'globalPartners', pIndex, 'link', e.target.value)}
                                  placeholder="Partner Website URL"
                                  className="w-full px-2 py-1 border rounded"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Brands (same as partners) */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium">Brands</label>
                              <button
                                type="button"
                                onClick={() => addPartner(activeSubDivIndex, 'brands')}
                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                + Add Brand
                              </button>
                            </div>
                            {formData.subDivisions[activeSubDivIndex].brands.map((brand, bIndex) => (
                              <div key={bIndex} className="border rounded p-3 mb-2 bg-white">
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">Brand {bIndex + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => removePartner(activeSubDivIndex, 'brands', bIndex)}
                                    className="text-red-600 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                                {brand.imageUrl && (
                                  <div className="mb-2 relative h-16 w-16 bg-gray-200 rounded">
                                    <Image src={`${API_URL}${brand.imageUrl}`} alt="Brand" fill className="object-contain" sizes="64px" />
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, 'brand', activeSubDivIndex, bIndex)}
                                  className="text-xs px-2 py-1 border rounded w-full mb-2"
                                  disabled={uploading}
                                />
                                <input
                                  type="text"
                                  value={brand.name}
                                  onChange={(e) => updatePartner(activeSubDivIndex, 'brands', bIndex, 'name', e.target.value)}
                                  placeholder="Brand Name"
                                  className="w-full px-2 py-1 border rounded mb-2"
                                />
                                <input
                                  type="text"
                                  value={brand.link}
                                  onChange={(e) => updatePartner(activeSubDivIndex, 'brands', bIndex, 'link', e.target.value)}
                                  placeholder="Brand Website URL"
                                  className="w-full px-2 py-1 border rounded"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Sections */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium">Sections</label>
                              <button
                                type="button"
                                onClick={() => addSection(activeSubDivIndex)}
                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                + Add Section
                              </button>
                            </div>
                            {formData.subDivisions[activeSubDivIndex].sections.map((section, sIndex) => (
                              <div key={sIndex} className="border rounded p-3 mb-2 bg-white">
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">Section {sIndex + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeSection(activeSubDivIndex, sIndex)}
                                    className="text-red-600 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) => updateSection(activeSubDivIndex, sIndex, 'title', e.target.value)}
                                  placeholder="Section Title"
                                  className="w-full px-2 py-1 border rounded mb-2"
                                />
                                <textarea
                                  value={section.description}
                                  onChange={(e) => updateSection(activeSubDivIndex, sIndex, 'description', e.target.value)}
                                  placeholder="Section Description"
                                  rows={2}
                                  className="w-full px-2 py-1 border rounded"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Responsible Persons */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium">Responsible Persons</label>
                              <button
                                type="button"
                                onClick={() => addResponsiblePerson(activeSubDivIndex)}
                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                + Add Person
                              </button>
                            </div>
                            {formData.subDivisions[activeSubDivIndex].responsiblePersons.map((person, rpIndex) => (
                              <div key={rpIndex} className="border rounded p-3 mb-2 bg-white">
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">Person {rpIndex + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeResponsiblePerson(activeSubDivIndex, rpIndex)}
                                    className="text-red-600 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                                {person.profileImage && (
                                  <div className="mb-2 relative h-20 w-20 bg-gray-200 rounded-full overflow-hidden">
                                    <Image src={`${API_URL}${person.profileImage}`} alt="Person" fill className="object-cover" sizes="80px" />
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, 'person', activeSubDivIndex, rpIndex)}
                                  className="text-xs px-2 py-1 border rounded w-full mb-2"
                                  disabled={uploading}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={person.name}
                                    onChange={(e) => updateResponsiblePerson(activeSubDivIndex, rpIndex, 'name', e.target.value)}
                                    placeholder="Name"
                                    className="px-2 py-1 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={person.designation}
                                    onChange={(e) => updateResponsiblePerson(activeSubDivIndex, rpIndex, 'designation', e.target.value)}
                                    placeholder="Designation"
                                    className="px-2 py-1 border rounded"
                                  />
                                  <input
                                    type="email"
                                    value={person.email}
                                    onChange={(e) => updateResponsiblePerson(activeSubDivIndex, rpIndex, 'email', e.target.value)}
                                    placeholder="Email"
                                    className="px-2 py-1 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={person.contactNumber}
                                    onChange={(e) => updateResponsiblePerson(activeSubDivIndex, rpIndex, 'contactNumber', e.target.value)}
                                    placeholder="Contact Number"
                                    className="px-2 py-1 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={person.whatsAppNumber}
                                    onChange={(e) => updateResponsiblePerson(activeSubDivIndex, rpIndex, 'whatsAppNumber', e.target.value)}
                                    placeholder="WhatsApp Number"
                                    className="px-2 py-1 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={person.vCard}
                                    onChange={(e) => updateResponsiblePerson(activeSubDivIndex, rpIndex, 'vCard', e.target.value)}
                                    placeholder="vCard URL"
                                    className="px-2 py-1 border rounded"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Contact Us Information</h3>
                  
                  {/* Location */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Location (Google Maps)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Latitude"
                        value={formData.contactUs.location.latitude}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactUs: {
                            ...formData.contactUs,
                            location: { ...formData.contactUs.location, latitude: e.target.value }
                          }
                        })}
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Longitude"
                        value={formData.contactUs.location.longitude}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactUs: {
                            ...formData.contactUs,
                            location: { ...formData.contactUs.location, longitude: e.target.value }
                          }
                        })}
                        className="px-3 py-2 border rounded"
                      />
                    </div>
                  </div>

                  {/* Contacts */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Contact Details</h4>
                      <button
                        type="button"
                        onClick={addContact}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        + Add Contact
                      </button>
                    </div>
                    {formData.contactUs.contacts.map((contact, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50 mb-3">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium">Contact {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Title (e.g., Sales Office)"
                            value={contact.title}
                            onChange={(e) => updateContact(index, 'title', e.target.value)}
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={contact.email}
                            onChange={(e) => updateContact(index, 'email', e.target.value)}
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="text"
                            placeholder="Phone Number"
                            value={contact.number}
                            onChange={(e) => updateContact(index, 'number', e.target.value)}
                            className="px-3 py-2 border rounded"
                          />
                          <textarea
                            placeholder="Description"
                            value={contact.description}
                            onChange={(e) => updateContact(index, 'description', e.target.value)}
                            rows={2}
                            className="px-3 py-2 border rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  disabled={uploading || !formData.basicInfo.bannerImage}
                >
                  {editingDivision ? 'Update Division' : 'Create Division'}
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