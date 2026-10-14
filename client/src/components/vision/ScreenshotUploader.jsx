import React, { useState, useRef } from 'react';
import { SeniorButton } from '../common/SeniorButton.jsx';
import { Camera, UploadCloud, X, Check, Image as ImageIcon } from 'lucide-react';

export const ScreenshotUploader = ({ onAnalyze, isAnalyzing = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedSample, setSelectedSample] = useState('');
  const fileInputRef = useRef(null);

  const sampleScreens = [
    { id: 'whatsapp', label: '📸 WhatsApp Chat Screen', description: 'Chat with message box & paperclip' },
    { id: 'payment', label: '💳 UPI QR Scanner', description: 'Camera looking at shopkeeper QR code' },
    { id: 'scam', label: '⚠️ Suspicious SMS', description: 'Urgent electricity power cutoff message' },
    { id: 'settings', label: '⚙️ Phone Settings', description: 'Settings menu with Wi-Fi & Display' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedSample('');
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sampleId) => {
    setSelectedSample(sampleId);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedSample('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile && !selectedSample) return;

    const formData = new FormData();
    if (selectedFile) {
      formData.append('screenshot', selectedFile);
    }
    if (selectedSample) {
      formData.append('sampleType', selectedSample);
    }
    onAnalyze(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Upload Your Screenshot
        </h3>
        <p className="text-lg sm:text-xl text-slate-600">
          Show me what you see on your phone, and I will point directly to what you should tap.
        </p>
      </div>

      {/* File Upload Zone */}
      {!previewUrl && !selectedSample ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-3 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50/70 hover:bg-blue-50/40 transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner">
            <UploadCloud className="w-10 h-10" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Tap here to choose a photo or screenshot
          </p>
          <p className="text-base sm:text-lg text-slate-500">
            Accepts photos from your phone gallery (JPG, PNG, WEBP)
          </p>
        </div>
      ) : (
        /* Preview Zone */
        <div className="bg-slate-50 border-2 border-slate-300 rounded-3xl p-6 text-center relative max-w-md mx-auto">
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-700 transition-colors"
            title="Remove screenshot"
          >
            <X className="w-6 h-6" />
          </button>

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Screenshot Preview"
              className="max-h-72 sm:max-h-96 mx-auto rounded-2xl border-2 border-slate-300 object-contain shadow-md mb-4"
            />
          ) : (
            <div className="p-8 bg-blue-100/60 rounded-2xl mb-4 text-center">
              <span className="text-5xl block mb-2">📱</span>
              <p className="text-xl font-bold text-blue-950">
                {sampleScreens.find(s => s.id === selectedSample)?.label}
              </p>
              <p className="text-base text-blue-800 mt-1">
                {sampleScreens.find(s => s.id === selectedSample)?.description}
              </p>
            </div>
          )}

          <p className="text-lg font-bold text-slate-800">
            {selectedFile ? selectedFile.name : 'Sample Screen Selected'}
          </p>
        </div>
      )}

      {/* Or choose a sample instant demo screenshot */}
      <div className="pt-2">
        <p className="text-base sm:text-lg font-bold text-slate-700 mb-3 text-center">
          — Or tap a sample screen to try instantly —
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
          {sampleScreens.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample.id)}
              className={`p-3.5 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${
                selectedSample === sample.id
                  ? 'bg-blue-100 border-blue-600 text-blue-950 ring-2 ring-blue-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div>
                <span className="text-base sm:text-lg block">{sample.label}</span>
                <span className="text-xs sm:text-sm text-slate-500 font-normal">{sample.description}</span>
              </div>
              {selectedSample === sample.id && (
                <Check className="w-6 h-6 text-blue-700 flex-shrink-0 ml-2" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <div className="pt-4 flex justify-center">
        <SeniorButton
          type="submit"
          disabled={(!selectedFile && !selectedSample) || isAnalyzing}
          variant="primary"
          size="xl"
          icon={Camera}
          className="w-full sm:w-auto min-w-[280px]"
        >
          {isAnalyzing ? 'Looking at your screen...' : 'Look at My Screen'}
        </SeniorButton>
      </div>
    </form>
  );
};
