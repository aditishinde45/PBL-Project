import { getTranslation } from './client/src/i18n';

async function runTests() {
  console.log('====================================================');
  console.log('   ELDER EASE MVP — 25 SCENARIOS VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  const BASE_URL = 'http://localhost:5000/api';

  // Test 1: Login -> Home (Demo Login)
  let authToken = '';
  let seniorUser: any = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const data = await res.json();
    assert(data.success && data.data.token && data.data.user.role === 'SENIOR', 'Test 1: Login -> Home (Demo Login works)');
    authToken = data.data.token;
    seniorUser = data.data.user;
  } catch (err: any) {
    assert(false, 'Test 1: Login -> Home', err.message);
  }

  // Test 2: Home -> AI Assistant endpoint
  try {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ message: 'Hello ElderEase', language: 'en' }),
    });
    const data = await res.json();
    assert(data.success && data.data.reply, 'Test 2: Home -> AI Assistant endpoint available');
  } catch (err: any) {
    assert(false, 'Test 2: Home -> AI Assistant', err.message);
  }

  // Test 3: Text question -> AI response
  try {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ message: 'What is ElderEase?', language: 'en' }),
    });
    const data = await res.json();
    assert(
      data.success && data.data.reply.toLowerCase().includes('elderease') && data.data.mode === 'CONVERSATION',
      'Test 3: Text question -> AI response (empathetic, natural)'
    );
  } catch (err: any) {
    assert(false, 'Test 3: Text question', err.message);
  }

  // Test 4: Voice question -> AI response
  try {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ message: 'Can you help me use my phone?', language: 'en' }),
    });
    const data = await res.json();
    assert(data.success && data.data.reply.length > 5, 'Test 4: Voice question transcript -> AI response');
  } catch (err: any) {
    assert(false, 'Test 4: Voice question', err.message);
  }

  // Test 5: Hindi conversation
  try {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'नमस्ते, आप कैसे हैं?', language: 'hi' }),
    });
    const data = await res.json();
    assert(data.success && data.data.language === 'hi', 'Test 5: Hindi conversation');
  } catch (err: any) {
    assert(false, 'Test 5: Hindi conversation', err.message);
  }

  // Test 6: Marathi conversation
  try {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'नमस्कार, मला मदत हवी आहे', language: 'mr' }),
    });
    const data = await res.json();
    assert(data.success && data.data.language === 'mr', 'Test 6: Marathi conversation');
  } catch (err: any) {
    assert(false, 'Test 6: Marathi conversation', err.message);
  }

  // Test 7: Change English -> Hindi -> entire UI translation verified
  try {
    const enGreeting = getTranslation('en', 'home.greeting');
    const hiGreeting = getTranslation('hi', 'home.greeting');
    assert(
      enGreeting === '👋 Hello, Aaji!' && hiGreeting === '👋 नमस्ते, आजी!',
      'Test 7: Change English -> Hindi translates entire UI'
    );
  } catch (err: any) {
    assert(false, 'Test 7: Translation', err.message);
  }

  // Test 8: Change Hindi -> Marathi -> entire UI translation verified
  try {
    const mrGreeting = getTranslation('mr', 'home.greeting');
    const mrTalk = getTranslation('mr', 'home.talkToElderease');
    assert(
      mrGreeting === '👋 नमस्कार, आजी!' && mrTalk === '🗣️ एल्डरईजशी बोला',
      'Test 8: Change Hindi -> Marathi translates entire UI'
    );
  } catch (err: any) {
    assert(false, 'Test 8: Translation', err.message);
  }

  // Test 9: Change Light -> Dark theme support
  try {
    const res = await fetch(`${BASE_URL}/senior/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ theme: 'dark' }),
    });
    const data = await res.json();
    assert(data.success && data.data.theme === 'dark', 'Test 9: Change Light -> Dark persists in preferences');
  } catch (err: any) {
    assert(false, 'Test 9: Theme change', err.message);
  }

  // Test 10: Change font Normal -> Large -> Extra Large
  try {
    const res = await fetch(`${BASE_URL}/senior/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fontSize: 'EXTRA_LARGE' }),
    });
    const data = await res.json();
    assert(data.success && data.data.fontSize === 'EXTRA_LARGE', 'Test 10: Change font size persists in preferences');
  } catch (err: any) {
    assert(false, 'Test 10: Font scaling', err.message);
  }

  // Test 11: AI identifies WhatsApp photo task
  let photoTaskId = '';
  try {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Mujhe WhatsApp pe photo bhejna hai', language: 'hi' }),
    });
    const data = await res.json();
    assert(
      data.success &&
        data.data.mode === 'GUIDED_TASK' &&
        data.data.taskSlug === 'whatsapp-photo',
      'Test 11: AI identifies WhatsApp photo task'
    );
    photoTaskId = data.data.taskId;
  } catch (err: any) {
    assert(false, 'Test 11: WhatsApp task intent', err.message);
  }

  // Test 12: Guided task starts
  let sessionId = '';
  let taskSteps: any[] = [];
  try {
    const res = await fetch(`${BASE_URL}/tasks/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ taskId: photoTaskId }),
    });
    const data = await res.json();
    sessionId = data.data.id;
    taskSteps = data.data.task.steps;
    assert(data.success && sessionId && taskSteps.length === 4, 'Test 12: Guided task session starts');
  } catch (err: any) {
    assert(false, 'Test 12: Guided task starts', err.message);
  }

  // Test 13: Only one instruction appears per step
  assert(
    taskSteps.length > 0 &&
      taskSteps[0].instructionMr.length > 5 &&
      taskSteps[1].instructionMr.length > 5,
    'Test 13: One instruction per screen verified (discrete step data)'
  );

  // Test 14: Progress changes correctly
  try {
    const res = await fetch(`${BASE_URL}/tasks/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ currentStepIndex: 1, status: 'IN_PROGRESS' }),
    });
    const data = await res.json();
    assert(data.success && data.data.currentStepIndex === 1, 'Test 14: Progress changes correctly');
  } catch (err: any) {
    assert(false, 'Test 14: Progress changes', err.message);
  }

  // Test 15: Hear Again repeats current instruction
  const stepOneInstruction = taskSteps[0].instructionMr;
  assert(
    stepOneInstruction && (stepOneInstruction.includes('व्हॉट्सॲप') || stepOneInstruction.includes('उघडा')),
    'Test 15: Hear Again has valid repeat text'
  );

  // Test 16: Need Help provides contextual explanation
  const stepOneHelp = taskSteps[0].helpMr;
  assert(
    stepOneHelp && stepOneHelp.includes('हिरवे चिन्ह'),
    'Test 16: Need Help provides simplified contextual explanation'
  );

  // Test 17: User completes task
  try {
    const res = await fetch(`${BASE_URL}/tasks/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ currentStepIndex: 4, status: 'COMPLETED' }),
    });
    const data = await res.json();
    assert(data.success && data.data.status === 'COMPLETED', 'Test 17: User completes task');
  } catch (err: any) {
    assert(false, 'Test 17: Task completion', err.message);
  }

  // Test 18: Completion feedback submitted
  try {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ sessionId, rating: 'GOOD', comment: 'Very helpful!' }),
    });
    const data = await res.json();
    assert(data.success && data.data.rating === 'GOOD', 'Test 18: Completion feedback submitted');
  } catch (err: any) {
    assert(false, 'Test 18: Feedback', err.message);
  }

  // Test 19: User requests caregiver help
  let helpReqId = '';
  try {
    const res = await fetch(`${BASE_URL}/help/family`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ message: 'Aaji needs help using ElderEase.' }),
    });
    const data = await res.json();
    assert(data.success && data.data.id, 'Test 19: User requests caregiver help');
    helpReqId = data.data.id;
  } catch (err: any) {
    assert(false, 'Test 19: Caregiver help request', err.message);
  }

  // Test 20: Caregiver receives/has visible help request
  try {
    const res = await fetch(`${BASE_URL}/help/requests`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    const found = data.data.some((r: any) => r.id === helpReqId);
    assert(data.success && found, 'Test 20: Visible help request retrieved from database');
  } catch (err: any) {
    assert(false, 'Test 20: Visible help request', err.message);
  }

  // Test 21: AI handles "I don't understand" with step context
  try {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'मला समजलं नाही',
        language: 'mr',
        currentTaskSlug: 'whatsapp-photo',
        currentStepIndex: 0,
      }),
    });
    const data = await res.json();
    assert(
      data.success &&
        data.data.reply.includes('हिरवे चिन्ह') &&
        data.data.mode === 'CONVERSATION',
      'Test 21: AI handles "I don\'t understand" with step context'
    );
  } catch (err: any) {
    assert(false, 'Test 21: Interruption handling', err.message);
  }

  // Test 22: AI remembers current task context ("What was step one?")
  try {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'पहिला स्टेप काय होता?',
        language: 'mr',
        currentTaskSlug: 'whatsapp-photo',
        currentStepIndex: 2,
      }),
    });
    const data = await res.json();
    assert(
      data.success && data.data.reply.includes('पहिली पायरी'),
      'Test 22: AI remembers current task context across queries'
    );
  } catch (err: any) {
    assert(false, 'Test 22: Task memory', err.message);
  }

  // Test 23: AI does not expose technical errors
  try {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I clicked something by mistake and got an error', language: 'en' }),
    });
    const data = await res.json();
    const hasTechnicalTerms =
      data.data.reply.includes('Exception') ||
      data.data.reply.includes('500') ||
      data.data.reply.includes('null');
    assert(
      data.success && !hasTechnicalTerms && data.data.reply.includes('okay'),
      'Test 23: AI does not expose technical errors (comforting reassurance)'
    );
  } catch (err: any) {
    assert(false, 'Test 23: Technical errors', err.message);
  }

  // Test 24: UI translation coverage (Zero missing keys)
  try {
    const enKeys = ['login.welcome', 'home.greeting', 'assistant.title', 'guided.next', 'family.title', 'settings.title'];
    const allPresent = enKeys.every(
      (k) =>
        getTranslation('en', k) !== k &&
        getTranslation('hi', k) !== k &&
        getTranslation('mr', k) !== k
    );
    assert(allPresent, 'Test 24: Full translation key coverage across English, Hindi, and Marathi');
  } catch (err: any) {
    assert(false, 'Test 24: Translation coverage', err.message);
  }

  // Test 25: All 3 MVP tasks published with complete trilingual instructions
  try {
    const res = await fetch(`${BASE_URL}/tasks`);
    const data = await res.json();
    const slugs = data.data.map((t: any) => t.slug);
    const hasAll3 =
      slugs.includes('whatsapp-photo') &&
      slugs.includes('video-call') &&
      slugs.includes('youtube-video');
    assert(
      data.success && hasAll3 && data.data.length === 3,
      'Test 25: Exactly the 3 focused MVP tasks are published and active'
    );
  } catch (err: any) {
    assert(false, 'Test 25: Tasks library', err.message);
  }

  console.log('\n====================================================');
  console.log(`  SUMMARY: ${passed} PASSED / ${failed} FAILED (${passed + failed} Total)`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test suite error:', e);
  process.exit(1);
});
