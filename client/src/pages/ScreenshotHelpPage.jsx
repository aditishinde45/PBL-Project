import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { visionService } from '../services/visionService.js';
import { ScreenshotUploader } from '../components/vision/ScreenshotUploader.jsx';
import { ScreenshotViewer } from '../components/vision/ScreenshotViewer.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import { ArrowLeft, Camera, Sparkles } from 'lucide-react';

export const ScreenshotHelpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentStepContext = location.state?.currentStepContext || '';

  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (formData) => {
    if (currentStepContext) {
      formData.append('currentStepContext', currentStepContext);
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const res = await visionService.analyzeScreenshot(formData);
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      } else {
        setError('Could not analyze the screenshot. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Error processing screenshot.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-lg font-bold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Lesson</span>
        </button>
      </div>

      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-5xl block mb-1">📸</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          "Let me look at your screen."
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 font-medium max-w-xl mx-auto">
          Take a screenshot or photo of your phone screen, and I will show you exactly what to tap.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-lg font-bold text-center">
          {error}
        </div>
      )}

      {/* Loading or Viewer or Uploader */}
      {isAnalyzing ? (
        <LoadingState
          message="Looking at your screen..."
          subtitle="Identifying buttons, icons, and menus to guide you safely"
        />
      ) : analysis ? (
        <ScreenshotViewer
          analysis={analysis}
          onReset={() => setAnalysis(null)}
        />
      ) : (
        <ScreenshotUploader
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
};
