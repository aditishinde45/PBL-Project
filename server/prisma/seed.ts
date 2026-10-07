import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding simplified ElderEase MVP database...');

  // Clean existing tables
  await prisma.feedback.deleteMany();
  await prisma.guidedSession.deleteMany();
  await prisma.taskStep.deleteMany();
  await prisma.task.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.emergencyEvent.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.medicineConfirmation.deleteMany();
  await prisma.medicineSchedule.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.familyTask.deleteMany();
  await prisma.caregiverConnection.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.seniorProfile.deleteMany();
  await prisma.caregiverProfile.deleteMany();
  await prisma.conversationMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.browserSession.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // Create Users with hashed passwords
  const passwordHashSenior = await bcrypt.hash('aai123', 10);
  const passwordHashCaregiver = await bcrypt.hash('daughter123', 10);

  // 1. Senior User: Demo Aai
  const seniorUser = await prisma.user.create({
    data: {
      name: 'Demo Aai (सुलोचना ताई)',
      email: 'aai@elderease.com',
      phone: '+919876543210',
      passwordHash: passwordHashSenior,
      role: 'SENIOR',
      preference: {
        create: {
          language: 'mr',
          fontSize: 'LARGE',
          voiceSpeed: 'SLOW',
          theme: 'light',
          highContrast: false,
          ttsEnabled: true,
        },
      },
      seniorProfile: {
        create: {
          emergencyContactName: 'Priya (Daughter)',
          emergencyContactPhone: '+919876543211',
          inviteCode: 'AAI789',
          birthYear: 1952,
          medicalNotes: 'Senior citizen user',
        },
      },
    },
    include: {
      seniorProfile: true,
    },
  });

  // 2. Caregiver User: Demo Daughter
  const caregiverUser = await prisma.user.create({
    data: {
      name: 'Demo Daughter (प्रिया)',
      email: 'daughter@elderease.com',
      phone: '+919876543211',
      passwordHash: passwordHashCaregiver,
      role: 'CAREGIVER',
      preference: {
        create: {
          language: 'en',
          fontSize: 'NORMAL',
          voiceSpeed: 'NORMAL',
          theme: 'light',
          highContrast: false,
          ttsEnabled: false,
        },
      },
      caregiverProfile: {
        create: {
          relationshipToSenior: 'Daughter',
        },
      },
    },
    include: {
      caregiverProfile: true,
    },
  });

  // 3. Connect Senior and Caregiver
  await prisma.caregiverConnection.create({
    data: {
      seniorId: seniorUser.seniorProfile!.id,
      caregiverId: caregiverUser.caregiverProfile!.id,
      status: 'APPROVED',
      permissions: 'Full',
    },
  });

  // 4. THE 3 FOCUSED MVP GUIDED TASKS
  // Task 1: Send a WhatsApp photo
  await prisma.task.create({
    data: {
      slug: 'whatsapp-photo',
      title: 'व्हॉट्सॲपवर फोटो कसा पाठवावा',
      titleEn: 'Send a WhatsApp Photo',
      titleHi: 'व्हाट्सएप पर फोटो भेजें',
      titleMr: 'व्हॉट्सॲपवर फोटो पाठवा',
      category: 'Communication',
      description: 'कुटुंबीयांना किंवा मित्रांना व्हॉट्सॲपवर सहज फोटो पाठवण्याची सोपी पायरी.',
      descEn: 'A simple step-by-step guide to sending a photo to family or friends.',
      descHi: 'परिवार या दोस्तों को व्हाट्सएप पर आसानी से फोटो भेजने का तरीका।',
      descMr: 'कुटुंबीयांना किंवा मित्रांना व्हॉट्सॲपवर सहज फोटो पाठवण्याची सोपी पायरी.',
      difficulty: 'EASY',
      icon: 'camera',
      isPublished: true,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'व्हॉट्सॲप उघडा',
            titleEn: 'Open WhatsApp',
            titleHi: 'व्हाट्सएप खोलें',
            titleMr: 'व्हॉट्सॲप उघडा',
            instructionEn: 'Open WhatsApp on your phone.',
            instructionHi: 'अपने फोन पर व्हाट्सएप खोलिए।',
            instructionMr: 'तुमच्या फोनवरील व्हॉट्सॲप ॲप उघडा.',
            helpEn: 'Look for the green icon with a white phone on your home screen. Tap it once gently.',
            helpHi: 'फोन स्क्रीन पर सफेद फोन वाले हरे रंग के निशान को ढूंढें और एक बार हल्के से दबाएं।',
            helpMr: 'फोनच्या स्क्रीनवर पांढरा फोन असलेले हिरवे चिन्ह शोधा आणि त्यावर एकदा हळूच बोट ठेवा.',
            expectedAction: 'OPEN_APP',
          },
          {
            stepNumber: 2,
            title: 'व्यक्तीचे नाव निवडा',
            titleEn: 'Select the Person',
            titleHi: 'व्यक्ति का नाम चुनें',
            titleMr: 'व्यक्तीचे नाव निवडा',
            instructionEn: 'Select the person you want to send the photo to.',
            instructionHi: 'जिस व्यक्ति को फोटो भेजनी है, उनके नाम पर टैप करें।',
            instructionMr: 'ज्या व्यक्तीला फोटो पाठवायचा आहे त्यांच्या नावावर दाबा.',
            helpEn: 'Look down the list for your family member or friend’s name. Tap their name once.',
            helpHi: 'सूची में अपने परिवार के सदस्य या मित्र का नाम देखें। उनके नाम पर एक बार टैप करें।',
            helpMr: 'यादीमध्ये तुमच्या कुटुंबियांचे किंवा मित्राचे नाव शोधा. त्यांच्या नावावर एकदा बोट ठेवा.',
            expectedAction: 'SELECT_CONTACT',
          },
          {
            stepNumber: 3,
            title: 'कॅमेरा चिन्ह दाबा',
            titleEn: 'Tap the Camera Icon',
            titleHi: 'कैमरा आइकन दबाएं',
            titleMr: 'कॅमेरा चिन्ह दाबा',
            instructionEn: 'Look at the bottom near the message box. Tap the Camera icon.',
            instructionHi: 'नीचे मैसेज लिखने की जगह के पास देखें। कैमरा आइकन को दबाएं।',
            instructionMr: 'खाली मेसेज लिहिण्याच्या जागेजवळ लहान कॅमेरा चिन्हावर दाबा.',
            helpEn: 'At the bottom right where you type messages, look for a small camera shape. Tap it once.',
            helpHi: 'नीचे जहाँ मैसेज लिखते हैं, वहाँ एक छोटा कैमरा बना होगा। उस पर टैप करें।',
            helpMr: 'खाली जिथे मेसेज लिहितात, तिथे एक लहान कॅमेऱ्याचे चित्र दिसेल. त्यावर दाबा.',
            expectedAction: 'TAP_CAMERA',
          },
          {
            stepNumber: 4,
            title: 'फोटो निवडा आणि पाठवा',
            titleEn: 'Choose Photo & Send',
            titleHi: 'फोटो चुनें और भेजें',
            titleMr: 'फोटो निवडा आणि पाठवा',
            instructionEn: 'Select your photo, then tap the green Send arrow.',
            instructionHi: 'फोटो चुनें, फिर हरे सेंड बटन को दबाएं।',
            instructionMr: 'फोटो निवडा आणि हिरवे बाणाचे सेंड बटण दाबा.',
            helpEn: 'Tap the photo you like. When it opens, look for the round green button with a white arrow at the bottom right. Tap that arrow to send.',
            helpHi: 'जो फोटो भेजना है उसे छुएं। फिर नीचे दाईं ओर सफेद तीर वाले हरे गोल बटन को दबाएं।',
            helpMr: 'जो फोटो पाठवायचा आहे त्यावर दाबा. नंतर खाली उजवीकडे पांढरा बाण असलेले हिरवे गोल बटण दाबा.',
            expectedAction: 'SEND_PHOTO',
          },
        ],
      },
    },
  });

  // Task 2: Make a video call
  await prisma.task.create({
    data: {
      slug: 'video-call',
      title: 'व्हिडिओ कॉल कसा करावा',
      titleEn: 'Make a Video Call',
      titleHi: 'वीडियो कॉल कैसे करें',
      titleMr: 'व्हिडिओ कॉल कसा करावा',
      category: 'Communication',
      description: 'मुलांशी किंवा नातवंडांशी समोरासमोर पाहून बोलण्याची सोपी पद्धत.',
      descEn: 'See and talk face-to-face with your family or friends.',
      descHi: 'परिवार के सदस्यों को सामने देखकर बात करने का आसान तरीका।',
      descMr: 'मुलांशी किंवा नातवंडांशी समोरासमोर पाहून बोलण्याची सोपी पद्धत.',
      difficulty: 'EASY',
      icon: 'video',
      isPublished: true,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'व्यक्तीचे चॅट उघडा',
            titleEn: 'Open the Chat',
            titleHi: 'व्यक्ति का चैट खोलें',
            titleMr: 'व्यक्तीचे चॅट उघडा',
            instructionEn: 'Open WhatsApp and tap the person you want to video call.',
            instructionHi: 'व्हाट्सएप खोलें और जिस व्यक्ति से बात करनी है उनके नाम पर टैप करें।',
            instructionMr: 'व्हॉट्सॲप उघडून ज्यांच्याशी व्हिडिओ कॉलवर बोलायचे आहे त्यांचे नाव निवडा.',
            helpEn: 'First open WhatsApp. Tap the name of your son, daughter, or grandchild from the list.',
            helpHi: 'पहले व्हाट्सएप खोलें। सूची में से जिससे बात करनी है उनके नाम को छुएं।',
            helpMr: 'पहिले व्हॉट्सॲप उघडा. यादीमधून ज्यांच्याशी बोलायचे आहे त्यांच्या नावावर दाबा.',
            expectedAction: 'OPEN_CHAT',
          },
          {
            stepNumber: 2,
            title: 'व्हिडिओ कॅमेरा आयकॉन दाबा',
            titleEn: 'Tap the Video Camera Icon',
            titleHi: 'वीडियो कैमरा आइकन दबाएं',
            titleMr: 'व्हिडिओ कॅमेरा आयकॉन दाबा',
            instructionEn: 'Look at the top right corner. Tap the Video Camera icon.',
            instructionHi: 'ऊपर दाईं ओर देखें। छोटे वीडियो कैमरा आइकन को दबाएं।',
            instructionMr: 'स्क्रीनच्या वरच्या उजव्या कोपऱ्यात लहान व्हिडिओ कॅमेरा चिन्हावर दाबा.',
            helpEn: 'At the very top of your screen, next to the person’s name, there is a small icon that looks like a video recorder. Tap it.',
            helpHi: 'स्क्रीन के सबसे ऊपर दाईं ओर एक छोटा वीडियो रिकॉर्डर जैसा निशान होगा। उस पर टैप करें।',
            helpMr: 'स्क्रीनच्या वरच्या उजव्या बाजूला एक लहान व्हिडिओ कॅमेऱ्यासारखे चिन्ह दिसेल. त्यावर बोट ठेवा.',
            expectedAction: 'TAP_VIDEO_ICON',
          },
          {
            stepNumber: 3,
            title: 'चेहऱ्यासमोर फोन पकडा आणि बोला',
            titleEn: 'Hold Phone in Front & Talk',
            titleHi: 'फोन चेहरे के सामने रखें और बात करें',
            titleMr: 'चेहऱ्यासमोर फोन पकडा आणि बोला',
            instructionEn: 'Hold the phone steadily in front of your face. When they answer, smile and talk!',
            instructionHi: 'फोन अपने चेहरे के सामने सीधा रखें। जब वे कॉल उठाएं, बात करें!',
            instructionMr: 'फोन चेहऱ्यासमोर स्थिर पकडा. त्यांनी कॉल उचलल्यावर आनंदात बोला!',
            helpEn: 'Keep the phone at eye level so they can see your warm smile. If you cannot hear them clearly, increase the volume on the side of your phone.',
            helpHi: 'फोन को आँखों के सामने रखें ताकि वे आपको देख सकें। आवाज कम हो तो फोन के साइड से वॉल्यूम बढ़ाएं।',
            helpMr: 'फोन डोळ्यांच्या समोर पकडा जेणेकरून त्यांना तुमचा चेहरा दिसेल. आवाज कमी असल्यास फोनच्या बाजूचे बटण दाबून आवाज वाढवा.',
            expectedAction: 'TALK_ON_CALL',
          },
        ],
      },
    },
  });

  // Task 3: Find and watch a YouTube video
  await prisma.task.create({
    data: {
      slug: 'youtube-video',
      title: 'यूट्यूबवर भजन किंवा गाणी कशी पाहावीत',
      titleEn: 'Watch a YouTube Video',
      titleHi: 'यूट्यूब पर वीडियो देखें',
      titleMr: 'यूट्यूबवर व्हिडिओ पहा',
      category: 'Entertainment',
      description: 'यूट्यूबवर आवडीचे भजन, गाणी किंवा बातम्या शोधून पाहण्याची पद्धत.',
      descEn: 'Easily find and enjoy songs, prayers, or news on YouTube.',
      descHi: 'यूट्यूब पर अपने पसंदीदा भजन, गाने या समाचार ढूंढकर देखें।',
      descMr: 'यूट्यूबवर आवडीचे भजन, गाणी किंवा बातम्या शोधून पाहण्याची पद्धत.',
      difficulty: 'EASY',
      icon: 'youtube',
      isPublished: true,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'यूट्यूब ॲप उघडा',
            titleEn: 'Open YouTube',
            titleHi: 'यूट्यूब खोलें',
            titleMr: 'यूट्यूब उघडा',
            instructionEn: 'Tap the red YouTube icon on your phone.',
            instructionHi: 'अपने फोन पर लाल रंग के यूट्यूब ऐप को खोलिए।',
            instructionMr: 'तुमच्या फोनवरील लाल रंगाचे यूट्यूब ॲप उघडा.',
            helpEn: 'Look on your screen for a bright red square with a white triangle pointing right. Tap it once.',
            helpHi: 'स्क्रीन पर सफेद त्रिकोण वाला लाल रंग का चौकोर निशान ढूंढें और एक बार दबाएं।',
            helpMr: 'स्क्रीनवर पांढरा त्रिकोण असलेले लाल रंगाचे चिन्ह शोधा आणि त्यावर एकदा दाबा.',
            expectedAction: 'OPEN_YOUTUBE',
          },
          {
            stepNumber: 2,
            title: 'शोध (Search) चिन्ह दाबा',
            titleEn: 'Tap the Search Glass',
            titleHi: 'सर्च आइकन दबाएं',
            titleMr: 'सर्च चिन्ह दाबा',
            instructionEn: 'Look at the top of the screen. Tap the Search (magnifying glass) icon.',
            instructionHi: 'स्क्रीन के ऊपर देखें। सर्च (लेंस) के निशान पर टैप करें।',
            instructionMr: 'स्क्रीनच्या वरच्या बाजूला असलेल्या शोध (भिंग) चिन्हावर दाबा.',
            helpEn: 'At the top right corner, there is an icon that looks like a round magnifying glass. Tap it to start searching.',
            helpHi: 'ऊपर दाईं ओर एक छोटा गोल लेंस जैसा निशान होगा। उस पर टैप करें।',
            helpMr: 'वरच्या उजव्या कोपऱ्यात एका लहान भिंगासारखे (ग्लास) चिन्ह असेल. त्यावर दाबा.',
            expectedAction: 'TAP_SEARCH',
          },
          {
            stepNumber: 3,
            title: 'नाव सांगा किंवा लिहा',
            titleEn: 'Say or Type the Name',
            titleHi: 'नाम बोलें या लिखें',
            titleMr: 'नाव सांगा किंवा लिहा',
            instructionEn: 'Tap the microphone icon to speak, or type the name of the song or bhajan.',
            instructionHi: 'बोलने के लिए माइक आइकन दबाएं, या भजन/गाने का नाम लिखें।',
            instructionMr: 'बोलण्यासाठी माइक चिन्हावर दाबा, किंवा भजन/गाण्याचे नाव लिहा.',
            helpEn: 'You do not have to type! Tap the small microphone icon inside YouTube and speak clearly: for example, "Shiv Bhajan" or "Old Marathi Songs".',
            helpHi: 'टाइप करने की जरूरत नहीं है! माइक आइकन दबाकर बोलें: जैसे "शिव भजन" या "पुराने गाने"।',
            helpMr: 'टाईप करण्याची गरज नाही! लहान माइक चिन्हावर दाबून बोला: उदा. "शिव भजन" किंवा "जुनी मराठी गाणी".',
            expectedAction: 'ENTER_QUERY',
          },
          {
            stepNumber: 4,
            title: 'व्हिडिओवर दाबा आणि आनंद घ्या',
            titleEn: 'Tap Video & Enjoy',
            titleHi: 'वीडियो पर टैप करें और देखें',
            titleMr: 'व्हिडिओवर दाबा आणि पहा',
            instructionEn: 'Tap the video you like from the results to start playing it.',
            instructionHi: 'जो वीडियो देखना चाहते हैं, उस पर टैप करें।',
            instructionMr: 'आवडलेल्या व्हिडिओवर बोट ठेवा, व्हिडिओ सुरू होईल.',
            helpEn: 'A list of videos will appear. Gently tap anywhere on the picture of the video you want. It will start playing smoothly.',
            helpHi: 'वीडियो की सूची दिखाई देगी। मनपसंद वीडियो की तस्वीर पर हल्के से टैप करें। वीडियो शुरू हो जाएगा।',
            helpMr: 'व्हिडिओंची यादी दिसेल. तुम्हाला आवडलेल्या चित्रावर हळूच दाबा. व्हिडिओ सुरू होईल.',
            expectedAction: 'PLAY_VIDEO',
          },
        ],
      },
    },
  });

  // 5. Seed one initial sample help request for Demo Aai so caregiver can view it
  await prisma.helpRequest.create({
    data: {
      seniorId: seniorUser.seniorProfile!.id,
      type: 'FAMILY_CALL',
      status: 'OPEN',
      message: 'Aaji needs help using WhatsApp.',
    },
  });

  // 6. Seed Doctor Appointment with Dr. Kulkarni for Demo Aai
  await prisma.appointment.create({
    data: {
      seniorId: seniorUser.seniorProfile!.id,
      doctorName: 'Dr. Kulkarni',
      specialty: 'General Physician',
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: 'Sahyadri Hospital, Pune',
      notes: 'Monthly blood pressure checkup',
      status: 'SCHEDULED',
    },
  });

  // 7. Seed Medicine with Daily Schedule for Demo Aai
  await prisma.medicine.create({
    data: {
      seniorId: seniorUser.seniorProfile!.id,
      name: 'Telmisartan 40mg',
      dosage: '1 tablet',
      instructions: 'Take in the morning after breakfast',
      schedules: {
        create: [
          {
            time: '09:00',
            frequency: 'DAILY',
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully with tasks, appointments, and medicines!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
