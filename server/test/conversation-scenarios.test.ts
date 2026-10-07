import assert from 'assert';
import { prisma } from '../src/prisma';
import { AiService } from '../src/services/aiService';

async function runConversationTests() {
  console.log('🗣️ Starting Section 47 Live Conversational Acceptance Tests...\n');

  // Ensure tasks are available in database
  const whatsappTask = await prisma.task.findFirst({
    where: { slug: 'whatsapp-photo' },
    include: { steps: { orderBy: { stepNumber: 'asc' } } },
  });
  assert(whatsappTask, 'whatsapp-photo task must exist in the database');
  console.log('✅ Base Task Loaded: Send WhatsApp Photo with', whatsappTask.steps.length, 'steps');

  // TEST A: User says "Mujhe WhatsApp pe photo bhejni hai."
  console.log('\n--- TEST A: Task Initiation ---');
  const resA = await AiService.chat('Mujhe WhatsApp pe photo bhejni hai.', [], {
    language: 'hi',
    voiceEnabled: true,
  });
  assert.strictEqual(resA.intent, 'TASK_REQUEST', 'Intent must be TASK_REQUEST');
  assert.strictEqual(resA.action, 'START_TASK', 'Action must be START_TASK');
  assert.strictEqual(resA.taskSlug, 'whatsapp-photo', 'Task slug must be whatsapp-photo');
  assert(resA.message.includes('साथ') || resA.message.includes('धीरे-धीरे'), 'Must offer patient companionship');
  assert(resA.visualTarget !== undefined, 'Visual target must be provided at task start');
  assert.strictEqual(resA.visualTarget?.icon, 'whatsapp');
  console.log('✅ Test A Passed: User initiated task, AI responded with companionship and VisualTarget');

  // TEST B: In active task, user asks "WhatsApp kahan hai?"
  console.log('\n--- TEST B: Contextual Location Query ---');
  const resB = await AiService.chat('WhatsApp kahan hai?', [], {
    language: 'hi',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 0,
    voiceEnabled: true,
  });
  assert.strictEqual(resB.intent, 'LOCATION_QUERY', 'Intent must be LOCATION_QUERY');
  assert(
    resB.message.includes('होम स्क्रीन') || resB.message.includes('निशान'),
    'AI must explain where WhatsApp is located without asking "What are you referring to?"'
  );
  assert(resB.visualTarget !== undefined, 'VisualTarget must accompany location guidance');
  console.log('✅ Test B Passed: AI recognized contextual location question for active step');

  // TEST C: User says "Mujhe samajh nahi aaya."
  console.log('\n--- TEST C: Progressive Non-Repetitive Confusion Handling ---');
  const resC_lvl1 = await AiService.chat('Mujhe samajh nahi aaya.', [], {
    language: 'hi',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 0,
    userConfusionLevel: 1,
    voiceEnabled: true,
  });
  assert.strictEqual(resC_lvl1.intent, 'CONFUSION');
  assert.strictEqual(resC_lvl1.explanationLevel, 2, 'Should advance to Level 2 explanation');
  assert(
    resC_lvl1.message.includes('आसान तरीके') || resC_lvl1.message.includes('व्हाट्सएप'),
    'Should explain step at Level 2'
  );

  const resC_lvl2 = await AiService.chat('Mujhe samajh nahi aaya.', [], {
    language: 'hi',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 0,
    userConfusionLevel: 2,
    voiceEnabled: true,
  });
  assert.strictEqual(resC_lvl2.explanationLevel, 3, 'Should advance to Level 3 explanation');
  assert(
    resC_lvl2.message !== resC_lvl1.message,
    'Level 3 explanation must differ from Level 2 (no sentence repetition)'
  );
  console.log('✅ Test C Passed: Progressive explanation without sentence repetition verified');

  // TEST D: User says "WhatsApp ka icon kaisa dikhta hai?"
  console.log('\n--- TEST D: Visual Target Appearance Query ---');
  const resD = await AiService.chat('WhatsApp ka icon kaisa dikhta hai?', [], {
    language: 'hi',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 0,
    voiceEnabled: true,
  });
  assert.strictEqual(resD.intent, 'APPEARANCE_QUERY');
  assert(resD.visualTarget !== undefined, 'Visual target must be returned');
  assert.strictEqual(resD.visualTarget?.icon, 'whatsapp');
  assert.strictEqual(resD.visualTarget?.badgeColor, '#25D366');
  assert(resD.message.includes('हरा') || resD.message.includes('सफेद फोन'), 'Must describe icon appearance');
  console.log('✅ Test D Passed: Appearance query returned description and VisualTarget badge');

  // TEST E: Interruption & Alternative Query ("Mujhe WhatsApp nahi mil raha")
  console.log('\n--- TEST E: Alternative Query & Recovery ---');
  const resE = await AiService.chat('Mujhe WhatsApp nahi mil raha.', [], {
    language: 'hi',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 0,
    voiceEnabled: true,
  });
  assert.strictEqual(resE.intent, 'LOCATION_QUERY');
  assert(resE.message.includes('कोई बात नहीं') || resE.message.includes('ढूंढते हैं'), 'Must reassure calmly');
  console.log('✅ Test E Passed: Reassuring recovery when user cannot locate icon');

  // TEST F: Voice OFF behavior
  console.log('\n--- TEST F: Voice Disabled Authority ---');
  const resF = await AiService.chat('WhatsApp kholiye', [], {
    language: 'en',
    voiceEnabled: false,
  });
  assert.strictEqual(resF.speak, false, 'speak MUST be false when voiceEnabled is false');
  console.log('✅ Test F Passed: Voice OFF strictly respected (speak=false)');

  // TEST G: Voice ON behavior
  console.log('\n--- TEST G: Voice Enabled Authority ---');
  const resG = await AiService.chat('WhatsApp kholiye', [], {
    language: 'en',
    voiceEnabled: true,
  });
  assert.strictEqual(resG.speak, true, 'speak MUST be true when voiceEnabled is true');
  console.log('✅ Test G Passed: Voice ON respected (speak=true)');

  // TEST H: User says "Repeat that."
  console.log('\n--- TEST H: Repeat Request ---');
  const resH = await AiService.chat('Repeat that.', [], {
    language: 'en',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 0,
    voiceEnabled: true,
  });
  assert.strictEqual(resH.intent, 'REPEAT_REQUEST');
  assert.strictEqual(resH.action, 'REPEAT');
  assert(
    resH.message.toLowerCase().includes('open whatsapp') || resH.message.includes('again'),
    'Must repeat current step instruction'
  );
  console.log('✅ Test H Passed: Repeat command repeats current step accurately');

  // TEST I: User says "Go back."
  console.log('\n--- TEST I: Go Back Command ---');
  const resI = await AiService.chat('Go back.', [], {
    language: 'en',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 1,
    voiceEnabled: true,
  });
  assert.strictEqual(resI.intent, 'PREV_STEP');
  assert.strictEqual(resI.action, 'PREV_STEP');
  assert(resI.message.includes('previous step'), 'Must confirm step rewind');
  console.log('✅ Test I Passed: "Go back" navigates to previous step gracefully');

  // TEST J: User says "I need help."
  console.log('\n--- TEST J: Contextual Step Help ---');
  const resJ = await AiService.chat('I need help.', [], {
    language: 'en',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 0,
    voiceEnabled: true,
  });
  assert.strictEqual(resJ.intent, 'HELP_REQUEST');
  assert.strictEqual(resJ.action, 'EXPLAIN');
  assert(
    resJ.message.toLowerCase().includes('help') || resJ.message.toLowerCase().includes('whatsapp'),
    'Must provide contextual help for active step'
  );
  console.log('✅ Test J Passed: Contextual step help returned');

  // MULTILINGUAL VERIFICATION (Marathi, Hindi, English)
  console.log('\n--- MULTILINGUAL VERIFICATION ---');
  const resMr = await AiService.chat('व्हॉट्सॲप कुठे आहे?', [], {
    language: 'mr',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 0,
    voiceEnabled: true,
  });
  assert(resMr.message.includes('स्क्रीनवर') || resMr.message.includes('हिरव्या'), 'Marathi location guidance');

  const resWhy = await AiService.chat('Kyun kholna hai?', [], {
    language: 'hi',
    currentTaskSlug: 'whatsapp-photo',
    currentStepIndex: 0,
    voiceEnabled: true,
  });
  assert.strictEqual(resWhy.intent, 'WHY_QUERY');
  assert(resWhy.message.includes('फोटो भेजने'), 'Must explain why WhatsApp must be opened');
  console.log('✅ Multilingual Marathi & Hindi queries verified');

  console.log('\n🎉 ALL SECTION 47 CONVERSATIONAL TEST SCENARIOS PASSED 100% CLEANLY!\n');
}

runConversationTests()
  .catch((err) => {
    console.error('❌ Conversation test failure:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
