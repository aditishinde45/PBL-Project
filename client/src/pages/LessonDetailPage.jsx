import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lessonService } from '../services/lessonService.js';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Play,
  Award,
  Sparkles
} from 'lucide-react';

export const LessonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await lessonService.getLessonById(id);
        if (res.success && res.lesson) {
          setLesson(res.lesson);
        } else {
          setError('Lesson details could not be found.');
        }
      } catch (err) {
        setError(err.message || 'Could not load lesson.');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  if (loading) return <LoadingState message="Opening lesson details..." />;

  if (error || !lesson) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <h2 className="text-3xl font-black text-slate-900">Lesson Not Found</h2>
        <p className="text-xl text-slate-600">{error || 'Please choose another lesson.'}</p>
        <Link to="/library">
          <SeniorButton variant="primary" size="lg" icon={ArrowLeft}>
            Back to Library
          </SeniorButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link to="/library" className="inline-flex items-center gap-2 text-lg font-bold text-slate-600 hover:text-blue-700">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Library</span>
        </Link>
      </div>

      {/* Lesson Hero Banner */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-base">
            {lesson.category}
          </span>
          <div className="flex items-center gap-4 text-base sm:text-lg font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>{lesson.estimatedTime || '5 mins'}</span>
            </span>
            <span className="px-3 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 text-sm font-black">
              {lesson.difficulty || 'Beginner'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <span className="text-5xl sm:text-6xl" role="img" aria-label="Icon">
            {lesson.icon || '📱'}
          </span>
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              {lesson.title}
            </h1>
          </div>
        </div>

        <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
          {lesson.description}
        </p>

        {/* Start Action */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <SeniorButton
            onClick={() => navigate(`/learn/${lesson._id || lesson.slug}`)}
            variant="primary"
            size="xl"
            icon={Play}
            className="shadow-lg min-w-[260px]"
          >
            Start Lesson Now
          </SeniorButton>

          {lesson.practiceQuestions?.length > 0 && (
            <SeniorButton
              onClick={() => navigate(`/learn/${lesson._id || lesson.slug}?practice=true`)}
              variant="outline"
              size="xl"
              icon={Award}
            >
              Practice What You Remember
            </SeniorButton>
          )}
        </div>
      </div>

      {/* What You Will Learn (Steps Overview) */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          What You Will Learn (Step by Step):
        </h2>

        <div className="space-y-4">
          {lesson.steps?.map((step) => (
            <div
              key={step.stepNumber}
              className="flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/70 hover:bg-blue-50/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-extrabold text-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                {step.stepNumber}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-lg text-slate-600 mt-1 leading-relaxed">
                  {step.instruction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
