import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import truckImage from '../assets/truck.png';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'admin@epa.com' && password === 'admin123') {
      login(email);
      navigate('/', { replace: true });
    } else {
      setError('Invalid email or password');
    }
  };

  const handleAutoFill = () => {
    setEmail('admin@epa.com');
    setPassword('admin123');
  };

  return (
    <div className="relative h-screen overflow-hidden flex items-center justify-center bg-gray-900">
      {/* Background Image with blur */}
      <div className="absolute inset-0 z-0">
        <img 
          className="absolute inset-0 h-full w-full object-cover blur-[6px] scale-105" 
          src={truckImage} 
          alt="Blue Truck Background" 
        />
        {/* Overlays for readability and brand tint */}
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gray-900/40" />
      </div>

      {/* Login form container */}
      <div className="relative z-10 w-full max-w-sm px-4 lg:max-w-md scale-90 sm:scale-95 lg:scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="bg-white/90 p-3 rounded-2xl shadow-lg mb-5 inline-block">
            <img src={logo} alt="Company Logo" className="h-14 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">
            Ethiopian Petroleum Agency
          </h1>
          <h2 className="mt-3 text-xl font-medium text-gray-200 drop-shadow-sm">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-6 bg-white/95 backdrop-blur-md py-6 px-4 shadow-2xl sm:rounded-2xl sm:px-8 border border-white/20">
          <form className="space-y-4" onSubmit={handleSubmit}>
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white/80"
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white/80"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50/90 p-2 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-strong focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={handleAutoFill}
              className="w-full flex justify-center py-2.5 px-4 border text-primary border-primary rounded-lg shadow-sm text-sm font-bold bg-blue-50/50 hover:bg-blue-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Auto Fill Credentials
            </button>
            <p className="mt-3 text-xs text-center text-gray-500 font-medium">
              ( email:admin@epa.com password:admin123)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
