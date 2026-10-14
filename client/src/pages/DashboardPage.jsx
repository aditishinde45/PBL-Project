import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AIVoiceCard } from '../components/voice/AIVoiceCard.jsx';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { progressService } from '../services/progressService.js';
import { lessonService } from '../services/lessonService.js';
import { aiService } from '../services/aiService.js';
import {
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Camera,
  Play
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inProgressLessons, setInProgressLessons] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [streak, setStreak] = useState(() => user?.learningStreak || 1);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Time-aware warm greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name ? `${user.name.split(' ')[0]} ji` : 'Friend';
    if (hour < 12) return `Good morning, ${name}! ☀️`;
    if (hour < 17) return `Good afternoon, ${name}! 🌤️`;
    return `Good evening, ${name}! 🌙`;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [progRes, recRes, catRes] = await Promise.all([
          progressService.getProgress().catch(() => null),
          progressService.getRecommendations().catch(() => null),
          lessonService.getCategories().catch(() => null)
        ]);

        if (progRes?.success) {
          setInProgressLessons(Array.isArray(progRes.inProgressLessons) ? progRes.inProgressLessons : []);
          if (progRes.stats?.learningStreak) {
            setStreak(progRes.stats.learningStreak);
          }
        } else {
          setInProgressLessons([]);
        }

        if (recRes?.success && recRes.recommendations?.length > 0) {
          setRecommendations(recRes.recommendations);
        } else {
          // Fallback recommendations
          setRecommendations([
            {
              _id: '660000000000000000000002',
              title: 'Making a WhatsApp Video Call',
              category: 'WhatsApp',
              icon: '📹',
              difficulty: 'Absolute Beginner',
              estimatedTime: '3 mins',
              description: 'See your grandchildren face-to-face anytime.'
            },
            {
              _id: '660000000000000000000009',
              title: 'Understanding QR Code Payments Safely',
              category: 'Digital Payments',
              icon: '💳',
              difficulty: 'Easy',
              estimatedTime: '5 mins',
              description: 'Never enter your PIN to receive money.'
            }
          ]);
        }

        if (catRes?.success && catRes.categories) {
          setCategories(catRes.categories.filter(c => c.id !== 'All'));
        }
      } catch (err) {
        console.warn('Dashboard fetch notice:', err);
      }
    };

    loadDashboardData();
  }, []);

  // When senior speaks or submits from the large AI voice card
  const handleVoiceSubmit = async (query) => {
    setIsAiProcessing(true);
    try {
      // If query is "teach me...", dynamically generate lesson and start
      if (/teach me|how to|sikhao|sikhna|karein|kese/i.test(query)) {
        const res = await aiService.createDynamicLesson(query);
        if (res.success && res.lesson) {
          navigate(`/learn/${res.lesson._id}`);
          return;
        }
      }
      // Otherwise navigate to AI teacher conversational page with prefilled query
      navigate('/teacher', { state: { initialQuery: query } });
    } catch (err) {
      navigate('/teacher', { state: { initialQuery: query } });
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 mt-2 font-medium">
            What would you like to learn today?
          </p>
        </div>

        {/* Learning Streak Badge */}
        <div className="inline-flex items-center gap-3 bg-amber-50 border-2 border-amber-300 px-5 py-3 rounded-2xl shadow-xs self-start sm:self-auto">
          <Flame className="w-8 h-8 text-amber-600 fill-amber-500 animate-pulse" />
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-800 block">
              Learning Streak
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-950">
              {streak} Days in a row!
            </span>
          </div>
        </div>
      </div>

      {/* CORE 1: Large AI Teacher Card */}
      <section aria-labelledby="ai-teacher-heading">
        <AIVoiceCard
          onUserSubmit={handleVoiceSubmit}
          isProcessing={isAiProcessing}
          placeholder="Tell me what you would like to learn."
        />
      </section>

      {/* CORE 2: Continue Learning Section */}
      {inProgressLessons.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Continue Learning
            </h2>
            <Link to="/library" className="text-lg font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1">
              <span>View all lessons</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressLessons.map((item, idx) => {
              const lesson = item.lesson;
              if (!lesson) return null;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-500 p-6 sm:p-8 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">
                        {lesson.category}
                      </span>
                      <span className="text-base sm:text-lg font-black text-blue-900">
                        {item.percentage}% Done
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                      {lesson.title}
                    </h3>

                    {/* Progress bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>

                  <Link to={`/learn/${lesson._id || lesson.slug}`}>
                    <SeniorButton variant="primary" size="lg" icon={Play} fullWidth>
                      Continue Lesson (Step {item.currentStep || 1})
                    </SeniorButton>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CORE 3: "What can I help you with?" Categories */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          What can I help you with?
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {(categories.length > 0 ? categories : [
            { id: 'Smartphone', name: 'Smartphone', icon: '📱', count: 2 },
            { id: 'WhatsApp', name: 'WhatsApp', icon: '💬', count: 3 },
            { id: 'Email', name: 'Email', icon: '✉️', count: 2 },
            { id: 'Google Meet', name: 'Video Calls', icon: '📹', count: 1 },
            { id: 'Digital Payments', name: 'Digital Payments', icon: '💳', count: 1 },
            { id: 'Internet', name: 'Internet', icon: '🌐', count: 1 },
            { id: 'Computer Basics', name: 'Computer', icon: '💻', count: 1 },
            { id: 'Online Safety', name: 'Safety', icon: '🛡️', count: 1 }
          ]).map((cat) => (
            <Link
              key={cat.id}
              to={`/library?category=${encodeURIComponent(cat.id)}`}
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-600 hover:shadow-md p-6 sm:p-7 text-center transition-all group flex flex-col items-center justify-center gap-3"
            >
              <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform select-none" role="img" aria-label={cat.name}>
                {cat.icon}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {cat.name}
              </h3>
              <span className="text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {cat.count ? `${cat.count} lessons` : 'Explore'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CORE 4: Recommended For You */}
      {recommendations.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Recommended for You
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec._id}
                className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl border-2 border-slate-200 hover:border-blue-500 p-6 sm:p-8 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-xl">
                      {rec.category}
                    </span>
                    <span className="text-sm font-bold text-slate-500">
                      ⏱️ {rec.estimatedTime || '4 mins'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                    {rec.title}
                  </h3>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <Link to={`/lessons/${rec._id || rec.slug}`}>
                  <SeniorButton variant="outline" size="lg" icon={BookOpen} fullWidth>
                    View Lesson Details
                  </SeniorButton>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Emergency Help Shortcut */}
      <section className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <span className="text-5xl">🆘</span>
          <div>
            <h3 className="text-2xl font-black text-amber-950">
              Are you stuck on something right now?
            </h3>
            <p className="text-lg text-amber-900 font-medium">
              Upload a screenshot of your screen, and the AI Teacher will guide your finger.
            </p>
          </div>
        </div>
        <Link to="/screenshot-help">
          <SeniorButton variant="warning" size="lg" icon={Camera} className="whitespace-nowrap shadow-sm">
            Get Screenshot Help
          </SeniorButton>
        </Link>
      </section>
    </div>
  );
};
