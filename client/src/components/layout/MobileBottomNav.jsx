import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Home, BookOpen, Mic, ShieldCheck, TrendingUp } from 'lucide-react';

export const MobileBottomNav = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  const items = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Learn', path: '/library', icon: BookOpen },
    { name: 'Ask AI', path: '/teacher', icon: Mic, highlight: true },
    { name: 'Safety', path: '/safety', icon: ShieldCheck },
    { name: 'Progress', path: '/progress', icon: TrendingUp }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-slate-200 shadow-lg px-2 py-1.5"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[60px] py-1.5 px-2 rounded-2xl transition-all ${
                  item.highlight
                    ? isActive
                      ? 'bg-blue-700 text-white shadow-md scale-105'
                      : 'bg-blue-100 text-blue-900 font-bold'
                    : isActive
                    ? 'text-blue-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              <Icon className={item.highlight ? 'w-7 h-7' : 'w-6 h-6'} strokeWidth={item.highlight ? 2.8 : 2.2} />
              <span className="text-xs sm:text-sm font-bold mt-1 tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
