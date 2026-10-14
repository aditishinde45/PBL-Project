import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Mic,
  BookOpen,
  Camera,
  ShieldCheck,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Heart,
  Sparkles
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, demoSeniorLogin } = useAuth();
  const navigate = useNavigate();

  const handleTryDemo = async () => {
    await demoSeniorLogin();
    navigate('/dashboard');
  };

  const featureCards = [
    {
      title: 'Learn Step by Step',
      desc: 'We explain only one simple action at a time. No rush, no stress. You press "Done" whenever you are ready.',
      icon: '👣',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Ask Using Your Voice',
      desc: 'Speak naturally in English, Hindi, Marathi, or Hinglish. Your teacher listens patiently and speaks back calmly.',
      icon: '🎙️',
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Get Help When Stuck',
      desc: 'Never feel embarrassed. Tap "I’m Stuck" anytime, and your teacher will explain more slowly or show you the exact button.',
      icon: '🤝',
      color: 'bg-amber-50 border-amber-200'
    },
    {
      title: 'Understand Screenshots',
      desc: 'Show us your phone screen. Our friendly AI vision looks at your screen and points an arrow right where you should tap.',
      icon: '📸',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Stay Safe Online',
      desc: 'Paste any suspicious message or link. We will check if it is a scam and protect your bank account and peace of mind.',
      icon: '🛡️',
      color: 'bg-rose-50 border-rose-200'
    },
    {
      title: 'Family Caregiver Support',
      desc: 'Let your children and grandchildren celebrate your learning achievements without invading your private conversations.',
      icon: '❤️',
      color: 'bg-indigo-50 border-indigo-200'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b-2 border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-900 font-extrabold text-sm sm:text-base">
                <Sparkles className="w-5 h-5 text-blue-700" />
                <span>Your Calm Personal Technology Teacher</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
                Technology <span className="text-blue-700">made simple.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                Learn WhatsApp, video calls, email, online services and more with your personal AI teacher.
              </p>

              {/* CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                  <SeniorButton variant="primary" size="xl" icon={BookOpen} className="w-full sm:w-auto shadow-lg">
                    Start Learning
                  </SeniorButton>
                </Link>

                <Link to={isAuthenticated ? "/teacher" : "/login"}>
                  <SeniorButton variant="outline" size="xl" icon={Mic} className="w-full sm:w-auto">
                    Talk to AI Teacher
                  </SeniorButton>
                </Link>
              </div>

              {/* 1-Click Instant Demo Button */}
              <div className="pt-2">
                <button
                  onClick={handleTryDemo}
                  className="text-base sm:text-lg font-bold text-blue-800 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-2xl border border-blue-200 transition-colors inline-flex items-center gap-2"
                >
                  <span>👵 Try 1-Click Demo as Grandma Asha</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-3 border-blue-200 rounded-[2.5rem] p-8 shadow-xl text-center relative overflow-hidden">
                <div className="text-8xl sm:text-9xl mb-4 transform hover:scale-105 transition-transform select-none">
                  👵📱
                </div>
                <div className="bg-white rounded-2xl p-5 border-2 border-blue-200 text-left shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm font-bold text-blue-900 uppercase">AI Teacher Active</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    "I want to learn how to send a photo on WhatsApp."
                  </p>
                  <p className="text-lg text-emerald-800 font-semibold pt-1 border-t border-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>"Bilkul! Let's take it one simple step at a time."</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Product Sections */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-base font-extrabold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full">
            Designed for Seniors
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900">
            How ElderEase Helps You
          </h2>
          <p className="text-xl sm:text-2xl text-slate-600 font-medium">
            Everything you need to feel independent, safe, and connected with family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureCards.map((card, idx) => (
            <div
              key={idx}
              className={`rounded-3xl border-2 p-8 shadow-sm hover:shadow-md transition-all ${card.color}`}
            >
              <div className="text-5xl mb-4" role="img" aria-label="Feature icon">
                {card.icon}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                {card.title}
              </h3>
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-medium">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Safety Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-blue-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <h3 className="text-3xl sm:text-4xl font-black">
              Ready to learn without frustration?
            </h3>
            <p className="text-xl text-blue-200 font-medium">
              Start learning at your own pace today. No complicated setups, no technical words.
            </p>
          </div>
          <Link to="/signup">
            <SeniorButton variant="warning" size="xl" className="shadow-lg min-w-[240px]">
              Start Free Today
            </SeniorButton>
          </Link>
        </div>
      </section>
    </div>
  );
};
