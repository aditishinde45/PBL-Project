import React, { useState, useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { api } from '../services/api';
import { ArrowLeft, Image, Video, PlaySquare, Sparkles, CheckCircle2 } from 'lucide-react';

interface TasksLibraryViewProps {
  onBack: () => void;
  onSelectTask: (taskId: string) => void;
}

export const TasksLibraryView: React.FC<TasksLibraryViewProps> = ({
  onBack,
  onSelectTask,
}) => {
  const { t, language } = usePreferences();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await api.getTasks();
        setTasks(data);
      } catch (err) {
        console.warn('Could not load tasks from API:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const getTaskIcon = (slug: string) => {
    if (slug === 'whatsapp-photo') return <Image size={48} color="#16a34a" strokeWidth={2.5} />;
    if (slug === 'video-call') return <Video size={48} color="#0284c7" strokeWidth={2.5} />;
    return <PlaySquare size={48} color="#dc2626" strokeWidth={2.5} />;
  };

  const getLocalizedTitle = (task: any) => {
    if (language === 'mr' && task.titleMr) return task.titleMr;
    if (language === 'hi' && task.titleHi) return task.titleHi;
    if (language === 'en' && task.titleEn) return task.titleEn;
    return task.title;
  };

  const getLocalizedDesc = (task: any) => {
    if (language === 'mr' && task.descMr) return task.descMr;
    if (language === 'hi' && task.descHi) return task.descHi;
    if (language === 'en' && task.descEn) return task.descEn;
    return task.description;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '3px solid var(--border-light)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border-strong)',
            backgroundColor: 'var(--bg-subtle)',
            fontSize: 'var(--font-md)',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={24} />
          {t('common.back')}
        </button>

        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
          {t('home.doSomething')}
        </h2>

        <div style={{ width: '80px' }} />
      </header>

      {/* Main Content */}
      <main
        className="app-container"
        style={{
          flex: 1,
          padding: '3rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3
            style={{
              fontSize: 'var(--font-xl)',
              fontWeight: 800,
              color: 'var(--brand-primary)',
              marginBottom: '0.5rem',
            }}
          >
            {t('guided.libraryTitle')}
          </h3>
          <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', margin: 0 }}>
            {t('guided.librarySubtitle')}
          </p>
        </div>

        {/* 3 Focused Tasks Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              style={{
                width: '100%',
                padding: '2rem',
                backgroundColor: 'var(--bg-surface)',
                border: '3px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getTaskIcon(task.slug)}
              </div>

              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: 'var(--font-xl)',
                    fontWeight: 800,
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {getLocalizedTitle(task)}
                </h4>
                <p
                  style={{
                    fontSize: 'var(--font-base)',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {getLocalizedDesc(task)}
                </p>
              </div>

              <div
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 'var(--font-base)',
                }}
              >
                {t('guided.next')}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};
