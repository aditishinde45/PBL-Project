import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { SeniorButton } from '../common/SeniorButton.jsx';
import { MessageSquare, Camera, RotateCcw, ArrowLeft, Send, Sparkles } from 'lucide-react';

export const StuckHelpModal = ({
  isOpen,
  onClose,
  onExplainAgain,
  onGoBack,
  onOpenScreenshotHelp,
  onDescribeScreen
}) => {
  const [isTypingDescription, setIsTypingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');

  const handleSendDescription = (e) => {
    e?.preventDefault();
    if (descriptionText.trim() && onDescribeScreen) {
      onDescribeScreen(descriptionText.trim());
      setDescriptionText('');
      setIsTypingDescription(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Don’t worry. I’ll help you."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-4xl" role="img" aria-label="Support">🤝</span>
          <div>
            <h4 className="text-xl sm:text-2xl font-bold text-amber-950 mb-1">
              Take a breath — technology can be confusing sometimes!
            </h4>
            <p className="text-base sm:text-lg text-amber-900 leading-relaxed">
              You are doing wonderfully. Choose how you would like me to help you right now:
            </p>
          </div>
        </div>

        {/* 4 Clear Options */}
        <div className="grid grid-cols-1 gap-3.5">
          {/* Option 1: Tell me what you see */}
          {!isTypingDescription ? (
            <SeniorButton
              onClick={() => setIsTypingDescription(true)}
              variant="outline"
              size="lg"
              icon={MessageSquare}
              fullWidth
              className="justify-start text-left py-4"
            >
              1. Tell me what you see on your screen
            </SeniorButton>
          ) : (
            <form onSubmit={handleSendDescription} className="bg-slate-50 border-2 border-blue-200 rounded-2xl p-4 space-y-3">
              <label className="block text-base sm:text-lg font-bold text-slate-800">
                What does your phone screen say right now?
              </label>
              <textarea
                rows={2}
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="e.g., A popup appeared asking for permissions..."
                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsTypingDescription(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-base"
                >
                  Cancel
                </button>
                <SeniorButton type="submit" variant="primary" size="md" icon={Send}>
                  Get Help
                </SeniorButton>
              </div>
            </form>
          )}

          {/* Option 2: Upload Screenshot */}
          <SeniorButton
            onClick={() => {
              onClose();
              if (onOpenScreenshotHelp) onOpenScreenshotHelp();
            }}
            variant="primary"
            size="lg"
            icon={Camera}
            fullWidth
            className="justify-start text-left py-4"
          >
            2. Upload or show me a screenshot of your screen
          </SeniorButton>

          {/* Option 3: Explain Again */}
          <SeniorButton
            onClick={() => {
              onClose();
              if (onExplainAgain) onExplainAgain();
            }}
            variant="secondary"
            size="lg"
            icon={RotateCcw}
            fullWidth
            className="justify-start text-left py-4"
          >
            3. Explain this step again slowly
          </SeniorButton>

          {/* Option 4: Go Back */}
          <SeniorButton
            onClick={() => {
              onClose();
              if (onGoBack) onGoBack();
            }}
            variant="ghost"
            size="lg"
            icon={ArrowLeft}
            fullWidth
            className="justify-start text-left py-4 border-2 border-slate-200"
          >
            4. Go back to the previous step
          </SeniorButton>
        </div>
      </div>
    </Modal>
  );
};
