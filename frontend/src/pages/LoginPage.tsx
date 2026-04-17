import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import truckImage from '../assets/truck.png';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (credentials: {email: string, password: string}) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // data contains { token, user: {id, name, email, role, company_id} }
      login(data.user, data.token);
      navigate('/', { replace: true });
    },
    onError: (err: any) => {
      if (err.response && err.response.data && err.response.data.message) {
         setErrorMsg(err.response.data.message);
      } else {
         setErrorMsg('Invalid email or password');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    mutation.mutate({ email, password });
  };

  return (
    <div className="relative h-screen overflow-hidden flex items-center justify-center bg-gray-900">
      <div className="absolute inset-0 z-0">
        <img 
          className="absolute inset-0 h-full w-full object-cover blur-[6px] scale-105" 
          src={truckImage} 
          alt="Blue Truck Background" 
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gray-900/40" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4 lg:max-w-md scale-90 sm:scale-95 lg:scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="bg-white/90 p-3 rounded-2xl shadow-lg mb-5 inline-block">
            <img src={logo} alt="Company Logo" className="h-14 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">
            Petroleum & Energy Authority
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
                  disabled={mutation.isPending}
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
                  disabled={mutation.isPending}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white/80"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-600 text-sm bg-red-50/90 p-2 rounded-lg border border-red-100">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-strong disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
              >
                {mutation.isPending ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

