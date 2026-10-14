import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { familyService } from '../services/familyService.js';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { User, Settings, Heart, Flame, BookOpen, Award, CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '👵');
  const [notes, setNotes] = useState([]);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    familyService.getSeniorNotes().then(res => {
      if (res?.success && res.notes) setNotes(res.notes);
    }).catch(() => {});
  }, []);

  const avatars = ['👵', '👴', '🧓', '👨‍🦳', '👩‍🦳', '🌸', '🌺', '🌻', '☕'];

  const handleAvatarChange = async (av) => {
    setSelectedAvatar(av);
    await updateProfile({ avatar: av });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-fadeIn">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-blue-100 border-3 border-blue-300 flex items-center justify-center text-6xl shadow-inner select-none">
          {selectedAvatar}
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {user?.name || 'Asha Sharma'}
            </h1>
            <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-900 font-extrabold text-sm">
              {user?.role === 'family' ? 'Family Caregiver' : 'Senior Learner'}
            </span>
          </div>

          <p className="text-lg text-slate-600 font-medium">
            {user?.email || 'asha@elderease.com'}
          </p>

          <p className="text-base sm:text-lg text-slate-700 font-semibold pt-1">
            Preferred Language: <span className="text-blue-700 font-black">{user?.preferredLanguage || 'English'}</span>
          </p>
        </div>

        <div>
          <Link to="/settings">
            <SeniorButton variant="outline" size="md" icon={Settings}>
              Settings
            </SeniorButton>
          </Link>
        </div>
      </div>

      {/* Avatar Picker */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-2xl font-black text-slate-900">
          Choose Your Profile Picture (Avatar)
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {avatars.map((av) => (
            <button
              key={av}
              type="button"
              onClick={() => handleAvatarChange(av)}
              className={`w-16 h-16 rounded-2xl text-3xl flex items-center justify-center border-2 transition-all select-none ${
                selectedAvatar === av
                  ? 'bg-blue-100 border-blue-600 scale-110 shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {av}
            </button>
          ))}
        </div>
        {savedNotice && (
          <p className="text-emerald-700 font-bold text-base flex items-center gap-1">
            <CheckCircle2 className="w-5 h-5" /> Profile picture updated!
          </p>
        )}
      </div>

      {/* Encouragement Notes from Family */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h2 className="text-2xl font-black text-slate-900">
            Cheer Notes from Your Family
          </h2>
        </div>

        {notes.length === 0 ? (
          <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6 text-center text-slate-600 text-lg">
            No family notes yet. When your loved ones send you messages from their Family Portal, they will appear right here! ❤️
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-5 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between text-rose-900 font-bold">
                  <span className="text-lg">From {note.senderName} ({note.senderRelation})</span>
                  <span className="text-2xl">{note.emoji || '❤️'}</span>
                </div>
                <p className="text-xl text-slate-900 font-medium leading-relaxed">
                  "{note.message}"
                </p>
                <span className="text-xs text-slate-500 font-semibold block">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
