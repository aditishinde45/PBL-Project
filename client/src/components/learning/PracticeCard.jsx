import React, { useState } from 'react';
import { SeniorButton } from '../common/SeniorButton.jsx';
import { CheckCircle2, XCircle, Award, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PracticeCard = ({ lesson, onCompletePractice, onContinueToDashboard }) => {
  const questions = lesson?.practiceQuestions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h3 className="text-3xl font-extrabold text-slate-900">Lesson Completed!</h3>
        <p className="text-xl text-slate-600">You did wonderfully with {lesson?.title}.</p>
        <SeniorButton onClick={onContinueToDashboard} variant="primary" size="xl">
          Return to Dashboard
        </SeniorButton>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const hasAnsweredCurrent = selectedAnswers[currentIdx] !== undefined;

  const handleSelectOption = (optIdx) => {
    if (hasAnsweredCurrent) return;
    const newAnswers = { ...selectedAnswers, [currentIdx]: optIdx };
    setSelectedAnswers(newAnswers);

    // If last question answered
    if (currentIdx === questions.length - 1) {
      let correct = 0;
      questions.forEach((q, idx) => {
        if (newAnswers[idx] === q.correctIndex) correct++;
      });
      const finalScore = Math.round((correct / questions.length) * 100);
      setScoreData({ correct, total: questions.length, score: finalScore });
      setShowResults(true);

      // Trigger soft celebration confetti
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}

      if (onCompletePractice) {
        onCompletePractice(newAnswers);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-md max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 border-b pb-6 border-slate-100">
        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-900 font-extrabold rounded-full text-base inline-flex items-center gap-1.5">
          <Award className="w-5 h-5 text-emerald-700" />
          Practice Mode
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          Let’s See What You Remember
        </h2>
        <p className="text-lg sm:text-xl text-slate-600">
          A gentle check for {lesson.title}. No stress, take all the time you need!
        </p>
      </div>

      {!showResults ? (
        <div className="space-y-6">
          {/* Question Counter */}
          <div className="flex items-center justify-between text-base font-bold text-slate-500">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>Take your time</span>
          </div>

          {/* Question Text */}
          <div className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-950 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3.5">
            {currentQ.options.map((option, optIdx) => {
              const isChosen = selectedAnswers[currentIdx] === optIdx;
              const isCorrect = optIdx === currentQ.correctIndex;

              let buttonClass = 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800';
              if (hasAnsweredCurrent) {
                if (isCorrect) {
                  buttonClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300';
                } else if (isChosen) {
                  buttonClass = 'bg-rose-50 border-rose-400 text-rose-950';
                } else {
                  buttonClass = 'opacity-40 border-slate-200 text-slate-600';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={hasAnsweredCurrent}
                  className={`w-full p-5 text-left text-xl sm:text-2xl font-bold rounded-2xl border-2 transition-all flex items-center justify-between ${buttonClass} active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-300`}
                >
                  <span>{option}</span>
                  {hasAnsweredCurrent && isCorrect && (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0 ml-3" />
                  )}
                  {hasAnsweredCurrent && isChosen && !isCorrect && (
                    <XCircle className="w-8 h-8 text-rose-600 flex-shrink-0 ml-3" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation after answering */}
          {hasAnsweredCurrent && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-2">
              <p className="text-lg sm:text-xl leading-relaxed">
                <strong>Explanation:</strong> {currentQ.explanation}
              </p>
              {currentIdx < questions.length - 1 && (
                <div className="pt-2 flex justify-end">
                  <SeniorButton onClick={handleNextQuestion} variant="primary" size="md" icon={ArrowRight}>
                    Next Question
                  </SeniorButton>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Results summary */
        <div className="text-center space-y-6 py-4">
          <div className="text-7xl mb-2">🎉</div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Great Job!
          </h3>
          <p className="text-xl sm:text-2xl text-slate-700 max-w-lg mx-auto leading-relaxed">
            {scoreData?.score >= 50
              ? 'You remembered the important steps! You are becoming more confident with technology every single day.'
              : 'You did your very best! Remember, practicing slowly is how everyone learns.'}
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 max-w-md mx-auto">
            <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">
              Lesson Score
            </span>
            <p className="text-4xl font-black text-blue-900 mt-1">
              {scoreData?.correct} of {scoreData?.total} remembered
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <SeniorButton onClick={onContinueToDashboard} variant="primary" size="lg">
              Return to Dashboard
            </SeniorButton>
          </div>
        </div>
      )}
    </div>
  );
};
