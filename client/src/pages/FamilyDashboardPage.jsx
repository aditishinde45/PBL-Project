import React, { useState, useEffect } from 'react';
import { familyService } from '../services/familyService.js';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import {
  Users,
  Heart,
  ShieldAlert,
  Send,
  CheckCircle2,
  BookOpen,
  Flame,
  Award,
  Lock
} from 'lucide-react';

export const FamilyDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteMessage, setNoteMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('❤️');
  const [sending, setSending] = useState(false);
  const [noteSent, setNoteSent] = useState(false);

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        const res = await familyService.getOverview();
        if (res?.success) {
          setData(res);
        }
      } catch (err) {
        console.warn('Family fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyData();
  }, [noteSent]);

  const handleSendNote = async (e) => {
    e?.preventDefault();
    if (!noteMessage.trim()) return;

    setSending(true);
    try {
      const res = await familyService.sendNote(noteMessage.trim(), selectedEmoji);
      if (res.success) {
        setNoteSent(true);
        setNoteMessage('');
        setTimeout(() => setNoteSent(false), 4000);
      }
    } catch (err) {
      console.warn('Note send error:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState message="Loading family caregiver portal..." />;

  // If senior turned off sharing in privacy settings
  if (data?.sharingEnabled === false) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-4xl mx-auto">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">
          Family Sharing is Turned Off
        </h2>
        <p className="text-xl text-slate-600 leading-relaxed max-w-lg mx-auto">
          {data?.message || 'The senior learner has disabled family sharing in their privacy settings. ElderEase strictly honors their privacy choice.'}
        </p>
      </div>
    );
  }

  const senior = data?.senior || { name: 'Asha Sharma', avatar: '👵', learningStreak: 4 };
  const stats = data?.stats || { completedLessonsCount: 3, inProgressCount: 2, streakDays: 4 };
  const completed = data?.completedLessons || [];
  const inProgress = data?.inProgressLessons || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-slate-200 pb-5">
        <span className="text-5xl block mb-1">🧑‍💼</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Family & Caregiver Portal
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 font-medium max-w-xl mx-auto">
          Stay connected and celebrate {senior.name}’s technology learning milestones.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-5 flex items-start gap-3">
        <Users className="w-6 h-6 text-purple-700 flex-shrink-0 mt-1" />
        <p className="text-base sm:text-lg text-purple-950 font-semibold leading-relaxed">
          <strong>Privacy Guaranteed:</strong> You are viewing progress explicitly shared by {senior.name}. Private AI tutoring conversations and personal queries are never exposed.
        </p>
      </div>

      {/* Senior Learner Milestone Overview */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-24 h-24 rounded-3xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-5xl shadow-inner select-none">
            {senior.avatar || '👵'}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">{senior.name}</h2>
            <p className="text-lg text-slate-600 font-medium">Active Technology Learner</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-xl text-sm flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-600 text-amber-600" />
                {stats.streakDays} Day Learning Streak
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center min-w-[120px]">
            <span className="text-3xl font-black text-blue-700 block">{stats.completedLessonsCount}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-600">Completed</span>
          </div>
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center min-w-[120px]">
            <span className="text-3xl font-black text-emerald-700 block">{stats.inProgressCount}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-600">In Progress</span>
          </div>
        </div>
      </div>

      {/* Send Encouragement Note Box */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-rose-600">
          <Heart className="w-6 h-6 fill-rose-600" />
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            Send an Encouraging Note to {senior.name.split(' ')[0]}
          </h3>
        </div>

        {noteSent && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-bold text-lg flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>Your cheer note has been delivered to {senior.name.split(' ')[0]}’s screen!</span>
          </div>
        )}

        <form onSubmit={handleSendNote} className="space-y-4">
          <textarea
            rows={3}
            value={noteMessage}
            onChange={(e) => setNoteMessage(e.target.value)}
            placeholder={`e.g., "So proud of you for learning WhatsApp, Mom! You did wonderful! ❤️"`}
            className="w-full p-5 text-xl border-2 border-slate-300 rounded-2xl focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-100 text-slate-900"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-600">Pick an icon:</span>
              {['❤️', '🌟', '👏', '💐', '☕', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-transform ${
                    selectedEmoji === emoji ? 'border-purple-600 bg-purple-50 scale-110' : 'border-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <SeniorButton
              type="submit"
              disabled={!noteMessage.trim() || sending}
              variant="primary"
              size="lg"
              icon={Send}
            >
              {sending ? 'Sending...' : 'Send Encouragement'}
            </SeniorButton>
          </div>
        </form>
      </div>

      {/* Lessons Progress Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Completed */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>Completed Lessons</span>
          </h3>

          <div className="space-y-3">
            {completed.length > 0 ? (
              completed.map((l, i) => (
                <div key={i} className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase">{l.category}</span>
                  <p className="text-lg font-bold text-slate-900">{l.title}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No completed lessons yet.</p>
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Currently Practicing</span>
          </h3>

          <div className="space-y-3">
            {inProgress.length > 0 ? (
              inProgress.map((l, i) => (
                <div key={i} className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-blue-800 uppercase">{l.category}</span>
                    <span className="text-sm font-black text-blue-900">{l.percentage}%</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{l.title}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No lessons in progress right now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
