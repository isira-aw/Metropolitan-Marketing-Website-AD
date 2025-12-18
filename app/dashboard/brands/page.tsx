'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'

interface Brand {
  id: number
  name: string
}

export default function BrandManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [brandName, setBrandName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<Brand[]>('/api/admin/brands')
      setBrands(response.data)
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingBrand) {
        await apiClient.put(`/api/admin/brands/${editingBrand.id}`, { name: brandName })
        setSuccess('Brand updated successfully')
      } else {
        await apiClient.post('/api/admin/brands', { name: brandName })
        setSuccess('Brand created successfully')
      }
      setShowModal(false)
      setBrandName('')
      setEditingBrand(null)
      fetchBrands()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.response?.data || 'Failed to save brand')
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setBrandName(brand.name)
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
      alert('Failed to delete brand')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Brand Management</h1>
        <button
          onClick={() => {
            setEditingBrand(null)
            setBrandName('')
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + Add New Brand
        </button>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td className="px-6 py-4">{brand.id}</td>
                <td className="px-6 py-4 font-medium">{brand.name}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {brands.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
          <p className="text-gray-500">No brands yet. Add your first brand!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                  placeholder="e.g., Samsung, Apple, Sony"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  {editingBrand ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setBrandName('')
                    setEditingBrand(null)
                    setError('')
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