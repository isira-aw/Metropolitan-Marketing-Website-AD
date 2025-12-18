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

interface ManagementTeamMember {
  name: string
  designation: string
  profileImage: string
}

interface Milestone {
  year: number
  description: string
  image: string
}

interface AboutUs {
  id: number
  companyName: string
  companyDescription: string
  ownerName: string
  ownerTitle: string
  ownerDescription: string
  ownerImageUrl: string
  introduction: string
  managementTeamJson: string
  milestonesJson: string
}

export default function AboutManagementPage() {
  const [data, setData] = useState<AboutUs>({
    id: 0,
    companyName: '',
    companyDescription: '',
    ownerName: '',
    ownerTitle: '',
    ownerDescription: '',
    ownerImageUrl: '',
    introduction: '',
    managementTeamJson: '[]',
    milestonesJson: '[]',
  })
  
  const [managementTeam, setManagementTeam] = useState<ManagementTeamMember[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
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
      const response = await apiClient.get('/api/admin/about')
      const aboutData = response.data
      setData(aboutData)
      
      // Parse JSON fields
      if (aboutData.managementTeamJson) {
        try {
          setManagementTeam(JSON.parse(aboutData.managementTeamJson))
        } catch (e) {
          setManagementTeam([])
        }
      }
      
      if (aboutData.milestonesJson) {
        try {
          setMilestones(JSON.parse(aboutData.milestonesJson))
        } catch (e) {
          setMilestones([])
        }
      }
    } catch (error) {
      console.error('Error fetching about data:', error)
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

  // Chairman Image Upload
  const handleChairmanImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, 'chairman', (url) => {
      setData(prev => ({ ...prev, ownerImageUrl: url }))
    })
  }

  // Management Team Functions
  const addManagementMember = () => {
    setManagementTeam([...managementTeam, { name: '', designation: '', profileImage: '' }])
  }

  const updateManagementMember = (index: number, field: keyof ManagementTeamMember, value: string) => {
    const updated = [...managementTeam]
    updated[index] = { ...updated[index], [field]: value }
    setManagementTeam(updated)
  }

  const removeManagementMember = (index: number) => {
    setManagementTeam(managementTeam.filter((_, i) => i !== index))
  }

  const handleManagementImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    handleFileUpload(e, `management-${index}`, (url) => {
      updateManagementMember(index, 'profileImage', url)
    })
  }

  // Milestones Functions
  const addMilestone = () => {
    setMilestones([...milestones, { year: new Date().getFullYear(), description: '', image: '' }])
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const handleMilestoneImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    handleFileUpload(e, `milestone-${index}`, (url) => {
      updateMilestone(index, 'image', url)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const payload = {
        ...data,
        managementTeamJson: JSON.stringify(managementTeam),
        milestonesJson: JSON.stringify(milestones)
      }
      
      await apiClient.put('/api/admin/about', payload)
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
      <h1 className="text-3xl font-bold mb-8 text-gray-900">About Us Management</h1>

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
        {/* Introduction Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Company Introduction</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Introduction Text
            </label>
            <textarea
              value={data.introduction}
              onChange={(e) => setData({ ...data, introduction: e.target.value })}
              rows={4}
              placeholder="Enter a welcoming introduction message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chairman Information */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Chairman Information</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chairman Name
              </label>
              <input
                type="text"
                value={data.companyName}
                onChange={(e) => setData({ ...data, companyName: e.target.value })}
                placeholder="Enter chairman name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chairman Message
              </label>
              <textarea
                value={data.companyDescription}
                onChange={(e) => setData({ ...data, companyDescription: e.target.value })}
                rows={6}
                placeholder="Enter chairman's message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chairman Image
              </label>
              {data.ownerImageUrl && (
                <div className="mb-4 relative h-64 w-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={`${API_URL}${data.ownerImageUrl}`}
                    alt="Chairman"
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-200">
                  <UploadIcon />
                  <span className="text-sm font-medium">
                    {uploadingFields['chairman'] ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChairmanImageUpload}
                    className="hidden"
                    disabled={uploadingFields['chairman']}
                  />
                </label>
                {uploadingFields['chairman'] && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Owner/Team Leader Information */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Owner/Team Leader Information</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={data.ownerName}
                onChange={(e) => setData({ ...data, ownerName: e.target.value })}
                placeholder="Enter owner name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title/Position
              </label>
              <input
                type="text"
                value={data.ownerTitle}
                onChange={(e) => setData({ ...data, ownerTitle: e.target.value })}
                placeholder="e.g., Founder & CEO"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={data.ownerDescription}
                onChange={(e) => setData({ ...data, ownerDescription: e.target.value })}
                rows={6}
                placeholder="Enter owner description..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Management Team Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Management Team</h2>
            <button
              type="button"
              onClick={addManagementMember}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <PlusIcon />
              Add Member
            </button>
          </div>

          <div className="space-y-6">
            {managementTeam.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No management team members added yet</p>
                <button
                  type="button"
                  onClick={addManagementMember}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <PlusIcon />
                  Add First Member
                </button>
              </div>
            ) : (
              managementTeam.map((member, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Member #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeManagementMember(index)}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <TrashIcon />
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateManagementMember(index, 'name', e.target.value)}
                        placeholder="Enter name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={member.designation}
                        onChange={(e) => updateManagementMember(index, 'designation', e.target.value)}
                        placeholder="e.g., CTO, VP of Sales"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Image
                    </label>
                    {member.profileImage && (
                      <div className="mb-3 relative h-32 w-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={`${API_URL}${member.profileImage}`}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-200">
                        <UploadIcon />
                        <span className="text-sm font-medium">
                          {uploadingFields[`management-${index}`] ? 'Uploading...' : 'Upload Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleManagementImageUpload(e, index)}
                          className="hidden"
                          disabled={uploadingFields[`management-${index}`]}
                        />
                      </label>
                      {uploadingFields[`management-${index}`] && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Company Milestones</h2>
            <button
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <PlusIcon />
              Add Milestone
            </button>
          </div>

          <div className="space-y-6">
            {milestones.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No milestones added yet</p>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <PlusIcon />
                  Add First Milestone
                </button>
              </div>
            ) : (
              milestones.map((milestone, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Milestone #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <TrashIcon />
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <input
                        type="number"
                        value={milestone.year}
                        onChange={(e) => updateMilestone(index, 'year', parseInt(e.target.value) || 0)}
                        placeholder="e.g., 2020"
                        min="1900"
                        max="2100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="e.g., Company Founded, Reached 1M Users"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Milestone Image
                    </label>
                    {milestone.image && (
                      <div className="mb-3 relative h-40 w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={`${API_URL}${milestone.image}`}
                          alt={`${milestone.year} - ${milestone.description}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 600px"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-200">
                        <UploadIcon />
                        <span className="text-sm font-medium">
                          {uploadingFields[`milestone-${index}`] ? 'Uploading...' : 'Upload Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMilestoneImageUpload(e, index)}
                          className="hidden"
                          disabled={uploadingFields[`milestone-${index}`]}
                        />
                      </label>
                      {uploadingFields[`milestone-${index}`] && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
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