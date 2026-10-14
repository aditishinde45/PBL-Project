import React, { useState } from 'react';
import { useSpeech } from '../../context/SpeechContext.jsx';
import { VoiceVisualizer } from './VoiceVisualizer.jsx';
import { SeniorButton } from '../common/SeniorButton.jsx';
import { Mic, MicOff, Square, RotateCcw, Send, Volume2 } from 'lucide-react';

export const AIVoiceCard = ({ onUserSubmit, isProcessing = false, placeholder = "Tell me what you would like to learn..." }) => {
  const {
    voiceState,
    transcript,
    setTranscript,
    speechError,
    startListening,
    stopListening,
    stopSpeaking,
    replay,
    isSupported,
    isSpeechRecognitionSupported
  } = useSpeech();

  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // Status visual cues
  const getStatusText = () => {
    if (isProcessing) return 'Understanding your request...';
    switch (voiceState) {
      case 'listening':
        return 'I am listening to you... speak freely.';
      case 'processing':
        return 'Thinking about the best way to explain...';
      case 'speaking':
        return 'AI Teacher is speaking...';
      case 'error':
        return 'I didn’t hear anything. Please tap the button and speak again.';
      default:
        return 'Tap the button below and speak in your language.';
    }
  };

  const handleMicClick = () => {
    if (voiceState === 'listening') {
      stopListening();
      if (transcript && onUserSubmit) {
        onUserSubmit(transcript);
      }
    } else if (voiceState === 'speaking') {
      stopSpeaking();
    } else {
      startListening((finalTranscript) => {
        if (finalTranscript && onUserSubmit) {
          onUserSubmit(finalTranscript);
        }
      });
    }
  };

  const handleManualSend = (e) => {
    e?.preventDefault();
    const query = textInput.trim() || transcript.trim();
    if (query && onUserSubmit) {
      onUserSubmit(query);
      setTextInput('');
      setTranscript('');
      stopListening();
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md p-6 sm:p-8 md:p-10 text-center relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-50/70 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-900 font-bold text-sm sm:text-base mb-3">
          Voice or Text Assistant
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Ask Your AI Teacher
        </h2>
        <p className="text-xl sm:text-2xl text-slate-600 mt-2 font-medium">
          "{placeholder}"
        </p>
      </div>

      {/* Visual Audio Waveform */}
      <div className="min-h-[70px] flex items-center justify-center mb-4">
        {voiceState !== 'idle' || isProcessing ? (
          <VoiceVisualizer state={isProcessing ? 'processing' : voiceState} size="large" />
        ) : (
          <p className="text-lg text-slate-500 italic">Microphone ready</p>
        )}
      </div>

      {speechError && (
        <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 p-4 rounded-2xl mb-6 max-w-xl mx-auto text-left shadow-xs">
          <p className="font-extrabold text-base text-amber-900 flex items-center gap-2">
            <span>⚠️</span>
            <span>{speechError}</span>
          </p>
          <p className="text-xs sm:text-sm text-amber-800 mt-1">
            Tip: Click the lock or microphone symbol in your browser address bar to allow microphone access. You can also type below!
          </p>
        </div>
      )}

      {!isSpeechRecognitionSupported && (
        <div className="bg-blue-50 border-2 border-blue-200 text-blue-900 p-3 rounded-2xl mb-6 max-w-xl mx-auto text-sm font-semibold">
          ℹ️ Voice recognition is supported in Google Chrome, Microsoft Edge, and Safari.
        </div>
      )}

      {/* Current Transcript or Live Speech Bubble */}
      {(transcript || voiceState === 'listening') && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 max-w-xl mx-auto text-left shadow-inner">
          <p className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            Hearing your voice:
          </p>
          <p className="text-xl sm:text-2xl text-slate-900 font-medium">
            {transcript || 'Listening...'}
          </p>
          {transcript && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleManualSend}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-base"
              >
                <span>Ask this</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status Instruction */}
      <p className="text-lg sm:text-xl font-bold text-slate-700 mb-6">
        {getStatusText()}
      </p>

      {/* Primary Voice Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        <SeniorButton
          onClick={handleMicClick}
          variant={voiceState === 'listening' ? 'warning' : voiceState === 'speaking' ? 'danger' : 'primary'}
          size="xl"
          icon={voiceState === 'listening' ? Square : voiceState === 'speaking' ? MicOff : Mic}
          className="shadow-lg min-w-[240px] sm:min-w-[280px]"
          ariaLabel={voiceState === 'listening' ? 'Stop Listening' : voiceState === 'speaking' ? 'Stop Speaking' : 'Start Talking'}
        >
          {voiceState === 'listening'
            ? 'I am Done Speaking'
            : voiceState === 'speaking'
            ? 'Stop Teacher Speaking'
            : 'Start Talking'}
        </SeniorButton>

        {voiceState === 'speaking' && (
          <SeniorButton
            onClick={replay}
            variant="outline"
            size="lg"
            icon={RotateCcw}
            ariaLabel="Listen Again"
          >
            Listen Again
          </SeniorButton>
        )}
      </div>

      {/* Friendly Alternative: Type your question */}
      <div className="pt-4 border-t border-slate-100 max-w-xl mx-auto">
        {!showTextInput ? (
          <button
            onClick={() => setShowTextInput(true)}
            className="text-base sm:text-lg font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1.5 focus:outline-none focus:ring-4 focus:ring-blue-200 rounded-xl px-3 py-1"
          >
            Prefer to type? Click here to type your question
          </button>
        ) : (
          <form onSubmit={handleManualSend} className="flex items-center gap-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g., How do I make a WhatsApp video call?"
              className="flex-1 px-5 py-3.5 text-lg sm:text-xl border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 text-slate-900"
            />
            <SeniorButton type="submit" variant="primary" size="md" icon={Send}>
              Send
            </SeniorButton>
          </form>
        )}
      </div>
    </div>
  );
};
