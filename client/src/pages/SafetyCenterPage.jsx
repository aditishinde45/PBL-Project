import React, { useState, useEffect } from 'react';
import { safetyService } from '../services/safetyService.js';
import { SafetyAlert } from '../components/safety/SafetyAlert.jsx';
import { ScamCard } from '../components/safety/ScamCard.jsx';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import {
  ShieldCheck,
  Search,
  MessageSquare,
  Link as LinkIcon,
  CreditCard,
  AlertTriangle,
  History,
  PhoneCall,
  Lock
} from 'lucide-react';

export const SafetyCenterPage = () => {
  const [activeTab, setActiveTab] = useState('message'); // 'message' | 'link' | 'payment' | 'scams' | 'history'
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scams, setScams] = useState([]);
  const [history, setHistory] = useState([]);

  // Load scams & history
  useEffect(() => {
    safetyService.getCommonScams().then(res => {
      if (res?.success) setScams(res.scams);
    }).catch(() => {});

    safetyService.getSafetyHistory().then(res => {
      if (res?.success) setHistory(res.checks);
    }).catch(() => {});
  }, [analysis]);

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    setIsScanning(true);
    setAnalysis(null);

    try {
      const type = activeTab === 'link' ? 'link' : 'message';
      const res = await safetyService.checkSafety(type, inputText.trim());
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      console.warn('Safety check error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const sampleSuspiciousMessages = [
    'Dear customer, electricity power will be disconnected at 9:30 PM tonight due to unpaid bill. Call officer at 9876543210.',
    'Congratulations! You won ₹25,00,000 in KBC Lottery. Click http://free-prize.xyz/win to claim prize.',
    'Your bank KYC is suspended. Send 6-digit OTP to prevent account block.'
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-fadeIn">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <span className="text-5xl block mb-1">🛡️</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Stay Safe Online
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 font-medium max-w-2xl mx-auto">
          Inspect suspicious messages, verify strange links, and learn how to keep your money safe.
        </p>
      </div>

      {/* Golden Rule Protection Banner */}
      <div className="bg-blue-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-blue-800 text-yellow-300 flex items-center justify-center text-3xl flex-shrink-0">
            🔒
          </div>
          <div>
            <h3 className="text-2xl font-black">
              The #1 Rule of Phone Safety
            </h3>
            <p className="text-lg text-blue-200 mt-1">
              Never tell your OTP, ATM PIN, or passwords to anyone on phone call or message. Real banks never ask for them.
            </p>
          </div>
        </div>
        <div className="bg-blue-800/80 border border-blue-700 rounded-2xl p-3.5 text-center whitespace-nowrap">
          <span className="text-xs font-bold text-blue-300 uppercase block">Cyber Crime Helpline</span>
          <span className="text-2xl font-black text-yellow-300">Dial 1930</span>
        </div>
      </div>

      {/* Safety Center Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'message', label: 'Check a Message', icon: MessageSquare },
          { id: 'link', label: 'Check a Link', icon: LinkIcon },
          { id: 'payment', label: 'Payment Safety Rules', icon: CreditCard },
          { id: 'scams', label: 'Common Scams Explained', icon: AlertTriangle },
          { id: 'history', label: 'Check History', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setAnalysis(null);
              }}
              className={`px-5 py-3 rounded-2xl font-bold text-lg sm:text-xl whitespace-nowrap transition-all flex items-center gap-2.5 ${
                isActive
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1 & 2: Check a Message or Link */}
      {(activeTab === 'message' || activeTab === 'link') && (
        <div className="space-y-8">
          <form onSubmit={handleScan} className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="block text-2xl font-extrabold text-slate-900">
                {activeTab === 'message' ? 'Paste or Type the Message You Received:' : 'Enter the Suspicious Web Link:'}
              </label>
              <p className="text-base sm:text-lg text-slate-600">
                {activeTab === 'message'
                  ? 'Copy the SMS or WhatsApp message and paste it below. We will check for scam tricks.'
                  : 'Enter the website address (e.g., bit.ly/... or xyz website) to verify its safety.'}
              </p>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeTab === 'message'
                  ? 'e.g., Dear customer, your electricity power will be cut tonight at 9:30 PM...'
                  : 'e.g., http://lottery-prize-2026.xyz'
              }
              className="w-full p-5 text-xl sm:text-2xl border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 text-slate-900"
            />

            {/* Quick samples */}
            {activeTab === 'message' && (
              <div className="space-y-2">
                <span className="text-sm font-bold text-slate-500">Or try one of these common scam examples:</span>
                <div className="flex flex-wrap gap-2">
                  {sampleSuspiciousMessages.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInputText(sample)}
                      className="text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-blue-100 hover:text-blue-900 p-2.5 rounded-xl text-left border border-slate-200"
                    >
                      "{sample.slice(0, 45)}..."
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <SeniorButton
                type="submit"
                disabled={!inputText.trim() || isScanning}
                variant="primary"
                size="xl"
                icon={Search}
                className="w-full sm:w-auto min-w-[240px]"
              >
                {isScanning ? 'Checking Message...' : 'Check Safety Now'}
              </SeniorButton>
            </div>
          </form>

          {isScanning && (
            <LoadingState message="Inspecting message for scam patterns..." subtitle="Checking against known cyber threats" />
          )}

          {analysis && <SafetyAlert analysis={analysis} />}
        </div>
      )}

      {/* TAB 3: Payment Safety Rules */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
            <h3 className="text-3xl font-black text-slate-900">
              Golden Rules for Digital Payments (UPI / Google Pay / PhonePe)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 space-y-3">
                <span className="text-4xl">✅</span>
                <h4 className="text-2xl font-black text-emerald-950">
                  When to Enter Your PIN:
                </h4>
                <p className="text-lg text-emerald-900 leading-relaxed font-medium">
                  You ONLY enter your secret PIN when <strong>YOU ARE PAYING MONEY</strong> to a shopkeeper or friend.
                </p>
              </div>

              <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 space-y-3">
                <span className="text-4xl">🚫</span>
                <h4 className="text-2xl font-black text-rose-950">
                  When You NEVER Enter PIN:
                </h4>
                <p className="text-lg text-rose-900 leading-relaxed font-medium">
                  You <strong>NEVER ENTER YOUR PIN TO RECEIVE MONEY</strong>, lottery winnings, refunds, or gifts. Anyone asking for a PIN to send you money is 100% a fraudster.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xl font-bold text-slate-900">Always Remember:</h4>
              <ul className="space-y-3">
                {[
                  'Verify the name of the shopkeeper on your screen before typing your PIN.',
                  'Never scan a QR code sent to you over WhatsApp or SMS to receive money.',
                  'Keep your phone screen turned away when entering your PIN in busy shops.',
                  'If you feel hurried or pressured by a seller, pause and take your time.'
                ].map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg sm:text-xl text-slate-700">
                    <ShieldCheck className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Common Scams Explained */}
      {activeTab === 'scams' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Scams Every Senior Citizen Should Know
            </h3>
            <p className="text-lg text-slate-600">
              Scammers try these 4 tricks most often. Tap on any scam to see how to spot and avoid it:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {scams.map((scam) => (
              <ScamCard key={scam.id} scam={scam} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Safety Check History */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            Your Past Safety Checks
          </h3>

          {history.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 text-center text-slate-600 text-xl font-semibold">
              No safety checks recorded yet. Whenever you inspect a message, it will be saved here for your reference.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((check) => (
                <div
                  key={check._id}
                  className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-0.5 rounded-full text-xs sm:text-sm font-extrabold uppercase ${
                        check.riskLevel === 'dangerous'
                          ? 'bg-rose-100 text-rose-800'
                          : check.riskLevel === 'suspicious'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {check.riskLevel}
                      </span>
                      <span className="text-sm font-bold text-slate-500">
                        {new Date(check.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xl font-black text-slate-900">{check.headline}</p>
                    <p className="text-base text-slate-600 italic line-clamp-1">"{check.queryContent}"</p>
                  </div>
                  <SeniorButton
                    onClick={() => {
                      setAnalysis(check);
                      setActiveTab('message');
                    }}
                    variant="outline"
                    size="md"
                  >
                    View Details
                  </SeniorButton>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
