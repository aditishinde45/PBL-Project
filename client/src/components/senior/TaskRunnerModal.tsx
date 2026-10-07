import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePreferences } from '../../context/PreferencesContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import confetti from 'canvas-confetti';
import { Volume2, ArrowRight, ArrowLeft, CheckCircle, ThumbsUp, ThumbsDown, X } from 'lucide-react';

interface TaskRunnerModalProps {
  isOpen: boolean;
  taskId: string | null;
  initialStepIndex?: number;
  existingSessionId?: string | null;
  onClose: () => void;
  onTaskCompleted?: () => void;
}

export const TaskRunnerModal: React.FC<TaskRunnerModalProps> = ({
  isOpen,
  taskId,
  initialStepIndex = 0,
  existingSessionId = null,
  onClose,
  onTaskCompleted,
}) => {
  const { language, t } = usePreferences();
  const { speak } = useSpeechSynthesis();

  const [task, setTask] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(initialStepIndex);
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId);
  const [completed, setCompleted] = useState<boolean>(false);
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskAndSession();
    } else {
      setTask(null);
      setCompleted(false);
      setFeedbackSent(false);
    }
  }, [isOpen, taskId]);

  const loadTaskAndSession = async () => {
    setLoading(true);
    try {
      const taskData = await api.getTaskById(taskId!);
      setTask(taskData);

      let sid = existingSessionId;
      if (!sid) {
        const sessionRes = await api.startTask(taskId!);
        sid = sessionRes.id;
        setCurrentStep(sessionRes.currentStepIndex || initialStepIndex);
      } else {
        setCurrentStep(initialStepIndex);
      }
      setSessionId(sid);

      // Read initial step aloud
      const firstStep = taskData.steps[initialStepIndex] || taskData.steps[0];
      if (firstStep) {
        const instruction =
          language === 'mr'
            ? firstStep.instructionMr
            : language === 'hi'
            ? firstStep.instructionHi
            : firstStep.instructionEn;
        speak(instruction);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const steps = task.steps || [];
  const activeStep = steps[currentStep] || {};

  const getStepInstruction = (stepObj: any) => {
    if (!stepObj) return '';
    if (language === 'mr') return stepObj.instructionMr || stepObj.instructionEn;
    if (language === 'hi') return stepObj.instructionHi || stepObj.instructionEn;
    return stepObj.instructionEn;
  };

  const handleNextStep = async () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);

      if (sessionId) {
        await api.updateTaskSession(sessionId, nextIndex, 'IN_PROGRESS');
      }

      const nextInst = getStepInstruction(steps[nextIndex]);
      speak(nextInst);
    } else {
      // Completed all steps!
      setCompleted(true);
      if (sessionId) {
        await api.updateTaskSession(sessionId, currentStep, 'COMPLETED');
      }
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}

      const praise =
        language === 'mr'
          ? 'अभिनंदन! तुम्ही हे काम यशस्वीरित्या पूर्ण केले आहे. खूप छान!'
          : 'Congratulations! You completed this task with great confidence!';
      speak(praise);

      if (onTaskCompleted) onTaskCompleted();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      const prevInst = getStepInstruction(steps[prevIndex]);
      speak(prevInst);
    }
  };

  const handleFeedback = async (rating: 'GOOD' | 'POOR') => {
    if (!sessionId) return;
    try {
      await api.submitFeedback(sessionId, rating);
      setFeedbackSent(true);
      speak(language === 'mr' ? 'तुमच्या अभिप्रायाबद्दल मनापासून धन्यवाद!' : 'Thank you for your feedback!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Guided Task">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--brand-primary)', fontWeight: 800 }}>
              {task.category?.toUpperCase()}
            </span>
            <h2 style={{ fontSize: 'var(--font-lg)', color: 'var(--text-primary)', fontWeight: 800 }}>
              {task.title}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none' }}>
            <X size={28} />
          </button>
        </div>

        {!completed ? (
          <div>
            {/* Step Progress Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {steps.map((_: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: '10px',
                    borderRadius: '5px',
                    backgroundColor: idx <= currentStep ? 'var(--brand-primary)' : 'var(--border-light)',
                    transition: 'background-color 0.2s',
                  }}
                />
              ))}
            </div>

            {/* Current Step Card - One instruction at a time! */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                border: '3px solid var(--brand-primary)',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span
                  style={{
                    backgroundColor: 'var(--brand-surface)',
                    color: 'var(--brand-text)',
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                    fontSize: 'var(--font-md)',
                  }}
                >
                  पायरी {currentStep + 1} / {steps.length} (Step {currentStep + 1})
                </span>

                <button
                  onClick={() => speak(getStepInstruction(activeStep))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.2rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '2px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: 'var(--font-md)',
                  }}
                >
                  <Volume2 size={24} /> {t('listen')}
                </button>
              </div>

              <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                {activeStep.title}
              </h3>

              <p style={{ fontSize: 'var(--font-lg)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {getStepInstruction(activeStep)}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem 1.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-md)',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--border-strong)',
                  opacity: currentStep === 0 ? 0.4 : 1,
                }}
              >
                <ArrowLeft size={24} />
                <span>{t('goBack')}</span>
              </button>

              <button
                onClick={handleNextStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem 2.25rem',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontSize: 'var(--font-lg)',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <span>{currentStep === steps.length - 1 ? 'पूर्ण झाले! (Done)' : t('continue')}</span>
                <ArrowRight size={26} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle size={72} color="var(--status-green)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--status-green)', marginBottom: '0.5rem' }}>
              खूप छान! (Well Done!)
            </h3>
            <p style={{ fontSize: 'var(--font-lg)', color: 'var(--text-primary)', marginBottom: '2rem' }}>
              तुम्ही हा सराव यशस्वीरित्या पूर्ण केला आहे. आता तुम्ही अधिक आत्मविश्वासाने हे वापरू शकता.
            </p>

            {/* Feedback Section */}
            {!feedbackSent ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <h4 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: '1rem' }}>
                  ही मदत तुम्हाला कशी वाटली? (How was this help?)
                </h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                  <button
                    onClick={() => handleFeedback('GOOD')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem 2rem',
                      backgroundColor: 'var(--status-green-bg)',
                      color: 'var(--status-green-text)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-lg)',
                      fontWeight: 800,
                      border: '2px solid var(--status-green)',
                    }}
                  >
                    <ThumbsUp size={28} /> छान वाटले (Good)
                  </button>
                  <button
                    onClick={() => handleFeedback('POOR')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem 2rem',
                      backgroundColor: 'var(--status-red-bg)',
                      color: 'var(--status-red-text)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-lg)',
                      fontWeight: 800,
                      border: '2px solid var(--status-red)',
                    }}
                  >
                    <ThumbsDown size={28} /> सुधारणा हवी (Not Good)
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: 'var(--font-md)', marginBottom: '1.5rem' }}>
                ❤️ अभिप्रायासाठी धन्यवाद!
              </p>
            )}

            <button
              onClick={onClose}
              style={{
                padding: '1rem 2.5rem',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
              }}
            >
              {t('close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
