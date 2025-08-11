import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import React, { useState } from 'react';

type RegisterStaffForm = {
  username: string;
  email: string;
  password: string;
  is_data_admin: boolean;
};

export default function RegisterStaff() {
  const { register, handleSubmit } = useForm<RegisterStaffForm>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (data: RegisterStaffForm) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/register-admin/', data);
      console.log("staff registration payload:", data);
      navigate('/login');
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.detail ||
        error?.response?.data?.username?.[0] ||
        error?.response?.data?.email?.[0] ||
        "Staff registration failed. Please check your input."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Register Staff/Admin</h2>
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
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email', { required: true })}
              className="input-field"
              type="email"
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
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('is_data_admin')}
                className="mr-2"
                disabled={loading}
              />
              Register as Data Admin
            </label>
          </div>
          {errorMsg && (
            <div className="text-red-600 text-sm">{errorMsg}</div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Staff Account"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}