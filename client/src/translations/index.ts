export type Language = 'mr' | 'hi' | 'en';

export const translations = {
  mr: {
    appTitle: 'एल्डरईज (ElderEase)',
    tagline: 'सुरक्षित आणि स्वतंत्र डिजिटल जीवनासाठी तुमचा AI साथीदार',
    greetingMorning: 'शुभ सकाळ, आई 👋',
    greetingAfternoon: 'शुभ दुपार, आई 👋',
    greetingEvening: 'शुभ संध्याकाळ, आई 👋',
    howCanIHelp: 'आज मी तुम्हाला कशी मदत करू?',
    
    // Primary Actions
    talkToAi: '🎤 एल्डरईजशी बोला',
    myMedicines: '💊 माझी औषधे',
    myAppointments: '📅 माझी डॉक्टरांची भेट',
    iAmOkay: '❤️ मी ठीक आहे',
    iNeedHelp: '🚨 मला मदत हवी आहे',
    callFamily: '👨‍👩‍👧 कुटुंबाला फोन करा',
    digitalTasks: '📚 सोप्या गोष्टी शिका (मदत)',
    scamCheck: '🛡️ हा मेसेज सुरक्षित आहे का?',
    safePayment: '💳 सुरक्षित पेमेंट सराव',
    preferences: '⚙️ आकार आणि भाषा बदला',
    privacy: '🔒 गोपनीयता आणि संमती',
    
    // Status Labels
    checkInDone: 'आजची सकाळची नोंद पूर्ण झाली ❤️',
    checkInPending: 'आजची सकाळची नोंद बाकी आहे',
    noMedsPending: 'सर्व औषधे वेळेवर घेतली आहेत 👍',
    medsPendingCount: 'आजची औषधे बाकी आहेत',
    
    // Buttons
    taken: 'औषध घेतले ✅',
    remindLater: 'नंतर आठवण करा ⏰',
    close: 'बंद करा',
    goBack: 'मागे जा',
    continue: 'पुढे जा',
    repeat: 'पुन्हा सांगा 🔁',
    listen: 'मोठ्याने ऐका 🔊',
    speaking: 'एल्डरईज बोलत आहे...',
    listening: 'मी ऐकत आहे, शांतपणे बोला...',
    typeHere: 'किंवा इथे लिहा...',
    send: 'विचारा',
    
    // Emergency
    emergencyConfirmTitle: 'तुम्हाला तातडीची मदत हवी आहे का?',
    emergencyConfirmDesc: 'हे बटण दाबल्यास तुमच्या मुलीला (प्रिया) तात्काळ आणीबाणीचा संदेश पाठवला जाईल.',
    emergencyYes: 'होय, तात्काळ मदत पाठवा 🚨',
    emergencyCancel: 'नाही, चुकीने दाबले गेले (रद्द करा)',
    emergencySent: 'तुमच्या कुटुंबीयांना तात्काळ संदेश पाठवला आहे!',
    
    // Voice Speed
    voiceSpeedSlow: 'हळू बोला',
    voiceSpeedNormal: 'सामान्य वेग',
  },
  hi: {
    appTitle: 'एल्डरईज (ElderEase)',
    tagline: 'सुरक्षित और स्वतंत्र डिजिटल जीवन के लिए आपका एआई साथी',
    greetingMorning: 'शुभ प्रभात, माँ 👋',
    greetingAfternoon: 'नमस्ते, माँ 👋',
    greetingEvening: 'शुभ संध्या, माँ 👋',
    howCanIHelp: 'आज मैं आपकी क्या मदद करूँ?',
    
    // Primary Actions
    talkToAi: '🎤 एल्डरईज से बात करें',
    myMedicines: '💊 मेरी दवाइयां',
    myAppointments: '📅 डॉक्टर से मुलाकात',
    iAmOkay: '❤️ मैं ठीक हूँ',
    iNeedHelp: '🚨 मुझे मदद चाहिए',
    callFamily: '👨‍👩‍👧 परिवार को कॉल करें',
    digitalTasks: '📚 आसान डिजिटल काम सीखें',
    scamCheck: '🛡️ क्या यह मैसेज सुरक्षित है?',
    safePayment: '💳 सुरक्षित भुगतान अभ्यास',
    preferences: '⚙️ अक्षर और भाषा बदलें',
    privacy: '🔒 गोपनीयता और सहमति',
    
    // Status Labels
    checkInDone: 'आज की हाजिरी पूरी हुई ❤️',
    checkInPending: 'आज की सुबह की हाजिरी बाकी है',
    noMedsPending: 'सभी दवाइयां समय पर ले ली गई हैं 👍',
    medsPendingCount: 'दवाइयां बाकी हैं',
    
    // Buttons
    taken: 'दवा ले ली ✅',
    remindLater: 'बाद में याद दिलाएं ⏰',
    close: 'बंद करें',
    goBack: 'वापस जाएं',
    continue: 'आगे बढ़ें',
    repeat: 'दोहराएं 🔁',
    listen: 'सुनें 🔊',
    speaking: 'एल्डरईज बोल रहा है...',
    listening: 'मैं सुन रहा हूँ, आराम से बोलिए...',
    typeHere: 'या यहाँ लिखें...',
    send: 'पूछें',
    
    // Emergency
    emergencyConfirmTitle: 'क्या आपको तुरंत मदद चाहिए?',
    emergencyConfirmDesc: 'इस बटन से आपके परिवार के सदस्य को तुरंत संदेश भेजा जाएगा।',
    emergencyYes: 'हाँ, तुरंत मदद भेजें 🚨',
    emergencyCancel: 'नहीं, गलती से दब गया (रद्द करें)',
    emergencySent: 'आपके परिवार को तुरंत संदेश भेज दिया गया है!',
    
    // Voice Speed
    voiceSpeedSlow: 'धीमी आवाज',
    voiceSpeedNormal: 'सामान्य गति',
  },
  en: {
    appTitle: 'ElderEase',
    tagline: 'An AI Companion for Safe and Independent Digital Living',
    greetingMorning: 'Good morning, Aai 👋',
    greetingAfternoon: 'Good afternoon, Aai 👋',
    greetingEvening: 'Good evening, Aai 👋',
    howCanIHelp: 'How can I help you today?',
    
    // Primary Actions
    talkToAi: '🎤 Talk to ElderEase',
    myMedicines: '💊 My Medicines',
    myAppointments: '📅 My Appointments',
    iAmOkay: '❤️ I Am Okay',
    iNeedHelp: '🚨 I Need Help',
    callFamily: '👨‍👩‍👧 Call Family',
    digitalTasks: '📚 Guided Digital Help',
    scamCheck: '🛡️ Is This Message Safe?',
    safePayment: '💳 Safe Payment Practice',
    preferences: '⚙️ Settings & Text Size',
    privacy: '🔒 Privacy & Consent',
    
    // Status Labels
    checkInDone: 'Morning check-in completed ❤️',
    checkInPending: 'Morning check-in pending',
    noMedsPending: 'All medicines taken on time 👍',
    medsPendingCount: 'medicines waiting',
    
    // Buttons
    taken: 'Taken ✅',
    remindLater: 'Remind Me Later ⏰',
    close: 'Close',
    goBack: 'Go Back',
    continue: 'Continue',
    repeat: 'Repeat 🔁',
    listen: 'Listen 🔊',
    speaking: 'ElderEase is speaking...',
    listening: 'Listening patiently, speak freely...',
    typeHere: 'Or type here...',
    send: 'Send',
    
    // Emergency
    emergencyConfirmTitle: 'Do you need immediate help?',
    emergencyConfirmDesc: 'Pressing this will instantly send an urgent distress alert to your family caregiver.',
    emergencyYes: 'Yes, Send Emergency Alert 🚨',
    emergencyCancel: 'No, Cancel (Pressed by mistake)',
    emergencySent: 'Your family member has been alerted immediately!',
    
    // Voice Speed
    voiceSpeedSlow: 'Speak Slowly',
    voiceSpeedNormal: 'Normal Pace',
  },
};
