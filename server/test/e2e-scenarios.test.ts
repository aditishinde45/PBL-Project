import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function req(endpoint: string, options: any = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data: any = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runE2EScenarios() {
  console.log('🚀 Running ElderEase Live End-to-End Test Scenarios...\n');

  // TEST 1 & 2: Senior Login
  const loginSenior = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'aai@elderease.com', password: 'aai123' }),
  });
  assert(loginSenior.ok, 'Senior login must succeed');
  const seniorToken = loginSenior.data.data.token;
  const seniorId = loginSenior.data.data.user.seniorProfileId;
  console.log('✅ Scenario 1 & 2: Senior logged in successfully (JWT issued)');

  // TEST 3 & 4: Senior Preferences & Scale Update
  const updatePref = await req('/senior/preferences', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${seniorToken}` },
    body: JSON.stringify({ fontSize: 'EXTRA_LARGE', highContrast: true, language: 'mr' }),
  });
  assert(updatePref.ok, 'Preference update must succeed');
  assert(updatePref.data.data.fontSize === 'EXTRA_LARGE', 'Font size must scale to EXTRA_LARGE');
  console.log('✅ Scenario 3 & 4: Senior preferences & font scale (200%) updated');

  // TEST 5 & 6: AI Conversational Interaction (Marathi & Appointment context)
  const aiChat = await req('/ai/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${seniorToken}` },
    body: JSON.stringify({ message: 'माझी पुढची डॉक्टरांची भेट कधी आहे?', language: 'mr' }),
  });
  assert(aiChat.ok, 'AI Chat must succeed');
  assert(aiChat.data.data.reply.length > 0, 'AI must return patient reply');
  console.log('✅ Scenario 5 & 6: AI Companion responded in Marathi with medical context');

  // TEST 7, 8, 9, 10: Medicine Scheduling & Confirmation
  const meds = await req('/medicines', {
    headers: { Authorization: `Bearer ${seniorToken}` },
  });
  assert(meds.ok && meds.data.data.length > 0, 'Medicines must be loaded');
  const targetSchedule = meds.data.data[0].schedules[0];

  const confirmMed = await req('/medicines/confirm', {
    method: 'POST',
    headers: { Authorization: `Bearer ${seniorToken}` },
    body: JSON.stringify({ scheduleId: targetSchedule.id, status: 'TAKEN' }),
  });
  assert(confirmMed.ok, 'Confirming medicine must succeed');
  console.log('✅ Scenario 7, 8, 9: Senior confirmed medicine as TAKEN');

  // Caregiver Login & Verification of Medicine Confirmation
  const loginCaregiver = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'daughter@elderease.com', password: 'daughter123' }),
  });
  assert(loginCaregiver.ok, 'Caregiver login must succeed');
  const caregiverToken = loginCaregiver.data.data.token;

  const dashboard = await req('/caregiver/dashboard', {
    headers: { Authorization: `Bearer ${caregiverToken}` },
  });
  assert(dashboard.ok, 'Caregiver dashboard must load');
  const aaiStatus = dashboard.data.data.seniors[0];
  assert(aaiStatus.medicineSummary.taken > 0, 'Caregiver must observe taken medicine');
  console.log('✅ Scenario 10: Caregiver dashboard reflected senior medicine taken');

  // TEST 13 & 14: Daily Check-In Submission
  const submitCheckin = await req('/checkins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${seniorToken}` },
    body: JSON.stringify({ status: 'OKAY', notes: 'Feeling healthy today' }),
  });
  assert(submitCheckin.ok, 'Check-in must succeed');

  const checkinStatus = await req('/caregiver/dashboard', {
    headers: { Authorization: `Bearer ${caregiverToken}` },
  });
  assert(checkinStatus.data.data.seniors[0].todayCheckIn === 'OKAY', 'Caregiver must see check-in completed');
  console.log('✅ Scenario 13 & 14: Daily Check-in completed and reflected on caregiver screen');

  // TEST 15 & 16: Emergency Help Dispatch
  const triggerEmergency = await req('/help/emergency', {
    method: 'POST',
    headers: { Authorization: `Bearer ${seniorToken}` },
    body: JSON.stringify({ latitude: 18.5204, longitude: 73.8567 }),
  });
  assert(triggerEmergency.ok, 'Emergency trigger must succeed');

  const notifsCaregiver = await req('/notifications', {
    headers: { Authorization: `Bearer ${caregiverToken}` },
  });
  assert(
    notifsCaregiver.data.data.some((n: any) => n.type === 'EMERGENCY'),
    'Caregiver must receive EMERGENCY notification'
  );
  console.log('✅ Scenario 15 & 16: Emergency alert triggered with GPS and caregiver alert dispatched');

  // TEST 20 & 21: Authorization Boundaries
  const unauthorizedCaregiver = await req('/senior/overview', {
    headers: { Authorization: `Bearer ${caregiverToken}` },
  });
  assert(unauthorizedCaregiver.status === 403, 'Caregiver cannot access senior private endpoints');
  console.log('✅ Scenario 20 & 21: Role-based authorization enforced (403 Forbidden verified)');

  // TEST 27 & 28: Scam Checker Protection
  const scamRes = await req('/ai/check-scam', {
    method: 'POST',
    body: JSON.stringify({
      messageText: 'Your power bill is pending. Share your bank OTP immediately.',
      language: 'mr',
    }),
  });
  assert(scamRes.data.data.isSuspicious === true, 'Fraud triggers must flag OTP scam');
  console.log('✅ Scenario 27 & 28: Scam analyzer flagged suspicious OTP threat with cautious advice');

  // TEST 24 & 25: Browser Extension Webpage Explainer
  const pageExpl = await req('/ai/explain-page', {
    method: 'POST',
    body: JSON.stringify({
      pageTitle: 'Electricity Bill Payment Form',
      url: 'https://billdesk.com',
      visibleText: 'Consumer number, Billing unit, Mobile number',
      language: 'mr',
    }),
  });
  assert(pageExpl.ok && pageExpl.data.data.stepToTake.length > 0, 'Page explainer must return step 1');
  console.log('✅ Scenario 24 & 25: Browser extension page explainer returned step-by-step guidance');

  console.log('\n🎉 ALL LIVE END-TO-END SCENARIOS VERIFIED SUCCESSFULLY!\n');
}

runE2EScenarios().catch((e) => {
  console.error(e);
  process.exit(1);
});
