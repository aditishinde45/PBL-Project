import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { UserPlus, Heart, Users } from 'lucide-react';

export const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('senior');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register({
        name,
        email,
        password,
        role,
        preferredLanguage
      });
      if (res.success) {
        if (role === 'senior') {
          navigate('/onboarding');
        } else {
          navigate('/family');
        }
      }
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-6 sm:p-10 max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-5xl block mb-2">🌸</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Create Your Account
          </h2>
          <p className="text-lg sm:text-xl text-slate-600">
            Begin your calm, step-by-step learning journey today.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-base sm:text-lg font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Picker */}
          <div className="space-y-2">
            <label className="block text-lg sm:text-xl font-bold text-slate-900">
              I am signing up as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('senior')}
                className={`p-4 rounded-2xl border-2 font-bold text-lg flex flex-col items-center gap-1 transition-all ${
                  role === 'senior'
                    ? 'bg-blue-100 border-blue-600 text-blue-950 ring-2 ring-blue-300'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl">👵</span>
                <span>Senior Learner</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('family')}
                className={`p-4 rounded-2xl border-2 font-bold text-lg flex flex-col items-center gap-1 transition-all ${
                  role === 'family'
                    ? 'bg-purple-100 border-purple-600 text-purple-950 ring-2 ring-purple-300'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl">🧑‍💼</span>
                <span>Family Caregiver</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-lg sm:text-xl font-bold text-slate-900">
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Asha Sharma"
              className="w-full px-5 py-4 text-lg sm:text-xl border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg sm:text-xl font-bold text-slate-900">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., asha@gmail.com"
              className="w-full px-5 py-4 text-lg sm:text-xl border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg sm:text-xl font-bold text-slate-900">
              Create a Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-5 py-4 text-lg sm:text-xl border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg sm:text-xl font-bold text-slate-900">
              Preferred Language for Lessons
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-5 py-4 text-lg sm:text-xl border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 bg-white"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>

          <SeniorButton
            type="submit"
            disabled={loading}
            variant="primary"
            size="xl"
            fullWidth
            icon={UserPlus}
            className="mt-4 shadow-lg"
          >
            {loading ? 'Creating Account...' : 'Continue to Learning'}
          </SeniorButton>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-base sm:text-lg text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-extrabold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
