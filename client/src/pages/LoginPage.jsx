import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { LogIn, ArrowRight, UserCheck, Shield } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoSeniorLogin, demoFamilyLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSenior = async () => {
    setLoading(true);
    await demoSeniorLogin();
    navigate('/dashboard');
  };

  const handleDemoFamily = async () => {
    setLoading(true);
    await demoFamilyLogin();
    navigate('/family');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-6 sm:p-10 max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-5xl block mb-2">👵</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Welcome Back
          </h2>
          <p className="text-lg sm:text-xl text-slate-600">
            Sign in to continue your personal technology lessons.
          </p>
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-5 space-y-3">
          <p className="text-base sm:text-lg font-bold text-blue-950 text-center">
            🚀 Try Instantly With Demo Accounts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDemoSenior}
              type="button"
              className="p-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-base sm:text-lg text-center shadow-sm transition-all focus:ring-4 focus:ring-blue-300"
            >
              👵 Grandma Asha (Senior)
            </button>
            <button
              onClick={handleDemoFamily}
              type="button"
              className="p-3.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-base sm:text-lg text-center shadow-sm transition-all focus:ring-4 focus:ring-purple-300"
            >
              🧑‍💼 Rahul (Caregiver)
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-base sm:text-lg font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-lg sm:text-xl font-bold text-slate-900">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., asha@elderease.com"
              className="w-full px-5 py-4 text-lg sm:text-xl border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg sm:text-xl font-bold text-slate-900">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 text-lg sm:text-xl border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <SeniorButton
            type="submit"
            disabled={loading}
            variant="primary"
            size="xl"
            fullWidth
            icon={LogIn}
            className="mt-4"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </SeniorButton>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-base sm:text-lg text-slate-600">
            Don’t have an account yet?{' '}
            <Link to="/signup" className="text-blue-700 font-extrabold hover:underline">
              Sign Up for Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
