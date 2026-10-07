import React, { useState, useEffect, useRef } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { api } from '../services/api';
import { VoiceService } from '../services/voiceService';
import { VisualTarget, VisualTargetProps } from './common/VisualTarget';
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  HelpCircle,
  Users,
  CheckCircle,
  Home,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Square,
} from 'lucide-react';

interface TaskRunnerViewProps {
  taskId: string;
  onBack: () => void;
  onGoHome: () => void;
  onTalkToAi: () => void;
  onAskFamily: () => void;
}

export const TaskRunnerView: React.FC<TaskRunnerViewProps> = ({
  taskId,
  onBack,
  onGoHome,
  onTalkToAi,
  onAskFamily,
}) => {
  const { t, language, voiceSpeed, voiceEnabled, setVoiceEnabled } = usePreferences();

  const [task, setTask] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [confusionLevel, setConfusionLevel] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // In-Task Voice & Chat Companion
  const [inTaskQuery, setInTaskQuery] = useState('');
  const [inTaskAnswer, setInTaskAnswer] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Load task and start/restore session
  useEffect(() => {
    const initTask = async () => {
      try {
        const taskData = await api.getTaskById(taskId);
        setTask(taskData);

        try {
          const session = await api.startTask(taskData.id);
          if (session) {
            setSessionId(session.id);
            if (session.currentStepIndex && session.currentStepIndex < taskData.steps.length) {
              setCurrentStepIndex(session.currentStepIndex);
            }
          }
        } catch (e) {
          console.warn('Session start fallback (running locally):', e);
        }
      } catch (err) {
        console.warn('Could not load task data:', err);
      } finally {
        setLoading(false);
      }
    };
    initTask();

    return () => {
      VoiceService.stop();
    };
  }, [taskId]);

  // Read current instruction when step changes
  useEffect(() => {
    if (task && task.steps && task.steps[currentStepIndex] && !isCompleted) {
      setShowHelp(false);
      setConfusionLevel(1);
      setInTaskAnswer(null);

      const instruction = getStepInstruction(task.steps[currentStepIndex]);
      if (voiceEnabled) {
        VoiceService.speak(instruction, {
          language,
          voiceSpeed,
          voiceEnabled,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    }
  }, [currentStepIndex, task, language, isCompleted]);

  const handleSpeak = (text: string) => {
    if (!voiceEnabled) return;
    VoiceService.speak(text, {
      language,
      voiceSpeed,
      voiceEnabled,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    VoiceService.stop();
    setIsSpeaking(false);
  };

  const getStepInstruction = (step: any): string => {
    if (language === 'mr' && step.instructionMr) return step.instructionMr;
    if (language === 'hi' && step.instructionHi) return step.instructionHi;
    return step.instructionEn || step.title;
  };

  const getStepHelp = (step: any): string => {
    if (language === 'mr' && step.helpMr) return step.helpMr;
    if (language === 'hi' && step.helpHi) return step.helpHi;
    return step.helpEn || getStepInstruction(step);
  };

  // Build VisualTarget data based on current task slug and step number
  const getStepVisualTarget = (): VisualTargetProps | null => {
    if (!task) return null;
    const slug = task.slug;

    if (slug === 'whatsapp-photo') {
      if (currentStepIndex === 0) {
        return {
          type: 'app_icon',
          name: 'WhatsApp',
          icon: 'whatsapp',
          badgeColor: '#25D366',
          description:
            language === 'mr'
              ? 'हिरवा गोल आयकॉन, ज्याच्या आत पांढरा फोन चिन्ह आहे'
              : language === 'hi'
              ? 'हरा गोल आइकन, जिसके अंदर सफेद फोन बना है'
              : 'Green round icon with a white phone symbol inside',
        };
      }
      if (currentStepIndex === 1) {
        return {
          type: 'action_symbol',
          name: language === 'mr' ? 'व्यक्तीचे नाव' : language === 'hi' ? 'व्यक्ति का नाम' : 'Contact Name',
          icon: 'search',
          badgeColor: '#0284c7',
          description:
            language === 'mr'
              ? 'यादीमध्ये तुमच्या कुटुंबियांचे किंवा मित्राचे नाव निवडा'
              : language === 'hi'
              ? 'सूची में अपने परिवार के सदस्य या मित्र का नाम चुनें'
              : 'Select the name of your contact from the list',
        };
      }
      if (currentStepIndex === 2) {
        return {
          type: 'button',
          name: language === 'mr' ? 'कॅमेरा चिन्ह' : language === 'hi' ? 'कैमरा आइकन' : 'Camera Icon',
          icon: 'camera',
          badgeColor: '#0f766e',
          description:
            language === 'mr'
              ? 'मेसेज लिहिण्याच्या जागेजवळ लहान कॅमेऱ्याचे चिन्ह शोधा'
              : language === 'hi'
              ? 'मैसेज लिखने की पट्टी के पास छोटा कैमरा निशान देखिए'
              : 'Look for the small camera icon near the message box',
        };
      }
      if (currentStepIndex === 3) {
        return {
          type: 'button',
          name: language === 'mr' ? 'सेंड बटण' : language === 'hi' ? 'सेंड बटन' : 'Send Arrow',
          icon: 'send-arrow',
          badgeColor: '#16a34a',
          description:
            language === 'mr'
              ? 'पांढरा बाण असलेले गोल हिरवे सेंड बटण दाबा'
              : language === 'hi'
              ? 'सफेद तीर वाला गोल हरा सेंड बटन दबाएं'
              : 'Tap the round green button with the white send arrow',
        };
      }
    }

    if (slug === 'video-call') {
      if (currentStepIndex === 0) {
        return {
          type: 'app_icon',
          name: 'WhatsApp',
          icon: 'whatsapp',
          badgeColor: '#25D366',
          description:
            language === 'mr'
              ? 'हिरवा व्हॉट्सॲप आयकॉन उघडा आणि व्यक्ती निवडा'
              : language === 'hi'
              ? 'हरा व्हाट्सएप आइकन खोलें और व्यक्ति चुनें'
              : 'Open green WhatsApp icon and select the person',
        };
      }
      if (currentStepIndex === 1) {
        return {
          type: 'button',
          name: language === 'mr' ? 'व्हिडिओ कॉल' : language === 'hi' ? 'वीडियो कॉल' : 'Video Camera Icon',
          icon: 'video-camera',
          badgeColor: '#0284c7',
          description:
            language === 'mr'
              ? 'स्क्रीनच्या वरच्या उजव्या बाजूला लहान व्हिडिओ कॅमेरा चिन्ह'
              : language === 'hi'
              ? 'स्क्रीन के ऊपर दाईं तरफ छोटा वीडियो कैमरा निशान'
              : 'Small video camera icon at top right of the screen',
        };
      }
      if (currentStepIndex === 2) {
        return {
          type: 'action_symbol',
          name: language === 'mr' ? 'फोन सरळ धरा' : language === 'hi' ? 'फोन सामने रखें' : 'Hold Phone in Front',
          icon: 'video-camera',
          badgeColor: '#14b8a6',
          description:
            language === 'mr'
              ? 'फोन चेहऱ्यासमोर स्थिर पकडा आणि बोला'
              : language === 'hi'
              ? 'फोन अपने चेहरे के सामने सीधा रखें और बात करें'
              : 'Hold phone steadily facing you and smile',
        };
      }
    }

    if (slug === 'youtube-video') {
      if (currentStepIndex === 0) {
        return {
          type: 'app_icon',
          name: 'YouTube',
          icon: 'youtube',
          badgeColor: '#FF0000',
          description:
            language === 'mr'
              ? 'पांढरा प्ले त्रिकोण असलेला लाल चौकोनी आयकॉन'
              : language === 'hi'
              ? 'सफेद प्ले त्रिकोण वाला लाल चौकोर आइकन'
              : 'Red square icon with a white play triangle',
        };
      }
      if (currentStepIndex === 1) {
        return {
          type: 'button',
          name: language === 'mr' ? 'शोध चिन्ह' : language === 'hi' ? 'सर्च लेंस' : 'Search Magnifier',
          icon: 'search',
          badgeColor: '#6366f1',
          description:
            language === 'mr'
              ? 'वरच्या उजव्या कोपऱ्यातील लहान भिंग चिन्ह'
              : language === 'hi'
              ? 'ऊपर दाईं ओर गोल लेंस (सर्च) का निशान'
              : 'Round magnifying glass search icon at top right',
        };
      }
      if (currentStepIndex === 2) {
        return {
          type: 'button',
          name: language === 'mr' ? 'माइक चिन्ह' : language === 'hi' ? 'माइक आइकन' : 'Search Mic',
          icon: 'search',
          badgeColor: '#0f766e',
          description:
            language === 'mr'
              ? 'सर्च बारमध्ये लहान माइक दाबून नाव बोला'
              : language === 'hi'
              ? 'सर्च बार में छोटा माइक दबाकर भजन या गाने का नाम बोलें'
              : 'Tap microphone icon in YouTube to speak the name',
        };
      }
      if (currentStepIndex === 3) {
        return {
          type: 'action_symbol',
          name: language === 'mr' ? 'व्हिडिओ चित्र' : language === 'hi' ? 'वीडियो तस्वीर' : 'Video Thumbnail',
          icon: 'youtube',
          badgeColor: '#dc2626',
          description:
            language === 'mr'
              ? 'आवडलेल्या व्हिडिओच्या चित्रावर एकदा हळूच दाबा'
              : language === 'hi'
              ? 'मनपसंद वीडियो की तस्वीर पर एक बार हल्के से टैप करें'
              : 'Tap the video picture thumbnail to start playing',
        };
      }
    }

    return null;
  };

  const handleNext = async () => {
    stopSpeaking();
    if (!task || !task.steps) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < task.steps.length) {
      setCurrentStepIndex(nextIndex);
      if (sessionId) {
        api.updateTaskSession(sessionId, nextIndex, 'IN_PROGRESS').catch(() => {});
      }
    } else {
      setIsCompleted(true);
      if (sessionId) {
        api.updateTaskSession(sessionId, task.steps.length, 'COMPLETED').catch(() => {});
      }
      const completionText = t('guided.completedTitle') + '. ' + t('guided.completedSubtitle');
      handleSpeak(completionText);
    }
  };

  const handleBack = () => {
    stopSpeaking();
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (sessionId) {
        api.updateTaskSession(sessionId, prevIndex, 'IN_PROGRESS').catch(() => {});
      }
    } else {
      onBack();
    }
  };

  const handleHearAgain = () => {
    if (!task || !task.steps) return;
    const currentStep = task.steps[currentStepIndex];
    const textToSpeak = showHelp ? getStepHelp(currentStep) : getStepInstruction(currentStep);
    handleSpeak(textToSpeak);
  };

  // Need help with progressive explanation levels
  const handleNeedHelp = () => {
    setShowHelp(true);
    const nextLevel = Math.min(confusionLevel + 1, 4);
    setConfusionLevel(nextLevel);

    const currentStep = task.steps[currentStepIndex];
    const helpText = getStepHelp(currentStep);
    handleSpeak(helpText);
  };

  const handleFeedback = (rating: 'GOOD' | 'POOR') => {
    setFeedbackSubmitted(true);
    if (sessionId) {
      api.submitFeedback(sessionId, rating).catch(() => {});
    }
  };

  // In-Task Conversational Assistant (Ask ElderEase questions about this step)
  const askInTaskAssistant = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    stopSpeaking();
    setIsThinking(true);
    setInTaskQuery('');

    try {
      const res = await api.chatWithAi(trimmed, [], language, {
        currentTaskSlug: task.slug,
        currentStepIndex,
        voiceEnabled,
        userConfusionLevel: confusionLevel,
      });

      const replyMsg = res.message || res.reply;
      setInTaskAnswer(replyMsg);

      // Handle natural task commands returned by AI
      if (res.action === 'NEXT_STEP') {
        setTimeout(() => handleNext(), 1200);
      } else if (res.action === 'PREV_STEP') {
        setTimeout(() => handleBack(), 1200);
      } else if (res.action === 'STOP_TASK') {
        setTimeout(() => onGoHome(), 1200);
      } else if (res.action === 'CALL_FAMILY') {
        onAskFamily();
      }

      if (voiceEnabled && res.speak !== false) {
        handleSpeak(replyMsg);
      }
    } catch (e) {
      setInTaskAnswer(t('common.errorGeneral'));
    } finally {
      setIsThinking(false);
    }
  };

  const toggleInTaskMic = () => {
    if (isSpeaking) stopSpeaking();

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) askInTaskAssistant(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  if (loading || !task) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--font-xl)',
          color: 'var(--brand-primary)',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <Sparkles size={36} className="animate-spin" />
      </div>
    );
  }

  const steps = task.steps || [];
  const currentStep = steps[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);
  const visualTarget = getStepVisualTarget();

  // COMPLETION VIEW
  if (isCompleted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '650px',
            width: '100%',
            backgroundColor: 'var(--bg-surface)',
            border: '4px solid var(--status-green)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🎉</div>

          <h2
            style={{
              fontSize: 'var(--font-2xl)',
              fontWeight: 800,
              color: 'var(--status-green)',
              marginBottom: '1rem',
            }}
          >
            {t('guided.completedTitle')}
          </h2>

          <p
            style={{
              fontSize: 'var(--font-lg)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              marginBottom: '2.5rem',
            }}
          >
            {t('guided.completedSubtitle')}
          </p>

          {/* Feedback Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              marginBottom: '2.5rem',
              border: '2px solid var(--border-light)',
            }}
          >
            {!feedbackSubmitted ? (
              <>
                <p style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: '1.25rem' }}>
                  {t('guided.feedbackQuestion')}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleFeedback('GOOD')}
                    style={{
                      padding: '1rem 2rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--status-green-bg)',
                      color: 'var(--status-green-text)',
                      border: '3px solid var(--status-green)',
                      fontSize: 'var(--font-md)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <ThumbsUp size={24} />
                    {t('guided.feedbackYes')}
                  </button>
                  <button
                    onClick={() => handleFeedback('POOR')}
                    style={{
                      padding: '1rem 2rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-secondary)',
                      border: '3px solid var(--border-strong)',
                      fontSize: 'var(--font-md)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <ThumbsDown size={24} />
                    {t('guided.feedbackNo')}
                  </button>
                </div>
              </>
            ) : (
              <p
                style={{
                  fontSize: 'var(--font-md)',
                  fontWeight: 800,
                  color: 'var(--status-green)',
                  margin: 0,
                }}
              >
                {t('guided.feedbackThanks')}
              </p>
            )}
          </div>

          {/* Navigation Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={onGoHome}
              style={{
                width: '100%',
                padding: '1.5rem',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                border: '3px solid var(--brand-primary-hover)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <Home size={28} />
              {t('guided.goHome')}
            </button>

            <button
              onClick={onTalkToAi}
              style={{
                width: '100%',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                border: '3px solid var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--font-md)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <MessageCircle size={26} />
              {t('guided.talkMore')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE STEP: AI + VISUAL GUIDE + SIMPLE INSTRUCTION
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
          padding: '1.25rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '3px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: 'var(--font-base)',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={22} />
            {t('guided.back')}
          </button>

          <span
            style={{
              fontSize: 'var(--font-lg)',
              fontWeight: 800,
              color: 'var(--brand-primary)',
            }}
          >
            {t('guided.stepOf', { current: currentStepIndex + 1, total: steps.length })}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Global Voice Toggle */}
            <button
              onClick={() => {
                const nextVal = !voiceEnabled;
                setVoiceEnabled(nextVal);
                if (!nextVal) stopSpeaking();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${voiceEnabled ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
                backgroundColor: voiceEnabled ? 'var(--brand-surface)' : 'var(--bg-subtle)',
                color: voiceEnabled ? 'var(--brand-text)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: 'var(--font-sm)',
                cursor: 'pointer',
              }}
            >
              {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span>{voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}</span>
            </button>

            {/* Home Button */}
            <button
              onClick={onGoHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-strong)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: 'var(--font-base)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Home size={22} />
              {t('common.home')}
            </button>
          </div>
        </div>

        {/* Visible Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '12px',
            backgroundColor: 'var(--border-light)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: 'var(--brand-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </header>

      {/* Main Single Instruction Area */}
      <main
        className="app-container"
        style={{
          flex: 1,
          padding: '2.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '850px',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '4px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Step Tag */}
          <div>
            <span
              style={{
                backgroundColor: 'var(--brand-surface)',
                color: 'var(--brand-text)',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: 'var(--font-md)',
                display: 'inline-block',
              }}
            >
              {t('guided.stepOf', { current: currentStepIndex + 1, total: steps.length })}
            </span>
          </div>

          {/* LARGE SIMPLE INSTRUCTION */}
          <h2
            style={{
              fontSize: 'var(--font-2xl)',
              fontWeight: 800,
              lineHeight: 1.35,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {getStepInstruction(currentStep)}
          </h2>

          {/* VISUAL TARGET CARD */}
          {visualTarget && (
            <VisualTarget
              name={visualTarget.name}
              description={visualTarget.description}
              icon={visualTarget.icon}
              badgeColor={visualTarget.badgeColor}
              highlight={true}
            />
          )}

          {/* Simplified Help Box */}
          {showHelp && (
            <div
              style={{
                backgroundColor: 'var(--accent-amber-bg)',
                color: 'var(--text-primary)',
                border: '3px solid var(--accent-amber)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                <HelpCircle size={26} color="var(--accent-amber)" />
                <span style={{ fontSize: 'var(--font-lg)', color: 'var(--accent-amber)' }}>
                  {t('guided.simplifiedHelpTitle')}
                </span>
              </div>
              <p
                style={{
                  fontSize: 'var(--font-lg)',
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {getStepHelp(currentStep)}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button
                  onClick={() => handleSpeak(getStepHelp(currentStep))}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '2px solid var(--border-strong)',
                    fontSize: 'var(--font-base)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Volume2 size={22} />
                  {t('guided.hearAgain')}
                </button>
                <button
                  onClick={onAskFamily}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '2px solid var(--accent-amber)',
                    color: 'var(--accent-amber)',
                    fontSize: 'var(--font-base)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Users size={22} />
                  {t('guided.askFamily')}
                </button>
              </div>
            </div>
          )}

          {/* In-Step Conversational Answer (if senior asked question) */}
          {inTaskAnswer && (
            <div
              style={{
                backgroundColor: 'var(--brand-surface)',
                color: 'var(--brand-text)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--brand-primary)',
                fontWeight: 600,
                fontSize: 'var(--font-base)',
              }}
            >
              🤖 {inTaskAnswer}
            </div>
          )}

          {/* Action Row: Hear Again, Need Help, Stop Speaking */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleHearAgain}
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '3px solid var(--border-strong)',
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
              }}
            >
              <Volume2 size={26} />
              {t('guided.hearAgain')}
            </button>

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--status-red-bg)',
                  color: 'var(--status-red-text)',
                  border: '3px solid var(--status-red)',
                  fontSize: 'var(--font-base)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Square size={20} fill="currentColor" />
                <span>🔇 Stop</span>
              </button>
            )}

            <button
              onClick={handleNeedHelp}
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '3px solid var(--border-strong)',
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
              }}
            >
              <HelpCircle size={26} />
              {t('guided.needHelp')}
            </button>
          </div>

          {/* NEXT STEP BUTTON */}
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '1.75rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                border: '3px solid var(--brand-primary-hover)',
                fontSize: 'var(--font-xl)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span>{t('guided.next')}</span>
              <ArrowRight size={32} />
            </button>
          </div>

          {/* In-Step Natural Conversation Helper */}
          <div
            style={{
              marginTop: '1rem',
              paddingTop: '1.25rem',
              borderTop: '2px solid var(--border-light)',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                askInTaskAssistant(inTaskQuery);
              }}
              style={{ display: 'flex', gap: '0.75rem' }}
            >
              <button
                type="button"
                onClick={toggleInTaskMic}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isListening ? 'var(--status-red)' : 'var(--bg-subtle)',
                  color: isListening ? '#ffffff' : 'var(--text-primary)',
                  border: '2px solid var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                <span>{isListening ? '🔴' : '🎙️'}</span>
              </button>

              <input
                type="text"
                value={inTaskQuery}
                onChange={(e) => setInTaskQuery(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'काही विचारा: "कसा दिसतो?", "कुठे आहे?"...'
                    : language === 'hi'
                    ? 'कुछ पूछिए: "कैसा दिखता है?", "कहाँ है?"...'
                    : 'Ask about this step: "Where is it?", "Why?"...'
                }
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--border-strong)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-base)',
                }}
              />

              <button
                type="submit"
                disabled={!inTaskQuery.trim() || isThinking}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  border: 'none',
                  cursor: inTaskQuery.trim() ? 'pointer' : 'default',
                  opacity: inTaskQuery.trim() ? 1 : 0.6,
                }}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
