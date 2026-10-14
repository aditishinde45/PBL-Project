import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { lessonService } from '../services/lessonService.js';
import { useSpeech } from '../context/SpeechContext.jsx';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { StepIndicator } from '../components/learning/StepIndicator.jsx';
import { TutorInstruction } from '../components/learning/TutorInstruction.jsx';
import { TutorControls } from '../components/learning/TutorControls.jsx';
import { StuckHelpModal } from '../components/learning/StuckHelpModal.jsx';
import { PracticeCard } from '../components/learning/PracticeCard.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import { ArrowLeft, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LearningSessionPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { speak, stopSpeaking, voiceState } = useSpeech();
  const { autoRead, language } = useAccessibility();

  const [lesson, setLesson] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [isStuckModalOpen, setIsStuckModalOpen] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(searchParams.get('practice') === 'true');
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load lesson & session
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      try {
        const res = await lessonService.startLearningSession(id);
        if (res.success && res.lesson) {
          setLesson(res.lesson);

          // Restore step from progress if already in progress
          if (res.progress?.currentStep && !searchParams.get('practice')) {
            const stepNum = res.progress.currentStep;
            const targetIdx = Math.max(0, Math.min(stepNum - 1, (res.lesson.steps?.length || 1) - 1));
            setCurrentStepIndex(targetIdx);
          }
        }
      } catch (err) {
        console.warn('Session init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [id, searchParams]);

  // Read step out loud automatically if autoRead is enabled
  useEffect(() => {
    if (lesson && lesson.steps && lesson.steps[currentStepIndex] && autoRead && !isPracticeMode && !isLessonFinished) {
      const step = lesson.steps[currentStepIndex];
      const translation = step.translations?.[language];
      const textToSpeak = isSlowMode
        ? (translation?.slowExplanation || step.slowExplanation || translation?.instruction || step.instruction)
        : (translation?.instruction || step.instruction);

      speak(`Step ${step.stepNumber}: ${textToSpeak}`);
    }
  }, [currentStepIndex, isSlowMode, lesson, isPracticeMode, isLessonFinished]);

  if (loading) return <LoadingState message="Setting up your personal learning session..." subtitle="One step at a time" />;
  if (!lesson) return null;

  const steps = lesson.steps || [];
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Handlers
  const handleDone = async () => {
    stopSpeaking();
    setIsSlowMode(false);

    try {
      await lessonService.updateStepProgress(lesson._id || id, currentStep.stepNumber, 'done');
    } catch (e) {}

    if (isLastStep) {
      // Completed all steps!
      setIsLessonFinished(true);
      try {
        await lessonService.completeLesson(lesson._id || id);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleListen = () => {
    if (!currentStep) return;
    const translation = currentStep.translations?.[language];
    const instructionText = isSlowMode
      ? (translation?.slowExplanation || currentStep.slowExplanation || translation?.instruction || currentStep.instruction)
      : (translation?.instruction || currentStep.instruction);
    const explanationText = translation?.explanation || currentStep.explanation;

    speak(`${instructionText}. ${explanationText}`);
  };

  const handleExplainAgain = () => {
    setIsSlowMode(false);
    handleListen();
  };

  const handleExplainSlowly = () => {
    setIsSlowMode(true);
    const translation = currentStep?.translations?.[language];
    const slowText = translation?.slowExplanation || currentStep?.slowExplanation || currentStep?.explanation;
    speak(`Let's take it very slowly. ${slowText}`);
  };

  const handleGoBack = () => {
    stopSpeaking();
    setIsSlowMode(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleDescribeScreen = (desc) => {
    speak(`I understand you are seeing: ${desc}. Don't worry. Take your time, and let's try the step again.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/library')}
          className="inline-flex items-center gap-2 text-lg font-bold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Exit Lesson</span>
        </button>

        <span className="text-base font-extrabold text-blue-900 bg-blue-100 px-3.5 py-1 rounded-full">
          {lesson.category}
        </span>
      </div>

      {/* PRACTICE MODE VIEW */}
      {isPracticeMode || isLessonFinished ? (
        <PracticeCard
          lesson={lesson}
          onCompletePractice={async (answers) => {
            try {
              await lessonService.submitPractice(lesson._id || id, answers);
            } catch (e) {}
          }}
          onContinueToDashboard={() => navigate('/dashboard')}
        />
      ) : (
        /* STEP-BY-STEP LEARNING VIEW */
        <div className="space-y-8">
          {/* Step Progress Indicator */}
          <StepIndicator
            currentStep={currentStep?.stepNumber || 1}
            totalSteps={steps.length}
            category={lesson.category}
          />

          {/* Current Step Instruction & Visual */}
          <TutorInstruction
            step={currentStep}
            isSlowMode={isSlowMode}
          />

          {/* Senior Tutor Controls */}
          <TutorControls
            onDone={handleDone}
            onExplainAgain={handleExplainAgain}
            onExplainSlowly={handleExplainSlowly}
            onStuck={() => setIsStuckModalOpen(true)}
            onGoBack={handleGoBack}
            canGoBack={currentStepIndex > 0}
            isSpeaking={voiceState === 'speaking'}
            onListen={handleListen}
            onStopSpeaking={stopSpeaking}
            isLastStep={isLastStep}
          />

          {/* Stuck Help Modal */}
          <StuckHelpModal
            isOpen={isStuckModalOpen}
            onClose={() => setIsStuckModalOpen(false)}
            onExplainAgain={handleExplainAgain}
            onGoBack={handleGoBack}
            onOpenScreenshotHelp={() => navigate('/screenshot-help', { state: { currentStepContext: currentStep?.instruction } })}
            onDescribeScreen={handleDescribeScreen}
          />
        </div>
      )}
    </div>
  );
};
