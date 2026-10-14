import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../services/progressService.js';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import {
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

export const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const [progRes, recRes] = await Promise.all([
          progressService.getProgress().catch(() => null),
          progressService.getRecommendations().catch(() => null)
        ]);

        if (progRes?.success) setData(progRes);
        if (recRes?.success && recRes.recommendations) setRecommendations(recRes.recommendations);
      } catch (err) {
        console.warn('Progress fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) return <LoadingState message="Calculating your learning achievements..." />;

  const stats = data?.stats || {
    totalCompletedLessons: 0,
    inProgressCount: 0,
    technologiesLearned: 0,
    learningStreak: 1,
    overallPercentage: 0
  };

  const categoryProgress = Array.isArray(data?.categoryProgress) ? data.categoryProgress : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-5xl block mb-1">🌟</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Your Learning Journey
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 font-medium">
          Look at how much you have learned with patience and care!
        </p>
      </div>

      {/* Top 4 Achievement Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl flex-shrink-0 border border-amber-200">
            🔥
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-500">
              Learning Streak
            </span>
            <p className="text-3xl font-black text-slate-900">
              {stats.learningStreak} Days
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl flex-shrink-0 border border-emerald-200">
            ✓
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-500">
              Completed Lessons
            </span>
            <p className="text-3xl font-black text-slate-900">
              {stats.totalCompletedLessons} Lessons
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl flex-shrink-0 border border-blue-200">
            📱
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-500">
              Tech Learned
            </span>
            <p className="text-3xl font-black text-slate-900">
              {stats.technologiesLearned} Apps
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl flex-shrink-0 border border-purple-200">
            🎯
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-500">
              Overall Progress
            </span>
            <p className="text-3xl font-black text-slate-900">
              {stats.overallPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Visual Progress Bars Per Technology */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Progress by Technology
        </h2>

        {categoryProgress.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
            <span className="text-4xl block">🌱</span>
            <p className="text-lg font-bold text-slate-700">
              Your technology achievements will appear here as you practice lessons.
            </p>
            <p className="text-base text-slate-500">
              Start your first lesson today — you can learn step-by-step with zero rush!
            </p>
            <div className="pt-2">
              <Link to="/library">
                <SeniorButton variant="primary" size="md" icon={BookOpen}>
                  Browse Lessons
                </SeniorButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {categoryProgress.map((item, idx) => (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center justify-between text-lg sm:text-xl font-bold">
                  <span className="text-slate-900">{item.category}</span>
                  <span className="text-blue-700 font-black">{item.averagePercentage}% Complete</span>
                </div>
                <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.averagePercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm sm:text-base text-slate-500 font-semibold">
                  <span>{item.completedLessons} of {item.totalLessons} lessons finished</span>
                  {item.averagePercentage === 100 && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Mastered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {data?.recentActivity?.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Recent Learning Activity
          </h2>

          <div className="space-y-3">
            {data.recentActivity.map((act, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {act.percentage === 100 ? '🎉' : '📖'}
                  </span>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900">
                      {act.lessonTitle}
                    </h4>
                    <span className="text-sm font-semibold text-slate-500">
                      {act.category} • {act.percentage}% complete
                    </span>
                  </div>
                </div>
                <Link to={`/learn/${act.lessonId}`}>
                  <SeniorButton variant="ghost" size="md">
                    Review
                  </SeniorButton>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next Lessons */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Recommended Next Lesson
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec._id}
                className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 flex flex-col justify-between hover:border-blue-500 transition-colors shadow-sm"
              >
                <div className="space-y-3 mb-6">
                  <span className="text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-xl">
                    {rec.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                    {rec.title}
                  </h3>
                  <p className="text-base sm:text-lg text-slate-600">
                    {rec.description}
                  </p>
                </div>
                <Link to={`/lessons/${rec._id || rec.slug}`}>
                  <SeniorButton variant="primary" size="lg" icon={BookOpen} fullWidth>
                    Learn This Next
                  </SeniorButton>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
