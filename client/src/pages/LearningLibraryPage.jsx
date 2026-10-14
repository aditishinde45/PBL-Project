import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { lessonService } from '../services/lessonService.js';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Search, BookOpen, Clock, Sparkles, Filter } from 'lucide-react';

export const LearningLibraryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [catsRes, lessonsRes] = await Promise.all([
          lessonService.getCategories(),
          lessonService.getLessons(activeCategory === 'All' ? '' : activeCategory, searchTerm)
        ]);

        if (catsRes?.success) setCategories(catsRes.categories);
        if (lessonsRes?.success) setLessons(lessonsRes.lessons);
      } catch (err) {
        console.warn('Library load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [activeCategory, searchTerm]);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    if (catId === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-4xl sm:text-5xl block mb-1">📚</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Learning Library
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 font-medium">
          Choose any topic you would like to explore at your own pace.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="w-7 h-7 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for lessons (e.g. photos, video call, email)..."
          className="w-full pl-16 pr-6 py-4 sm:py-5 text-xl sm:text-2xl border-2 border-slate-300 rounded-3xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.id)}
            className={`px-5 py-3 rounded-2xl font-bold text-lg sm:text-xl whitespace-nowrap transition-all border-2 flex items-center gap-2 ${
              activeCategory === cat.id
                ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Lessons List Grid */}
      {loading ? (
        <LoadingState message="Loading your library lessons..." subtitle="Just a moment" />
      ) : lessons.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No lessons found"
          description={`We couldn’t find any lessons matching "${searchTerm}". You can ask the AI Teacher to teach you this!`}
          actionLabel="Ask AI Teacher Instead"
          onAction={() => window.location.href = '/teacher'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-md p-6 sm:p-8 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">
                    {lesson.category}
                  </span>
                  <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.estimatedTime || '5 mins'}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-4xl select-none" role="img" aria-label="Icon">
                    {lesson.icon || '📱'}
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                      {lesson.title}
                    </h3>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  {lesson.description}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs sm:text-sm font-extrabold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                    {lesson.steps?.length || 4} Simple Steps
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg">
                    {lesson.difficulty || 'Beginner'}
                  </span>
                </div>
              </div>

              <Link to={`/lessons/${lesson._id || lesson.slug}`}>
                <SeniorButton variant="primary" size="lg" icon={BookOpen} fullWidth>
                  Start Lesson
                </SeniorButton>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Request Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-black">
            Can’t find what you are looking for?
          </h3>
          <p className="text-lg text-blue-200">
            Tell your AI Teacher anything you want to learn, and we’ll create a custom lesson just for you!
          </p>
        </div>
        <Link to="/teacher">
          <SeniorButton variant="warning" size="lg" icon={Sparkles} className="whitespace-nowrap shadow-md">
            Teach Me Anything
          </SeniorButton>
        </Link>
      </div>
    </div>
  );
};
