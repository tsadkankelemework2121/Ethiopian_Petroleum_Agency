import { useState } from 'react'
import { useNavigate} from 'react-router-dom'
import { ArrowLeftIcon, CameraIcon, PencilIcon } from '@heroicons/react/24/outline'
import { Card, CardBody } from '../components/ui/Card'

export default function ProfilePage() {
  const navigate = useNavigate()

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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB')
      return
    }

    // Validate file type
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
    // Validate name
    if (!formData.name.trim()) {
      setErrorMessage('Name cannot be empty')
      return
    }

    // Validate passwords if any password field is filled
    if (
      formData.currentPassword ||
      formData.password ||
      formData.confirmPassword
    ) {
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

    // Simulate API call
    setSuccessMessage('Profile updated successfully!')
    setErrorMessage('')
    setIsEditing(false)
    setShowPasswordSection(false)

    // Clear password fields after successful save
    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      password: '',
      confirmPassword: '',
    }))

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleLogout = () => navigate('/')

  const handleCancel = () => {
    setIsEditing(false)
    setShowPasswordSection(false)
    setErrorMessage('')
    // Reset to original values (you might want to store original values in state)
    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      password: '',
      confirmPassword: '',
    }))
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 font-medium transition group"
        style={{ color: '#27A2D8' }}
      >
        <ArrowLeftIcon className="size-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Messages */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="space-y-8">
            {/* Header with Profile Image and Name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-6">
                {/* Profile Image with Upload Button */}
                <div className="relative group">
                  <div className="size-28 rounded-2xl overflow-hidden bg-gradient-to-br from-[#27A2D8]/10 to-[#27A2D8]/5 border-2 border-gray-200 shadow-sm">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <CameraIcon className="size-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Image Upload Button - Always visible with hover effect */}
                  <label 
                    className="absolute -bottom-2 -right-2 text-white rounded-xl p-2.5 cursor-pointer transition-all hover:scale-110 border-2 border-white shadow-lg"
                    style={{ backgroundColor: '#27A2D8' }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <CameraIcon className="size-5" />
                  </label>
                </div>

                {/* Name and Role */}
                <div className="space-y-1.5">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-gray-900 border-b-2 outline-none pb-1 w-full bg-transparent"
                      style={{ borderColor: '#27A2D8' }}
                      placeholder="Enter your name"
                      autoFocus
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">
                      {formData.name}
                    </h1>
                  )}
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: '#27A2D8' }}></span>
                    Administrator Account
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all hover:shadow-md flex items-center gap-2"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>

            {/* Edit Toggle and Profile Information Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all hover:shadow-md"
                  style={{ backgroundColor: '#27A2D8' }}
                >
                  <PencilIcon className="size-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Email (Always visible) */}
              <div className="bg-gray-50 rounded-xl p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
              </div>

              {/* Password Change Section - Always visible when editing */}
              {isEditing && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 transition-colors group"
                    style={{ hover: { borderColor: '#27A2D8' } }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#27A2D8'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                  >
                    <span className="font-medium text-gray-900">Change Password</span>
                    <svg 
                      className={`size-5 text-gray-500 transition-transform duration-200 ${showPasswordSection ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showPasswordSection && (
                    <div className="space-y-4 p-5 rounded-xl bg-gray-50 border border-gray-200 animate-slide-down">
                      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Update your password
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-1 outline-none transition"
                          style={{ focus: { borderColor: '#27A2D8', ringColor: '#27A2D8' } }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27A2D8'
                            e.target.style.boxShadow = `0 0 0 1px #27A2D8`
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db'
                            e.target.style.boxShadow = 'none'
                          }}
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27A2D8'
                            e.target.style.boxShadow = `0 0 0 1px #27A2D8`
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db'
                            e.target.style.boxShadow = 'none'
                          }}
                          placeholder="Enter new password (min. 6 characters)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27A2D8'
                            e.target.style.boxShadow = `0 0 0 1px #27A2D8`
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db'
                            e.target.style.boxShadow = 'none'
                          }}
                          placeholder="Confirm new password"
                        />
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="pt-8 border-t border-gray-200 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="text-white px-6 py-2.5 rounded-xl font-medium transition-all hover:shadow-md"
                  style={{ backgroundColor: '#27A2D8' }}
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-xl font-medium border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Add custom animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        /* Custom focus styles */
        input:focus {
          border-color: #27A2D8 !important;
          box-shadow: 0 0 0 1px #27A2D8 !important;
        }
        
        /* Custom hover for password button */
        .hover\\:border-\\[\\#27A2D8\\]:hover {
          border-color: #27A2D8 !important;
        }
      `}</style>
    </div>
  )
}