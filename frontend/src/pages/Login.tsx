import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import api from '../api/client';

type LoginForm = {
  username: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<LoginForm>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setErrorMsg(null);
    console.log("Login payload:", data); // <-- Add this line
    try {
      const response = await api.post('/login/', data);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('is_data_admin', response.data.is_data_admin);
      if (response.data.is_data_admin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.detail ||
        error?.response?.data?.non_field_errors?.[0] ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              {...register('username', { required: true })}
              className="input-field"
              type="text"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              {...register('password', { required: true })}
              className="input-field"
              type="password"
              disabled={loading}
            />
          </div>
          {errorMsg && (
            <div className="text-red-600 text-sm">{errorMsg}</div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/register" className="text-indigo-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}