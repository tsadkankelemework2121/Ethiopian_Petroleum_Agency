import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, CameraIcon, PencilIcon } from '@heroicons/react/24/outline'
import { Card, CardBody } from '../components/ui/Card'
import defaultProfile from '../assets/profile.jpg'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [formData, setFormData] = useState({
    name: 'PEA Admin',
    email: 'admin@epa.gov.et',
    currentPassword: '',
    password: '',
    confirmPassword: '',
    image: '',
  })

  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showPasswordSection, setShowPasswordSection] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setFormData((prev) => ({
        ...prev,
        image: base64,
      }))
      setErrorMessage('')
    }
    reader.onerror = () => {
      setErrorMessage('Error reading file')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Name cannot be empty')
      return
    }

    if (formData.currentPassword || formData.password || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setErrorMessage('Current password is required to change password')
        return
      }

      if (!formData.password) {
        setErrorMessage('New password is required')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('New passwords do not match')
        return
      }

      if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters')
        return
      }
    }

    setSuccessMessage('Profile updated successfully!')
    setErrorMessage('')
    setIsEditing(false)
    setShowPasswordSection(false)

    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      password: '',
      confirmPassword: '',
    }))

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setShowPasswordSection(false)
    setErrorMessage('')

    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      password: '',
      confirmPassword: '',
    }))
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 font-medium transition group text-primary"
      >
        <ArrowLeftIcon className="size-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardBody>
          <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-6">

                {/* Profile Image */}
                <div className="relative">
                  <div className="size-28 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-sm">
                    <img
                      src={formData.image || defaultProfile}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <label className="absolute -bottom-2 -right-2 bg-primary text-white rounded-xl p-2.5 cursor-pointer border-2 border-white shadow-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <CameraIcon className="size-5" />
                  </label>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-2xl font-bold border-b-2 outline-none pb-1 border-primary"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">
                      {formData.name}
                    </h1>
                  )}
                  <p className="text-sm text-gray-500">Administrator Account</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
              >
                Logout
              </button>
            </div>

            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium bg-primary hover:bg-primary-strong"
                >
                  <PencilIcon className="size-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Email */}
            <div className="bg-gray-50 rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
              />
            </div>

            {/* Password Section */}
            {isEditing && (
              <div className="space-y-4">

                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="w-full flex justify-between p-4 rounded-xl border-2 border-gray-200"
                >
                  Change Password
                </button>

                {showPasswordSection && (
                  <div className="space-y-4 p-5 rounded-xl bg-gray-50 border">

                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Current password"
                      className="w-full border px-4 py-3 rounded-lg"
                    />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="New password"
                      className="w-full border px-4 py-3 rounded-lg"
                    />

                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      className="w-full border px-4 py-3 rounded-lg"
                    />

                  </div>
                )}

              </div>
            )}

            {/* Actions */}
            {isEditing && (
              <div className="pt-8 border-t flex gap-3">
                <button
                  onClick={handleSave}
                  className="text-white px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-strong"
                >
                  Save Changes
                </button>

                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-xl border"
                >
                  Cancel
                </button>
              </div>
            )}

          </div>
        </CardBody>
      </Card>
    </div>
  )
}