import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BeakerIcon } from 'lucide-react';
import truckImage from '../assets/truck.png';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'admin@epa.com' && password === 'admin123') {
      login(email);
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password');
    }
  };

  const handleAutoFill = () => {
    setEmail('admin@epa.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side: Image layout */}
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-gray-200">
       
        <img 
          className="absolute inset-0 h-full w-full object-cover" 
          src={truckImage} 
          alt="Blue Truck" 
        />
        {/* <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ethiopian Petroleum Agency</h2>
          <p className="text-lg text-blue-100 max-w-lg">
            Managing and optimizing the national petroleum supply chain with real-time tracking, insights, and analytics.
          </p>
        </div> */}
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24 bg-gray-50">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="flex flex-col items-center lg:items-start">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <BeakerIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-center lg:text-left text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center lg:text-left text-sm text-gray-600 block lg:hidden">
              Ethiopian Petroleum Agency
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Sign in
                </button>
              </div>
            </form>

            {/* Temporarily added auto-fill button for testing */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={handleAutoFill}
                className="w-full flex justify-center py-2 px-4 border text-blue-700 border-blue-600 rounded-md shadow-sm text-sm font-medium bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Auto Fill Credentials
              </button>
              <p className="mt-2 text-xs text-center text-gray-500">
                (Remove this button in production)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
