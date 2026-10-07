import assert from 'assert';
import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';
import { AiService } from '../src/services/aiService';

async function runTests() {
  console.log('🧪 Starting ElderEase Backend Integration Tests...\n');

  // TEST 1: Database Users Check
  const senior = await prisma.user.findFirst({
    where: { role: 'SENIOR' },
    include: { seniorProfile: true, preference: true },
  });
  assert(senior, 'Senior user should exist');
  assert(senior.seniorProfile?.inviteCode === 'AAI789', 'Invite code should match seed');
  console.log('✅ TEST 1 Passed: Senior profile retrieved successfully');

  // TEST 2: Password Verification
  const isMatch = await bcrypt.compare('aai123', senior.passwordHash);
  assert(isMatch, 'Senior password hash should match password');
  console.log('✅ TEST 2 Passed: Bcrypt authentication verified');

  // TEST 3: JWT Token Generation & Decoding
  const token = jwt.sign({ userId: senior.id }, config.jwtSecret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
  assert.strictEqual(decoded.userId, senior.id);
  console.log('✅ TEST 3 Passed: JWT verification succeeded');

  // TEST 4: Caregiver Connection Authorization
  const caregiver = await prisma.user.findFirst({
    where: { role: 'CAREGIVER' },
    include: { caregiverProfile: true },
  });
  assert(caregiver && caregiver.caregiverProfile, 'Caregiver should exist');

  const connection = await prisma.caregiverConnection.findUnique({
    where: {
      seniorId_caregiverId: {
        seniorId: senior.seniorProfile!.id,
        caregiverId: caregiver.caregiverProfile!.id,
      },
    },
  });
  assert(connection && connection.status === 'APPROVED', 'Connection must be APPROVED');
  console.log('✅ TEST 4 Passed: Caregiver-Senior relationship validated');

  // TEST 5: AI Multilingual Understanding (Marathi, Hindi, English)
  const chatMr = await AiService.chat('मला व्हॉट्सॲपवर फोटो पाठवायचा आहे', [], {
    language: 'mr',
    seniorId: senior.seniorProfile!.id,
  });
  assert(chatMr.reply.includes('व्हॉट्सॲप') || chatMr.reply.includes('पायरी'), 'Should provide patient Marathi guidance');
  console.log('✅ TEST 5 Passed: AI Marathi conversational guidance verified');

  // TEST 6: AI Doctor Appointment Awareness
  const chatApt = await AiService.chat('माझी पुढची डॉक्टरांची भेट कधी आहे?', [], {
    language: 'mr',
    seniorId: senior.seniorProfile!.id,
  });
  assert(chatApt.reply.includes('Kulkarni') || chatApt.reply.includes('भेट'), 'Should reference scheduled appointment');
  console.log('✅ TEST 6 Passed: AI context awareness of medical appointments verified');

  // TEST 7: Scam & Suspicious Message Safety Check
  const scamCheck = AiService.analyzeMessageSafety(
    'Dear customer, your electricity will be disconnected tonight. Share OTP immediately.',
    'mr'
  );
  assert(scamCheck.isSuspicious === true, 'Scam trigger should detect OTP threats');
  assert(scamCheck.warningPoints.length > 0, 'Warning points should be generated');
  console.log('✅ TEST 7 Passed: Scam detector successfully flagged fraudulent message');

  // TEST 8: Webpage Explanation for Browser Extension
  const pageExplanation = AiService.explainWebPage(
    'Railway Ticket Reservation',
    'https://irctc.co.in',
    'Enter passenger Aadhaar number and OTP to proceed with booking',
    'mr'
  );
  assert(pageExplanation.summary.length > 0, 'Page summary should be created');
  assert(pageExplanation.stepToTake.length > 0, 'Step 1 should be suggested');
  console.log('✅ TEST 8 Passed: Browser extension page explainer verified');

  // TEST 9: Medicine Confirmation State Flow
  const med = await prisma.medicine.findFirst({
    where: { seniorId: senior.seniorProfile!.id },
    include: { schedules: true },
  });
  assert(med && med.schedules.length > 0, 'Medicine and schedules must exist');

  const conf = await prisma.medicineConfirmation.create({
    data: {
      scheduleId: med.schedules[0].id,
      scheduledFor: new Date(),
      status: 'TAKEN',
      confirmedAt: new Date(),
      notes: 'Test suite confirmation',
    },
  });
  assert(conf.status === 'TAKEN', 'Status must transition to TAKEN');
  console.log('✅ TEST 9 Passed: Medicine confirmation flow verified');

  // TEST 10: Daily Check-In Flow
  const checkin = await prisma.checkIn.upsert({
    where: {
      seniorId_date: {
        seniorId: senior.seniorProfile!.id,
        date: '2026-10-07',
      },
    },
    update: { status: 'OKAY', respondedAt: new Date() },
    create: {
      seniorId: senior.seniorProfile!.id,
      date: '2026-10-07',
      status: 'OKAY',
      respondedAt: new Date(),
    },
  });
  assert(checkin.status === 'OKAY', 'Check-in must be OKAY');
  console.log('✅ TEST 10 Passed: Daily check-in submission verified');

  console.log('\n🎉 ALL 10 INTEGRATION TESTS PASSED CLEANLY!\n');
}

runTests()
  .catch((e) => {
    console.error('❌ Test execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
