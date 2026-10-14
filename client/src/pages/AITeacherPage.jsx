import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSpeech } from '../context/SpeechContext.jsx';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { aiService } from '../services/aiService.js';
import { lessonService } from '../services/lessonService.js';
import { SeniorButton } from '../components/common/SeniorButton.jsx';
import { VoiceVisualizer } from '../components/voice/VoiceVisualizer.jsx';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  RotateCcw,
  Send,
  Sparkles,
  LifeBuoy,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Trash2,
  Search,
  ArrowLeft
} from 'lucide-react';

const isMongoId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

const deduplicateConversations = (list) => {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set();
  const seenContents = new Map();

  for (const c of list) {
    if (!c || !Array.isArray(c.messages)) continue;
    const firstUserMsg = c.messages.find(m => m.role === 'user' && m.content && m.content.trim().length > 0);
    if (!firstUserMsg) continue;

    const contentKey = `${c.title || ''}:::${(firstUserMsg.content || '').trim()}`.toLowerCase();

    if (seenIds.has(c.id)) {
      continue;
    }

    if (seenContents.has(contentKey)) {
      const existing = seenContents.get(contentKey);
      // Prefer canonical MongoDB 24-character ObjectId over client timestamp ID
      if (isMongoId(c.id) && !isMongoId(existing.id)) {
        seenIds.delete(existing.id);
        seenIds.add(c.id);
        seenContents.set(contentKey, c);
      }
      continue;
    }

    seenIds.add(c.id);
    seenContents.set(contentKey, c);
  }

  return Array.from(seenContents.values());
};

