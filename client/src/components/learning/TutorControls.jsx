import React from 'react';
import { SeniorButton } from '../common/SeniorButton.jsx';
import {
  Volume2,
  Square,
  CheckCircle,
  RotateCcw,
  Turtle,
  LifeBuoy,
  ArrowLeft
} from 'lucide-react';

export const TutorControls = ({
  onDone,
  onExplainAgain,
  onExplainSlowly,
  onStuck,
  onGoBack,
  canGoBack = false,
  isSpeaking = false,
  onListen,
  onStopSpeaking,
  isLastStep = false
}) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
      {/* Primary Done Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SeniorButton
          onClick={onDone}
          variant="success"
          size="xl"
          icon={CheckCircle}
          className="shadow-md"
          ariaLabel={isLastStep ? 'Complete Lesson' : 'I Have Done This Step'}
        >
          {isLastStep ? '✓ Finish Lesson' : '✓ Done (Next Step)'}
        </SeniorButton>

        <SeniorButton
          onClick={isSpeaking ? onStopSpeaking : onListen}
          variant={isSpeaking ? 'danger' : 'outline'}
          size="xl"
          icon={isSpeaking ? Square : Volume2}
          ariaLabel={isSpeaking ? 'Stop Speaking' : 'Listen to Instruction'}
        >
          {isSpeaking ? 'Stop Voice' : '🔊 Listen to Step'}
        </SeniorButton>
      </div>

      {/* Secondary Teacher Controls */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SeniorButton
          onClick={onExplainAgain}
          variant="secondary"
          size="md"
          icon={RotateCcw}
        >
          Explain Again
        </SeniorButton>

        <SeniorButton
          onClick={onExplainSlowly}
          variant="secondary"
          size="md"
          icon={Turtle}
        >
          Explain Slowly
        </SeniorButton>

        <SeniorButton
          onClick={onStuck}
          variant="warning"
          size="md"
          icon={LifeBuoy}
          className="font-black"
        >
          🆘 I'm Stuck
        </SeniorButton>
      </div>

      {/* Back Button */}
      {canGoBack && (
        <div className="pt-2 flex justify-start">
          <SeniorButton
            onClick={onGoBack}
            variant="ghost"
            size="md"
            icon={ArrowLeft}
          >
            Go Back One Step
          </SeniorButton>
        </div>
      )}
    </div>
  );
};
