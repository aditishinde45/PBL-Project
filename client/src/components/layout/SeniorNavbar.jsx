import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Home,
  BookOpen,
  Mic,
  ShieldCheck,
  TrendingUp,
  User,
  Settings,
  Users,
  LogOut
} from 'lucide-react';

export const SeniorNavbar = () => {
  const { user, isAuthenticated, logout, isFamily } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Learn', path: '/library', icon: BookOpen },
    { name: 'Ask AI', path: '/teacher', icon: Mic, highlight: true },
    { name: 'Safety', path: '/safety', icon: ShieldCheck },
    { name: 'Progress', path: '/progress', icon: TrendingUp }
  ];

  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <NavLink
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-3 group focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-2xl p-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
              👵
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 block leading-none">
                Elder<span className="text-blue-700">Ease</span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 block mt-0.5">
                AI Technology Teacher
              </span>
            </div>
          </NavLink>

          {/* Senior 5 Core Navigation Items (Desktop & Laptop) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-2 lg:gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-4 py-3 rounded-2xl text-lg font-bold transition-all ${
                        isActive
                          ? item.highlight
                            ? 'bg-blue-700 text-white shadow-md'
                            : 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                          : item.highlight
                          ? 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-6 h-6" strokeWidth={2.3} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Family Portal Quick Switch */}
                <NavLink
                  to="/family"
                  className={({ isActive }) =>
                    `hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-base font-bold border-2 transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-900 border-purple-600'
                        : 'bg-white hover:bg-purple-50 text-purple-800 border-purple-200'
                    }`
                  }
                  title="Family & Caregiver View"
                >
                  <Users className="w-5 h-5 text-purple-700" />
                  <span>Family</span>
                </NavLink>

                {/* Settings */}
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `p-2.5 rounded-2xl border-2 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                      isActive
                        ? 'bg-blue-50 border-blue-600 text-blue-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`
                  }
                  title="Accessibility & Settings"
                  aria-label="Settings"
                >
                  <Settings className="w-6 h-6" />
                </NavLink>

                {/* Profile */}
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-2xl border-2 border-slate-200 hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
                  title="My Profile"
                >
                  <span className="text-2xl" role="img" aria-label="avatar">
                    {user?.avatar || '👵'}
                  </span>
                  <span className="hidden xl:inline text-base font-bold text-slate-800 pr-2">
                    {user?.name?.split(' ')[0] || 'Profile'}
                  </span>
                </NavLink>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-200 transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <NavLink
                  to="/login"
                  className="px-5 py-2.5 text-lg font-bold text-slate-800 hover:text-blue-700 rounded-xl transition-colors"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-6 py-3 text-lg font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-2xl shadow-sm transition-all"
                >
                  Start Learning
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