export const AITeacherPage = () => {
  const { user } = useAuth();
  const { language } = useAccessibility();
  const {
    voiceState,
    transcript,
    setTranscript,
    clearTranscript,
    speechError,
    isSpeechRecognitionSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    replay,
    isMuted
  } = useSpeech();

  const location = useLocation();
  const navigate = useNavigate();

  const [currentTopic, setCurrentTopic] = useState(null);
  const [topicTitle, setTopicTitle] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [stepTitle, setStepTitle] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const getInitialMessage = () => ({
    role: 'assistant',
    content: language === 'Hindi'
      ? `नमस्ते ${user?.name?.split(' ')[0] || ''} जी! मैं आपका पर्सनल टेक्नोलॉजी टीचर हूँ। आप मुझसे कुछ भी पूछ सकते हैं, जैसे: "व्हाट्सएप पर फोटो कैसे भेजें?" या "फोन पर अक्षर बड़े कैसे करें?"। हम आराम से एक-एक कदम सीखेंगे!`
      : language === 'Marathi'
        ? `नमस्कार ${user?.name?.split(' ')[0] || ''} जी! मी तुमचा तंत्रज्ञान शिक्षक आहे. तुम्हाला फोन किंवा कॉम्प्युटरबद्दल काहीही विचारायचे असेल तर सांगा, आपण हळू हळू एक-एक पायरी शिकूया.`
        : `Hello ${user?.name?.split(' ')[0] || 'Friend'}! I am your patient personal technology teacher. What would you like to learn today? Tell me, or choose one of the suggestions below.`
  });

  const [messages, setMessages] = useState([getInitialMessage()]);

  const storageKey = user?._id ? `elderEaseChatHistory_${user._id}` : 'elderEaseChatHistory_guest';

  // History State scoped per user
  const [conversations, setConversations] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(() => Date.now().toString());
  const currentSessionIdRef = useRef(currentSessionId);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  // Load chat history for the logged-in user from MongoDB Atlas
  useEffect(() => {
    let isMounted = true;

    const loadUserChatHistory = async () => {
      // 1. Load from user-specific local storage immediately and deduplicate
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const deduped = deduplicateConversations(parsed);
            if (isMounted) setConversations(deduped);
            localStorage.setItem(storageKey, JSON.stringify(deduped));
          } catch (e) {
            if (isMounted) setConversations([]);
          }
        } else {
          if (isMounted) setConversations([]);
        }

        // Clean up legacy unpartitioned key if found
        if (localStorage.getItem('elderEaseChatHistory')) {
          localStorage.removeItem('elderEaseChatHistory');
        }
      }

      // 2. Fetch fresh user-isolated history from MongoDB Atlas
      if (user?._id) {
        try {
          const res = await aiService.getConversations();
          if (isMounted && res?.success && Array.isArray(res.conversations)) {
            const deduped = deduplicateConversations(res.conversations);
            setConversations(deduped);
            localStorage.setItem(storageKey, JSON.stringify(deduped));
          }
        } catch (err) {
          console.warn('Notice loading user conversations:', err.message);
        }
      }
    };

    startNewChat();
    loadUserChatHistory();

    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  const filteredConversations = deduplicateConversations(conversations)
    .filter(c => (c.title || 'Chat').toLowerCase().includes(searchQuery.toLowerCase()));

  const [suggestedLessons, setSuggestedLessons] = useState([]);
  const [isSearchingLesson, setIsSearchingLesson] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() || filteredConversations.length > 0) {
      setSuggestedLessons([]);
      setIsSearchingLesson(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLesson(true);
      try {
        const res = await lessonService.getLessons('', searchQuery);
        if (res?.success && res.lessons?.length > 0) {
          setSuggestedLessons(res.lessons);
        } else {
          setSuggestedLessons([]);
        }
      } catch (err) {
        console.warn('Error fetching lesson suggestion:', err);
      } finally {
        setIsSearchingLesson(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filteredConversations.length]);

  // Save conversation history to user-isolated storage and MongoDB Atlas ONLY if user actually sent a message
  useEffect(() => {
    const firstUserMsg = messages.find(m => m.role === 'user' && m.content && m.content.trim().length > 0);

    // If the user did not send any message, DO NOT add to history tab
    if (!firstUserMsg) {
      return;
    }

    const activeSessionId = currentSessionIdRef.current;
    const rawTitle = firstUserMsg.content.trim();
    const title = rawTitle.length > 30 ? rawTitle.substring(0, 30) + '...' : rawTitle;

    const sessionData = {
      id: activeSessionId,
      title,
      date: new Date().toISOString(),
      messages,
      currentStep,
      totalSteps,
      currentTopic,
      topicTitle,
      isCompleted
    };

    setConversations(prev => {
      const existingIdx = prev.findIndex(c => c.id === activeSessionId);
      let updated = [...prev];

      if (existingIdx >= 0) {
        updated[existingIdx] = sessionData;
      } else {
        updated = [sessionData, ...updated];
      }
      const deduped = deduplicateConversations(updated);
      localStorage.setItem(storageKey, JSON.stringify(deduped));
      return deduped;
    });

    // Save asynchronously to MongoDB Atlas if user is logged in
    if (user?._id) {
      aiService.saveConversation(sessionData).then(res => {
        if (res?.success && res.conversation?.id) {
          const serverId = res.conversation.id;
          if (serverId !== activeSessionId) {
            currentSessionIdRef.current = serverId;
            setCurrentSessionId(serverId);

            // Replace temporary client ID with server MongoDB ID and deduplicate
            setConversations(prev => {
              const updated = prev.map(c => (c.id === activeSessionId ? { ...c, id: serverId } : c));
              const deduped = deduplicateConversations(updated);
              localStorage.setItem(storageKey, JSON.stringify(deduped));
              return deduped;
            });
          }
        }
      }).catch(err => {
        console.warn('Notice saving conversation to MongoDB Atlas:', err.message);
      });
    }
  }, [messages, currentStep, totalSteps, currentTopic, topicTitle, isCompleted, user?._id]);

  const loadConversation = (sessionId) => {
    const convo = conversations.find(c => c.id === sessionId);
    if (convo) {
      currentSessionIdRef.current = convo.id;
      setCurrentSessionId(convo.id);
      setMessages(convo.messages || []);
      setCurrentStep(convo.currentStep || 0);
      setTotalSteps(convo.totalSteps || 0);
      setCurrentTopic(convo.currentTopic || null);
      setTopicTitle(convo.topicTitle || null);
      setIsCompleted(convo.isCompleted || false);
    }
  };

  const startNewChat = () => {
    const newId = Date.now().toString();
    currentSessionIdRef.current = newId;
    setCurrentSessionId(newId);
    setMessages([getInitialMessage()]);
    setCurrentStep(0);
    setTotalSteps(0);
    setCurrentTopic(null);
    setTopicTitle(null);
    setIsCompleted(false);
  };

  const deleteConversation = async (e, id) => {
    e.stopPropagation();
    const convoToDelete = conversations.find(c => c.id === id);
    const targetTitle = convoToDelete?.title;

    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id && (!targetTitle || c.title !== targetTitle));
      const deduped = deduplicateConversations(updated);
      localStorage.setItem(storageKey, JSON.stringify(deduped));
      return deduped;
    });

    if (user?._id) {
      try {
        await aiService.deleteConversation(id);
      } catch (err) {
        console.warn('Notice deleting conversation on Atlas:', err.message);
      }
    }

    if (currentSessionIdRef.current === id || currentSessionId === id) {
      startNewChat();
    }
  };

  const [inputVal, setInputVal] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  // Initial query if navigated from dashboard
  useEffect(() => {
    if (location.state?.initialQuery) {
      handleUserQuery(location.state.initialQuery);
      // clear location state so it doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleUserQuery = async (queryText, stepOverride = null, topicOverride = null) => {
    const text = (queryText || '').trim();
    if (!text || isAiLoading) return;

    const userMessage = { role: 'user', content: text };
    const conversationHistory = [...messagesRef.current, userMessage];

    setMessages(prev => [...prev, userMessage]);
    setInputVal('');
    if (clearTranscript) clearTranscript();
    setIsAiLoading(true);

    const stepToSend = stepOverride !== null ? stepOverride : currentStep;
    const topicToSend = topicOverride !== null ? topicOverride : currentTopic;

    try {
      const res = await aiService.chatWithTeacher(
        text,
        conversationHistory,
        null,
        stepToSend,
        topicToSend
      );

      if (res && res.success && res.reply) {
        const assistantMsg = {
          role: 'assistant',
          content: res.reply,
          step: res.currentStep,
          totalSteps: res.totalSteps,
          stepTitle: res.stepTitle,
          isCompleted: res.isCompleted
        };
        setMessages(prev => [...prev, assistantMsg]);

        if (res.currentTopic) setCurrentTopic(res.currentTopic);
        if (res.topicTitle) setTopicTitle(res.topicTitle);
        if (res.currentStep !== undefined) setCurrentStep(res.currentStep);
        if (res.totalSteps !== undefined) setTotalSteps(res.totalSteps);
        setIsCompleted(!!res.isCompleted);

        speak(res.reply);
      }
    } catch (err) {
      const fallbackMsg = "I am right here with you. Please ask your question once more, and we will take it one simple step at a time.";
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackMsg }]);
      speak(fallbackMsg);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleNextStep = () => {
    handleUserQuery("I'm done with this step! Please give me the next step and guidelines.", currentStep, currentTopic);
  };

  const handleExplainSlowly = () => {
    handleUserQuery("Please explain this step more slowly and simply.", currentStep, currentTopic);
  };

  const handleStuck = () => {
    handleUserQuery("I'm a bit stuck on this step. Please help me.", currentStep, currentTopic);
  };

  const handleVoiceToggle = () => {
    if (voiceState === 'listening') {
      stopListening();
    } else if (voiceState === 'speaking') {
      stopSpeaking();
    } else {
      startListening((finalTranscript) => {
        if (finalTranscript && finalTranscript.trim().length > 0) {
          handleUserQuery(finalTranscript);
        }
      });
    }
  };

  const quickPrompts = [
    'How do I send a photo on WhatsApp?',
    'Teach me how to make a video call',
    'How do I make text on my phone bigger?',
    'How to check if a message is a scam?',
    'How to book a train ticket on IRCTC?',
    'How do I pay with Google Pay QR code?'
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] w-full">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-4 flex flex-col shadow-inner shrink-0">
        <div className="flex flex-col gap-2 mb-4">
          <button
            onClick={startNewChat}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors text-lg"
          >
            <span className="text-2xl leading-none mb-1">+</span> New Chat
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm"
            title="Quit the chat and return to dashboard"
          >
            <ArrowLeft className="w-4 h-4" /> Leave Chat
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 text-slate-700 text-[15px] shadow-2xs"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <h3 className="text-lg font-black text-slate-800 mb-3 px-2 uppercase tracking-wide">Past Conversations</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="px-2">
              <p className="text-slate-500 font-medium italic mb-4">
                {searchQuery ? 'No matching conversations.' : 'No history yet. Start a chat!'}
              </p>

              {isSearchingLesson ? (
                <p className="text-sm text-slate-400">Searching library...</p>
              ) : suggestedLessons.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-blue-900 mb-1">
                    Lessons available in the library:
                  </p>
                  {suggestedLessons.map((lesson) => (
                    <div key={lesson._id || lesson.slug} className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                      <h4 className="font-extrabold text-slate-900 mb-3">{lesson.title}</h4>
                      <button
                        onClick={() => navigate(`/lessons/${lesson._id || lesson.slug}`)}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" /> Start Lesson
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            filteredConversations.map(c => (
              <div key={c.id} className="relative w-full flex items-center">
                <button
                  onClick={() => loadConversation(c.id)}
                  className={`flex-1 text-left px-4 py-3.5 rounded-xl transition-all cursor-pointer pr-12 ${c.id === currentSessionId
                      ? 'bg-blue-100 text-blue-900 font-bold border-2 border-blue-300 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 font-semibold border-2 border-slate-200 shadow-2xs'
                    }`}
                >
                  <div className="truncate text-[15px]">{c.title || 'New Chat'}</div>
                  <div className="text-xs font-medium text-slate-400 mt-1.5">
                    {new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
                <button
                  onClick={(e) => deleteConversation(e, c.id)}
                  title="Delete Chat"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 w-full">
        {/* Page Title */}
        <div className="text-center space-y-2 border-b border-slate-200 pb-5">
          <span className="text-4xl sm:text-5xl block mb-1">👵</span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Talk to Your AI Teacher
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-xl mx-auto">
            Ask any question in simple words. I will explain one step at a time, without any hurry.
          </p>
        </div>

        {/* Voice Status Indicator Banner */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 text-center shadow-xs space-y-4">
          <div className="min-h-[50px] flex items-center justify-center">
            {voiceState !== 'idle' || isAiLoading ? (
              <VoiceVisualizer state={isAiLoading ? 'processing' : voiceState} size="normal" />
            ) : (
              <p className="text-base sm:text-lg font-bold text-slate-600">
                Teacher is ready for your voice. Tap the blue button below to speak!
              </p>
            )}
          </div>

          {voiceState === 'listening' && (
            <p className="text-base font-extrabold text-blue-700 animate-pulse">
              🎙️ Microphone is active — please speak clearly into your device
            </p>
          )}

          {speechError && (
            <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 p-4 rounded-2xl max-w-xl mx-auto text-left shadow-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div>
                  <p className="font-extrabold text-base sm:text-lg text-amber-900">
                    {speechError}
                  </p>
                  <p className="text-sm font-medium text-amber-800 mt-1">
                    Tip: If your browser asked for microphone permission, make sure to click <strong>"Allow"</strong>. You can also type your question anytime in the box below!
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isSpeechRecognitionSupported && (
            <div className="bg-blue-50 border-2 border-blue-200 text-blue-900 p-3.5 rounded-2xl max-w-xl mx-auto text-sm font-semibold">
              ℹ️ Voice recognition is supported in Google Chrome, Microsoft Edge, and Safari. You can also type your questions in the box below.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <SeniorButton
              onClick={handleVoiceToggle}
              variant={voiceState === 'listening' ? 'warning' : voiceState === 'speaking' ? 'danger' : 'primary'}
              size="lg"
              icon={voiceState === 'listening' ? Square : voiceState === 'speaking' ? MicOff : Mic}
              className="min-w-[240px] shadow-sm"
            >
              {voiceState === 'listening'
                ? 'I Finished Speaking'
                : voiceState === 'speaking'
                  ? 'Stop Teacher Speaking'
                  : 'Tap to Speak'}
            </SeniorButton>

            {voiceState === 'speaking' && (
              <SeniorButton onClick={replay} variant="outline" size="md" icon={RotateCcw}>
                Repeat
              </SeniorButton>
            )}
          </div>

          {transcript && (
            <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-2xl max-w-lg mx-auto flex items-center justify-between gap-3 shadow-xs">
              <p className="text-base sm:text-lg font-bold text-blue-900 truncate">
                Hearing: "{transcript}"
              </p>
              <button
                onClick={() => handleUserQuery(transcript)}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm whitespace-nowrap shadow-xs cursor-pointer"
              >
                Ask Now ➤
              </button>
            </div>
          )}
        </div>

        {/* Chat Thread */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 min-h-[380px] max-h-[520px] overflow-y-auto">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLatestAssistant = !isUser && idx === messages.length - 1;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                    👵
                  </div>
                )}

                <div
                  className={`rounded-3xl p-5 sm:p-6 max-w-xl text-lg sm:text-xl leading-relaxed shadow-xs ${isUser
                      ? 'bg-blue-700 text-white rounded-tr-none font-semibold'
                      : 'bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-tl-none font-medium'
                    }`}
                >
                  {!isUser && msg.step > 0 && (
                    <div className="mb-3 inline-flex items-center gap-2 bg-blue-100 text-blue-900 font-extrabold text-sm sm:text-base px-3.5 py-1 rounded-full border border-blue-200">
                      <span>Step {msg.step} of {msg.totalSteps || 4}</span>
                      {msg.stepTitle && <span>• {msg.stepTitle}</span>}
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* If AI provided a generated lesson */}
                  {msg.generatedLesson && (
                    <div className="mt-4 pt-4 border-t border-slate-300 space-y-3">
                      <div className="bg-white p-4 rounded-2xl border-2 border-blue-200">
                        <span className="text-xs font-bold text-blue-800 uppercase">
                          {msg.generatedLesson.category} • {msg.generatedLesson.steps?.length} Steps
                        </span>
                        <h4 className="text-xl font-extrabold text-slate-950 mt-1">
                          {msg.generatedLesson.title}
                        </h4>
                        <p className="text-sm sm:text-base text-slate-600 mt-1">
                          {msg.generatedLesson.description}
                        </p>
                      </div>

                      <SeniorButton
                        onClick={() => navigate(`/learn/${msg.generatedLesson._id}`)}
                        variant="success"
                        size="lg"
                        icon={ArrowRight}
                        fullWidth
                      >
                        Start This Lesson in Practice Lab
                      </SeniorButton>
                    </div>
                  )}

                  {!isUser && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => speak(msg.content)}
                        className="text-sm sm:text-base font-bold text-blue-800 hover:text-blue-950 inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4 text-blue-600" />
                        <span>Listen to this</span>
                      </button>

                      {isLatestAssistant && currentStep > 0 && !isCompleted && (
                        <button
                          onClick={handleNextStep}
                          disabled={isAiLoading}
                          className="text-sm sm:text-base font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>✓ Done / Next Step</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                    {user?.avatar || '👵'}
                  </div>
                )}
              </div>
            );
          })}

          {isAiLoading && (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl flex-shrink-0 animate-pulse">
                👵
              </div>
              <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 rounded-tl-none">
                <p className="text-lg font-bold text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  Thinking and preparing a simple explanation...
                </p>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Prominent Senior Action Bar when Step is in progress */}
        {currentStep > 0 && !isCompleted && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-3 border-emerald-400 rounded-3xl p-5 sm:p-6 shadow-md space-y-4 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-950 uppercase tracking-wide">
                  {topicTitle || 'Active Lesson'} • Step {currentStep} of {totalSteps || 4}
                </span>
              </div>
              {stepTitle && (
                <span className="text-sm sm:text-base font-bold text-slate-800 bg-white/90 px-3.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                  {stepTitle}
                </span>
              )}
            </div>

            <p className="text-slate-700 text-base sm:text-lg font-semibold">
              Take your time to try this step on your phone. Whenever you are ready for the next guidance, tap the green button below:
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <SeniorButton
                onClick={handleNextStep}
                disabled={isAiLoading}
                variant="success"
                size="xl"
                icon={CheckCircle2}
                className="flex-1 min-w-[260px] text-xl sm:text-2xl font-black py-4 shadow-md"
              >
                ✓ Done (Give Me Next Step)
              </SeniorButton>

              <SeniorButton
                onClick={handleExplainSlowly}
                disabled={isAiLoading}
                variant="warning"
                size="lg"
                icon={Sparkles}
                className="font-bold shadow-xs"
              >
                🐢 Explain Slower
              </SeniorButton>

              <SeniorButton
                onClick={replay}
                disabled={isAiLoading}
                variant="outline"
                size="lg"
                icon={RotateCcw}
                className="font-bold bg-white shadow-xs"
              >
                Repeat
              </SeniorButton>

              <SeniorButton
                onClick={handleStuck}
                disabled={isAiLoading}
                variant="secondary"
                size="lg"
                icon={HelpCircle}
                className="font-bold shadow-xs"
              >
                🤔 I'm Stuck
              </SeniorButton>
            </div>
          </div>
        )}

        {/* Completion Celebration Card */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-6 sm:p-8 text-center shadow-lg space-y-4">
            <span className="text-5xl block">🎉 👵 🎉</span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Wonderful Job! You Completed This Task!
            </h3>
            <p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto font-medium">
              You are gaining confidence with technology step by step. What would you like to explore next?
            </p>
            <div className="pt-2">
              <SeniorButton
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentStep(0);
                  setCurrentTopic(null);
                  setTopicTitle(null);
                  handleUserQuery('What other simple things can I learn?');
                }}
                variant="warning"
                size="lg"
                icon={Sparkles}
                className="font-extrabold shadow-md"
              >
                Learn Another Task
              </SeniorButton>
            </div>
          </div>
        )}

        {/* Suggested Quick Prompts */}
        <div className="space-y-2">
          <span className="text-sm sm:text-base font-bold text-slate-500">
            Or tap any question below to ask:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleUserQuery(prompt)}
                className="text-left text-base sm:text-lg font-bold bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-900 px-4 py-2.5 rounded-2xl border-2 border-slate-200 transition-colors shadow-xs cursor-pointer"
              >
                💬 "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Manual Text Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserQuery(inputVal);
          }}
          className="flex items-center gap-3 bg-white p-3 rounded-3xl border-2 border-slate-300 shadow-sm"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type your question here (e.g. How to send a photo?)"
            className="flex-1 px-4 py-3 text-lg sm:text-xl rounded-2xl focus:outline-none text-slate-900"
          />
          <SeniorButton type="submit" disabled={!inputVal.trim() || isAiLoading} variant="primary" size="lg" icon={Send}>
            Ask
          </SeniorButton>
        </form>
      </div>
    </div>
  );
};
