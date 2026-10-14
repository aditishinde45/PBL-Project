// ElderEase Comprehensive Verification Test Script
import assert from 'assert';

const BASE_URL = process.env.API_BASE_URL || 'https://elderease-0h4i.onrender.com/api';

async function runTests() {
  console.log('🧪 Starting ElderEase Automated Verification Suite...\n');
  let token = '';
  let familyToken = '';
  let testLessonId = '';

  // 1. Health Check
  console.log('1. Testing /health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'healthy');
  console.log('   ✅ Health OK:', healthData.product, healthData.version);

  // 2. Demo Senior Login (Grandma Asha)
  console.log('2. Testing /auth/demo/senior...');
  const seniorLoginRes = await fetch(`${BASE_URL}/auth/demo/senior`, { method: 'POST' });
  const seniorData = await seniorLoginRes.json();
  assert.strictEqual(seniorData.success, true);
  assert.strictEqual(seniorData.user.name, 'Asha Sharma');
  token = seniorData.token;
  console.log('   ✅ Demo Senior Login OK:', seniorData.user.name, `(${seniorData.user.preferredLanguage})`);

  // 3. Demo Caregiver Login (Rahul)
  console.log('3. Testing /auth/demo/family...');
  const familyLoginRes = await fetch(`${BASE_URL}/auth/demo/family`, { method: 'POST' });
  const familyData = await familyLoginRes.json();
  assert.strictEqual(familyData.success, true);
  assert.strictEqual(familyData.user.role, 'family');
  familyToken = familyData.token;
  console.log('   ✅ Demo Caregiver Login OK:', familyData.user.name, `(${familyData.user.role})`);

  // 4. Update Settings / Accessibility Preferences
  console.log('4. Testing PUT /auth/settings...');
  const settingsRes = await fetch(`${BASE_URL}/auth/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      preferredLanguage: 'Hindi',
      teachingSpeed: 'Slowly',
      accessibilityPreferences: { textSize: 'extra-large', highContrast: true, voiceSpeed: 0.8 }
    })
  });
  const settingsData = await settingsRes.json();
  assert.strictEqual(settingsData.success, true);
  console.log('   ✅ Settings Update OK. New Language:', settingsData.user.preferredLanguage);

  // 5. Lessons Catalog
  console.log('5. Testing GET /lessons...');
  const lessonsRes = await fetch(`${BASE_URL}/lessons`);
  const lessonsData = await lessonsRes.json();
  assert.strictEqual(lessonsData.success, true);
  assert.ok(lessonsData.count >= 10, `Expected 10+ lessons, got ${lessonsData.count}`);
  testLessonId = lessonsData.lessons[0]._id;
  console.log(`   ✅ Lessons Catalog OK: Found ${lessonsData.count} lessons.`);
  console.log('      First lesson:', lessonsData.lessons[0].title, `(${lessonsData.lessons[0].steps.length} steps)`);

  // 6. Categories
  console.log('6. Testing GET /lessons/categories...');
  const catRes = await fetch(`${BASE_URL}/lessons/categories`);
  const catData = await catRes.json();
  assert.strictEqual(catData.success, true);
  console.log('   ✅ Categories OK:', catData.categories.map(c => c.name).join(', '));

  // 7. Lesson Detail
  console.log('7. Testing GET /lessons/:id...');
  const lessonRes = await fetch(`${BASE_URL}/lessons/${testLessonId}`);
  const singleLesson = await lessonRes.json();
  assert.strictEqual(singleLesson.success, true);
  assert.strictEqual(singleLesson.lesson.title, lessonsData.lessons[0].title);
  console.log('   ✅ Lesson Detail OK:', singleLesson.lesson.title);

  // 8. Learning Session - Start
  console.log('8. Testing POST /learning/start...');
  const startSessionRes = await fetch(`${BASE_URL}/learning/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ lessonId: testLessonId })
  });
  const startSessionData = await startSessionRes.json();
  assert.strictEqual(startSessionData.success, true);
  console.log('   ✅ Session Start OK. Current step:', startSessionData.progress.currentStep);

  // 9. Update Step Progress (Done)
  console.log('9. Testing PUT /learning/:id/progress...');
  const stepProgRes = await fetch(`${BASE_URL}/learning/${testLessonId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ stepNumber: 1, actionType: 'done' })
  });
  const stepProgData = await stepProgRes.json();
  assert.strictEqual(stepProgData.success, true);
  console.log('   ✅ Step Progress OK. Percentage:', stepProgData.percentage, '%');

  // 10. Complete Lesson
  console.log('10. Testing POST /learning/:id/complete...');
  const completeRes = await fetch(`${BASE_URL}/learning/${testLessonId}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const completeData = await completeRes.json();
  assert.strictEqual(completeData.success, true);
  console.log('   ✅ Lesson Complete OK:', completeData.message);

  // 11. Practice Mode Submission
  console.log('11. Testing POST /learning/:id/practice...');
  const practiceRes = await fetch(`${BASE_URL}/learning/${testLessonId}/practice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ answers: [1, 2] })
  });
  const practiceData = await practiceRes.json();
  assert.strictEqual(practiceData.success, true);
  console.log('   ✅ Practice Submission OK:', `${practiceData.correctCount}/${practiceData.total} correct.`, `"${practiceData.encouragement}"`);

  // 12. AI Conversational Teacher Chat
  console.log('12. Testing POST /ai/chat...');
  const aiChatRes = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ message: 'Mujhe WhatsApp par photo bhejna sikhna hai' })
  });
  const aiChatData = await aiChatRes.json();
  assert.strictEqual(aiChatData.success, true);
  console.log('   ✅ AI Teacher Chat OK. Reply snippet:', aiChatData.reply.slice(0, 80) + '...');

  // 13. Dynamic "Teach Me Anything" Lesson Generator
  console.log('13. Testing POST /ai/lesson (Dynamic Curriculum)...');
  const dynamicLessonRes = await fetch(`${BASE_URL}/ai/lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ topic: 'how to book a train ticket' })
  });
  const dynamicData = await dynamicLessonRes.json();
  assert.strictEqual(dynamicData.success, true);
  assert.ok(dynamicData.lesson.steps.length >= 3);
  console.log('   ✅ Dynamic Lesson Generation OK:', dynamicData.lesson.title, `(${dynamicData.lesson.steps.length} steps generated)`);

  // 14. Screenshot Vision Assistance
  console.log('14. Testing POST /vision/analyze...');
  const visionRes = await fetch(`${BASE_URL}/vision/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      sampleType: 'whatsapp',
      userPrompt: 'Where is the paperclip icon to attach photo?'
    })
  });
  const visionData = await visionRes.json();
  assert.strictEqual(visionData.success, true);
  assert.strictEqual(visionData.analysis.detectedScreen, 'WhatsApp Conversation Screen');
  assert.ok(visionData.analysis.targetHighlight.label.includes('Paperclip'));
  console.log('   ✅ Vision Screenshot Assistance OK:');
  console.log('      Detected:', visionData.analysis.detectedScreen);
  console.log('      Target Action:', visionData.analysis.targetAction);

  // 15. Safety Center - Scam Message Inspection
  console.log('15. Testing POST /safety/check (Urgent Electricity Bill Scam)...');
  const safetyRes = await fetch(`${BASE_URL}/safety/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      type: 'message',
      content: 'Dear customer, your electricity power will be disconnected at 9:30 PM tonight due to pending bill. Call officer immediately at 9876543210.'
    })
  });
  const safetyData = await safetyRes.json();
  assert.strictEqual(safetyData.success, true);
  assert.strictEqual(safetyData.analysis.riskLevel, 'dangerous');
  console.log('   ✅ Safety Center Scam Inspection OK:');
  console.log('      Risk Level:', safetyData.analysis.riskLevel, `(${safetyData.analysis.riskScore}/100)`);
  console.log('      Headline:', safetyData.analysis.headline);

  // 16. Safety History
  console.log('16. Testing GET /safety/history...');
  const safetyHistRes = await fetch(`${BASE_URL}/safety/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const safetyHistData = await safetyHistRes.json();
  assert.strictEqual(safetyHistData.success, true);
  console.log('   ✅ Safety History OK:', safetyHistData.count, 'checks recorded.');

  // 17. Progress Analytics
  console.log('17. Testing GET /progress...');
  const progRes = await fetch(`${BASE_URL}/progress`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const progData = await progRes.json();
  assert.strictEqual(progData.success, true);
  console.log('   ✅ Progress Analytics OK:', `${progData.stats.totalCompletedLessons} lessons completed. Streak: ${progData.stats.learningStreak} days.`);

  // 18. Recommendations
  console.log('18. Testing GET /progress/recommendations...');
  const recRes = await fetch(`${BASE_URL}/progress/recommendations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const recData = await recRes.json();
  assert.strictEqual(recData.success, true);
  console.log('   ✅ Recommendations OK:', recData.recommendations.map(r => r.title).join(' | '));

  // 19. Family Dashboard Overview
  console.log('19. Testing GET /family/overview (Caregiver View)...');
  const famOverviewRes = await fetch(`${BASE_URL}/family/overview`, {
    headers: { 'Authorization': `Bearer ${familyToken}` }
  });
  const famOverviewData = await famOverviewRes.json();
  assert.strictEqual(famOverviewData.success, true);
  assert.strictEqual(famOverviewData.sharingEnabled, true);
  console.log('   ✅ Family Overview OK: Senior name:', famOverviewData.senior.name, `(${famOverviewData.completedLessons.length} completed lessons shared)`);

  // 20. Send Cheer Note from Family
  console.log('20. Testing POST /family/notes...');
  const cheerNoteRes = await fetch(`${BASE_URL}/family/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${familyToken}` },
    body: JSON.stringify({
      message: 'So proud of you Mom for learning WhatsApp! ❤️',
      emoji: '🌟'
    })
  });
  const cheerNoteData = await cheerNoteRes.json();
  assert.strictEqual(cheerNoteData.success, true);
  console.log('   ✅ Family Cheer Note OK:', `"${cheerNoteData.note.message}"`);

  // 21. Senior Sees Note
  console.log('21. Testing GET /family/notes/my (Senior view)...');
  const myNotesRes = await fetch(`${BASE_URL}/family/notes/my`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const myNotesData = await myNotesRes.json();
  assert.strictEqual(myNotesData.success, true);
  assert.ok(myNotesData.notes.length > 0);
  console.log('   ✅ Senior Notes Retrieval OK:', `Senior has ${myNotesData.notes.length} cheer notes.`);

  console.log('\n====================================================');
  console.log('🎉 ALL 21 ELDEREASE END-TO-END VERIFICATION TESTS PASSED!');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
