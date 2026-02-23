import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/outline'
import { Card, CardBody } from '../components/ui/Card'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: 'PEA Admin',
    email: 'admin@epa.gov.et',
    password: '',
    confirmPassword: '',
    image: 'PA',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrorMessage('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setFormData((prev) => ({
          ...prev,
          image: base64,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Name cannot be empty')
      return
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match')
        return
      }
      if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters')
        return
      }
    }

    setSuccessMessage('Profile updated successfully!')
    setIsEditing(false)
    setFormData((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }))

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-strong transition"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </button>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Profile Card */}
      <Card>
        <CardBody>
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#D1D5DB]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {typeof formData.image === 'string' && formData.image.startsWith('data:') ? (
                    <img src={formData.image} alt="Profile" className="size-24 rounded-lg object-cover" />
                  ) : (
                    <div className="grid size-24 place-items-center rounded-lg bg-primary text-white font-bold text-2xl">
                      {formData.image}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute -right-2 -bottom-2 p-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-strong transition">
                      <CameraIcon className="size-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text">{formData.name}</h1>
                  <p className="text-sm text-text-muted">Administrator Account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>

            {/* Edit/View Toggle */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-text">Profile Information</h2>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isEditing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-primary text-white hover:bg-primary-strong'
                }`}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border px-4 py-2 text-sm outline-none transition ${
                    isEditing
                      ? 'border-[#D1D5DB] bg-white focus:ring-2 focus:ring-primary/40'
                      : 'border-[#D1D5DB] bg-muted text-text-muted cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Email (Cannot be changed)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-lg border border-[#D1D5DB] bg-muted px-4 py-2 text-sm text-text-muted cursor-not-allowed"
                />
              </div>

              {/* Password Field */}
              {isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">New Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Leave empty to keep current password"
                      className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-6 border-t border-[#D1D5DB]">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 bg-primary text-white font-medium py-2 px-4 rounded-lg hover:bg-primary-strong transition"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
