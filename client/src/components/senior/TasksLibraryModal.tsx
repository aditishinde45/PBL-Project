import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePreferences } from '../../context/PreferencesContext';
import { BookOpen, X, ArrowRight } from 'lucide-react';

interface TasksLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
}

export const TasksLibraryModal: React.FC<TasksLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const { t, language } = usePreferences();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Digital Help Tasks">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <BookOpen size={32} /> {t('digitalTasks')}
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {language === 'mr'
            ? 'तुम्हाला जे शिकायचे आहे त्या विषयावर दाबा. आम्ही तुम्हाला एका वेळी एकच पायरी समजावून सांगू.'
            : 'Select any digital task to learn step-by-step with patient guidance:'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                border: '3px solid var(--border-light)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.8rem',
                    backgroundColor: 'var(--brand-surface)',
                    color: 'var(--brand-text)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-sm)',
                    fontWeight: 800,
                    marginBottom: '0.5rem',
                  }}
                >
                  {task.category}
                </span>
                <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {task.title}
                </h3>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  {task.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 800, fontSize: 'var(--font-md)' }}>
                <span>सुरू करा ({task.steps?.length || 0} पायऱ्या)</span>
                <ArrowRight size={22} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
