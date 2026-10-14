import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Lesson } from '../models/Lesson.js';
import { LearningProgress } from '../models/LearningProgress.js';
import { SafetyCheck } from '../models/SafetyCheck.js';
import { FamilyConnection } from '../models/FamilyConnection.js';
import { FamilyNote } from '../models/FamilyNote.js';
import { inMemoryStore } from '../services/inMemoryStore.js';
import { connectDB } from '../config/db.js';

export const predefinedLessons = [
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000001'),
    title: 'Sending Photos on WhatsApp',
    slug: 'whatsapp-send-photo',
    category: 'WhatsApp',
    difficulty: 'Absolute Beginner',
    icon: '📸',
    estimatedTime: '4 mins',
    description: 'Learn how to easily send pictures of family, flowers, or documents to your loved ones on WhatsApp.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Open WhatsApp',
        instruction: 'Look for the green WhatsApp icon on your phone screen and tap it once.',
        explanation: 'WhatsApp is the app with a green circle and a white telephone symbol inside it. Tapping it will open your conversations.',
        slowExplanation: 'Take your time. Gently swipe across your screen until you spot the green WhatsApp icon. When you see it, touch it once with your finger and let go.',
        expectedAction: 'Tap the green WhatsApp app icon on your home screen.',
        helpText: 'If you do not see it on the first screen, gently swipe left to check your other app pages.',
        visual: {
          screenName: 'Phone Home Screen',
          targetHighlight: { top: 40, left: 30, width: 40, height: 40, label: 'WhatsApp Icon' },
          screenPreview: {
            header: 'Home Screen',
            content: 'Green WhatsApp icon with white phone handset inside',
            footer: 'Bottom Dock'
          }
        },
        translations: {
          Hindi: {
            instruction: 'अपने फोन स्क्रीन पर हरा व्हाट्सएप (WhatsApp) आइकन ढूंढें और एक बार दबाएं।',
            explanation: 'व्हाट्सएप एक हरे रंग का ऐप है जिसके अंदर सफेद टेलीफोन का निशान बना होता है।',
            slowExplanation: 'आराम से स्क्रीन को देखें। हरा गोल निशान दिखाई दे तो उसपर अपनी उंगली से एक बार छुएं।',
            helpText: 'यदि पहली स्क्रीन पर नहीं दिख रहा है, तो स्क्रीन को बाएं तरफ सरकाएं।'
          },
          Marathi: {
            instruction: 'तुमच्या फोनच्या स्क्रीनवर हिरवे व्हॉट्सअॅप चिन्ह शोधा आणि एकदा दाबा.',
            explanation: 'व्हॉट्सअॅप हे हिरवे चिन्ह असते ज्यामध्ये पांढरा फोन असतो. त्यावर स्पर्श केल्यावर अॅप उघडेल.',
            slowExplanation: 'घाई करू नका. स्क्रीनवर हिरवे व्हॉट्सअॅपचे चिन्ह शोधा आणि अलगद बोट लावा.',
            helpText: 'पहिल्या स्क्रीनवर नसेल, तर स्क्रीन डावीकडे सरकवून बघा.'
          },
          Hinglish: {
            instruction: 'Apne phone screen par green WhatsApp icon dekhein aur ek baar tap kijiye.',
            explanation: 'WhatsApp green color ka app hai jisme white telephone ka symbol bana hota hai.',
            slowExplanation: 'Aaram se phone screen par green icon dhundiye. Mil jaye toh ek baar tap karein.',
            helpText: 'Agar pehle page par na mile toh screen ko left swipe karke doosra page dekhein.'
          }
        }
      },
      {
        stepNumber: 2,
        title: 'Choose the Person',
        instruction: 'Find the name of the person you want to send the photo to and tap on their name.',
        explanation: 'You will see a list of your recent chats. Tap the person\'s name or photo to open your chat with them.',
        slowExplanation: 'Scroll up or down very gently. Look at the names. When you see your daughter, son, or friend, tap their name once.',
        expectedAction: 'Tap on a contact name from the chat list.',
        helpText: 'You can also tap the green circle at the bottom right to search for a name in your contacts.',
        visual: {
          screenName: 'WhatsApp Chat List',
          targetHighlight: { top: 25, left: 10, width: 80, height: 18, label: 'Contact Name' },
          screenPreview: {
            header: 'WhatsApp - Chats',
            content: 'List of family members and friends with profile pictures',
            footer: 'Chats | Updates | Communities | Calls'
          }
        },
        translations: {
          Hindi: {
            instruction: 'जिस व्यक्ति को फोटो भेजनी है, उनका नाम ढूंढें और उनके नाम पर टैप करें।',
            explanation: 'स्क्रीन पर आपके सभी संपर्कों की सूची दिखेगी। अपने परिवारजन या मित्र के नाम पर उंगली रखें।',
            slowExplanation: 'धीरे-धीरे स्क्रीन को ऊपर या नीचे सरकाएं। नाम मिलने पर एक बार दबाएं।',
            helpText: 'यदि नाम नहीं दिख रहा, तो सबसे ऊपर सर्च बार में उनका नाम टाइप कर सकते हैं।'
          },
          Marathi: {
            instruction: 'ज्या व्यक्तीला फोटो पाठवायचा आहे, त्यांचे नाव शोधा आणि नावावर टॅप करा.',
            explanation: 'स्क्रीनवर तुमच्या गप्पांची यादी दिसेल. व्यक्तीच्या नावावर किंवा फोटोवर एकदा स्पर्श करा.',
            slowExplanation: 'हळूच स्क्रीन वर किंवा खाली सरकवा. हव्या त्या नावावर अलगद बोट ठेवा.',
            helpText: 'नाव दिसत नसेल, तर वर दिलेल्या शोध (Search) चिन्हावर दाबा.'
          },
          Hinglish: {
            instruction: 'Jisko photo bhejna hai, unka name chat list mein dhund kar unpar tap karein.',
            explanation: 'Screen par recent chats dikhenge. Unke name par tap karke chat open karein.',
            slowExplanation: 'Dheere se scroll karein aur unka name tap karein.',
            helpText: 'Agar name na mile toh upar search bar mein unka name type karein.'
          }
        }
      },
      {
        stepNumber: 3,
        title: 'Tap the Paperclip Icon',
        instruction: 'At the bottom near the message box, look for the paperclip (📎) icon and tap it.',
        explanation: 'The paperclip is the universal symbol for adding an attachment like a photo, video, or document.',
        slowExplanation: 'Look right at the bottom where you normally type a message. Next to the typing area, you will see a small metal paperclip shape. Tap it gently.',
        expectedAction: 'Tap the paperclip attachment icon.',
        helpText: 'On an iPhone, look for a small plus (+) sign at the bottom left instead of the paperclip.',
        visual: {
          screenName: 'WhatsApp Conversation',
          targetHighlight: { top: 85, left: 70, width: 12, height: 12, label: 'Paperclip Icon (📎)' },
          screenPreview: {
            header: 'Contact Name - Online',
            content: 'Chat bubbles with conversation history',
            footer: 'Type a message... [📎] [📷] [🎙️]'
          }
        },
        translations: {
          Hindi: {
            instruction: 'नीचे मैसेज बॉक्स के पास बने पेपरक्लिप (📎) आइकन पर टैप करें।',
            explanation: 'पेपरक्लिप आइकन का मतलब होता है फोटो या फाइल जोड़ना। यह टाइपिंग बॉक्स के ठीक बगल में होता है।',
            slowExplanation: 'स्क्रीन के सबसे नीचे देखें जहां मैसेज लिखते हैं। वहां एक छोटा यू-पिन जैसा निशान दिखेगा।',
            helpText: 'अगर आपके पास iPhone है, तो नीचे बाईं तरफ प्लस (+) का निशान दिखेगा।'
          },
          Marathi: {
            instruction: 'खाली मेसेज टाईप करण्याच्या जागेजवळ पेपरक्लिप (📎) चिन्हावर टॅप करा.',
            explanation: 'पेपरक्लिप चिन्ह फोटो जोडण्यासाठी वापरले जाते. ते मेसेज बॉक्सच्या शेजारी असते.',
            slowExplanation: 'स्क्रीनच्या एकदम खाली लक्ष द्या. तिथे एक यू-पिन किंवा क्लिपसारखे चिन्ह दिसेल. त्यावर दाबा.',
            helpText: 'जर आयफोन असेल तर खाली डाव्या कोपऱ्यात अधिकचे (+) चिन्ह दिसेल.'
          },
          Hinglish: {
            instruction: 'Neeche message box ke paas paperclip (📎) icon par tap kijiye.',
            explanation: 'Paperclip icon photo ya document attach karne ke liye hota hai.',
            slowExplanation: 'Screen ke bottom par type message ke bagal mein metal clip symbol dekhein aur tap karein.',
            helpText: 'iPhone mein paperclip ki jagah plus (+) ka sign hota hai.'
          }
        }
      },
      {
        stepNumber: 4,
        title: 'Select Gallery',
        instruction: 'A colorful menu will pop up. Tap on "Gallery" to see all your photos.',
        explanation: 'The Gallery button is usually purple with a photo icon. It opens all photos saved on your phone.',
        slowExplanation: 'Several colorful round circles will appear. Look for the one named "Gallery". Tap it once.',
        expectedAction: 'Tap the Gallery icon from the attachment sheet.',
        helpText: 'If you want to take a new picture right now, you can tap "Camera" instead.',
        visual: {
          screenName: 'Attachment Menu',
          targetHighlight: { top: 55, left: 45, width: 25, height: 25, label: 'Gallery Button' },
          screenPreview: {
            header: 'Attachment Options',
            content: '[Document] [Camera] [Gallery] [Audio] [Location] [Contact]',
            footer: 'Tap Gallery to open phone photos'
          }
        },
        translations: {
          Hindi: {
            instruction: 'एक रंगीन मेनू खुलेगा। अपनी फोटो देखने के लिए "Gallery" (गैलरी) पर टैप करें।',
            explanation: 'गैलरी बटन बैंगनी रंग का होता है जिसमें फोटो का चित्र बना होता है।',
            slowExplanation: 'रंगीन गोल बटनों में से "गैलरी" नाम वाले बटन को आराम से दबाएं।',
            helpText: 'यदि तुरंत नई फोटो खींचनी है, तो "कैमरा" (Camera) चुन सकते हैं।'
          },
          Marathi: {
            instruction: 'एक रंगीत मेनू दिसेल. तुमचे फोटो पाहण्यासाठी "Gallery" वर टॅप करा.',
            explanation: 'गॅलरीचे चिन्ह जांभळ्या रंगाचे असते. त्यात तुमचे फोनमधील सर्व फोटो असतात.',
            slowExplanation: 'दिसणाऱ्या रंगीबेरंगी चिन्हांमधून "गॅलरी" शोधून त्यावर एकदा स्पर्श करा.',
            helpText: 'त्वरित नवीन फोटो काढायचा असेल तर "Camera" निवडा.'
          },
          Hinglish: {
            instruction: 'Ek colorful menu aayega. Apni photos dekhne ke liye "Gallery" par tap karein.',
            explanation: 'Gallery button purple color ka hota hai jisme pictures save hoti hain.',
            slowExplanation: 'Circles mein se "Gallery" label wale circle par tap karein.',
            helpText: 'Agar nayi photo khichni hai toh "Camera" par tap kar sakte hain.'
          }
        }
      },
      {
        stepNumber: 5,
        title: 'Choose Photo & Tap Send',
        instruction: 'Tap the photo you want to share, then tap the green Send arrow (➤) at the bottom right.',
        explanation: 'Tapping the photo will show you a full preview. Then the green circle with a paper airplane or arrow sends it.',
        slowExplanation: 'Find the photo you like and touch it. You will see it full size. At the bottom right corner, there is a round green button with an arrow. Tap that green button to send!',
        expectedAction: 'Tap a photo, then tap the green send button.',
        helpText: 'Congratulations! Once you see two small grey or blue checkmarks, your photo has been delivered!',
        visual: {
          screenName: 'Photo Preview Screen',
          targetHighlight: { top: 88, left: 82, width: 14, height: 14, label: 'Green Send Button (➤)' },
          screenPreview: {
            header: 'Photo Preview - Add a caption...',
            content: 'Full screen photo preview with crop and text tools',
            footer: 'Bottom right: Green circular Send button (➤)'
          }
        },
        translations: {
          Hindi: {
            instruction: 'अपनी मनपसंद फोटो पर टैप करें, फिर नीचे दाईं तरफ दिए गए हरे सेंड तीर (➤) को दबाएं।',
            explanation: 'फोटो चुनने के बाद नीचे कोने में एक हरा गोल बटन दिखेगा जिसपर तीर बना है। उसपर टैप करते ही फोटो चली जाएगी।',
            slowExplanation: 'फोटो पर उंगली रखें। फोटो बड़ी होकर दिखेगी। अब सबसे नीचे दाएं कोने में हरे तीर वाले बटन को दबा दें।',
            helpText: 'बहुत बढ़िया! जैसे ही दो टिक मार्क दिखेंगे, फोटो आपके प्रियजन तक पहुंच जाएगी!'
          },
          Marathi: {
            instruction: 'हव्या असलेल्या फोटोवर टॅप करा आणि खाली उजवीकडील हिरव्या बाणावर (➤) दाबा.',
            explanation: 'फोटो निवडल्यावर खाली उजव्या बाजूला एक हिरवे वर्तुळ दिसेल ज्यामध्ये बाण असतो. त्यावर दाबून फोटो पाठवा.',
            slowExplanation: 'फोटोवर बोट ठेवा. फोटो मोठा दिसेल. नंतर खाली उजव्या कोपऱ्यातील हिरव्या बटनावर दाबा.',
            helpText: 'छान! दोन टिक मार्क दिसल्यावर फोटो पोहोचला असे समजावे!'
          },
          Hinglish: {
            instruction: 'Jo photo bhejni hai uspe tap karein, fir neeche right corner mein green Send button (➤) press karein.',
            explanation: 'Photo preview mein neeche green circular send button hota hai. Uspe tap karte hi photo chali jayegi.',
            slowExplanation: 'Photo select karein aur bottom right ke green arrow button par tap karein.',
            helpText: 'Great job! Double checkmarks aate hi photo deliver ho jayegi!'
          }
        }
      }
    ],
    practiceQuestions: [
      {
        question: 'Which icon do you tap in WhatsApp to attach a photo to send?',
        options: ['Microphone icon', 'Paperclip (📎) or Plus (+) icon', 'Three dots menu', 'Settings gear'],
        correctIndex: 1,
        explanation: 'Great memory! The paperclip icon (or + on iPhone) is used to attach photos, videos, and documents.'
      },
      {
        question: 'What color is the Send button after you preview your photo?',
        options: ['Red', 'Yellow', 'Green circle with an arrow', 'Black'],
        correctIndex: 2,
        explanation: 'Spot on! The green circle with a white paper airplane/arrow sends your photo immediately.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000002'),
    title: 'Making a WhatsApp Video Call',
    slug: 'whatsapp-video-call',
    category: 'WhatsApp',
    difficulty: 'Absolute Beginner',
    icon: '📹',
    estimatedTime: '3 mins',
    description: 'See your children and grandchildren face-to-face with a free WhatsApp video call.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Open WhatsApp & Select Contact',
        instruction: 'Open WhatsApp and tap the name of the person you want to video call.',
        explanation: 'Open the conversation window with the family member you want to see on your screen.',
        slowExplanation: 'Tap the green WhatsApp app. In your chat list, tap your grandchild or friend’s name.',
        expectedAction: 'Open the chat of the person to call.',
        helpText: 'Make sure your phone is connected to Wi-Fi or mobile data for clear video.',
        visual: {
          screenName: 'WhatsApp Chats',
          targetHighlight: { top: 20, left: 10, width: 80, height: 15, label: 'Family Contact' },
          screenPreview: {
            header: 'WhatsApp',
            content: 'Chat list with family members',
            footer: 'Bottom navigation'
          }
        }
      },
      {
        stepNumber: 2,
        title: 'Tap the Video Camera Icon',
        instruction: 'At the very top right of the chat, look for the small video camera icon and tap it.',
        explanation: 'Next to the person’s name, there is a video camera icon for video calls, and a telephone receiver for voice-only calls.',
        slowExplanation: 'Look right at the top bar where their name is written. In the top-right corner, you will see a little camera icon. Tap it gently.',
        expectedAction: 'Tap the video camera icon at top right.',
        helpText: 'Be sure to tap the camera icon, not the telephone icon, if you want to see their face.',
        visual: {
          screenName: 'Chat Header',
          targetHighlight: { top: 5, left: 75, width: 12, height: 12, label: 'Video Camera Icon (📹)' },
          screenPreview: {
            header: 'Rahul (Son) [📹] [📞] [⋮]',
            content: 'Chat screen',
            footer: 'Message input'
          }
        }
      },
      {
        stepNumber: 3,
        title: 'Confirm Call & Hold Phone Up',
        instruction: 'If WhatsApp asks "Start video call?", tap "Call". Hold the phone in front of your face.',
        explanation: 'The phone will start ringing. Once they answer, you will see their face on the big screen and your face in the small corner.',
        slowExplanation: 'Hold the phone about 1 to 2 feet away from your eyes at comfortable face level. Relax and wait for them to pick up.',
        expectedAction: 'Wait for the call to connect.',
        helpText: 'When finished speaking, tap the red telephone button at the bottom to end the call.',
        visual: {
          screenName: 'Video Call Screen',
          targetHighlight: { top: 85, left: 45, width: 20, height: 20, label: 'Red End Call Button' },
          screenPreview: {
            header: 'Connected - 00:15',
            content: 'Full screen video of grandchild smiling',
            footer: '[Mute] [Camera Flip] [Red End Call]'
          }
        }
      }
    ],
    practiceQuestions: [
      {
        question: 'Which icon at the top of a WhatsApp chat starts a video call?',
        options: ['Magnifying glass', 'Video camera icon', 'Three vertical dots', 'Microphone'],
        correctIndex: 1,
        explanation: 'Perfect! The video camera icon connects you with video so you can see each other.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000003'),
    title: 'Sending an Email on Gmail',
    slug: 'gmail-send-email',
    category: 'Email',
    difficulty: 'Easy',
    icon: '✉️',
    estimatedTime: '5 mins',
    description: 'Learn how to write and send an email message on Gmail calmly and confidently.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Open Gmail',
        instruction: 'Find the red and white "M" envelope icon labeled Gmail and tap it.',
        explanation: 'Gmail is Google’s email app. It holds all your incoming and outgoing emails.',
        slowExplanation: 'Look for an app icon that looks like a clean white envelope with a red "M" outline.',
        expectedAction: 'Tap the Gmail app icon.',
        helpText: 'It is usually located inside a "Google" app folder on Android phones.',
        visual: {
          screenName: 'Phone Apps',
          targetHighlight: { top: 30, left: 30, width: 40, height: 40, label: 'Gmail Icon' },
          screenPreview: { header: 'Apps', content: 'Google Folder with Gmail', footer: 'Dock' }
        }
      },
      {
        stepNumber: 2,
        title: 'Tap the "Compose" Button',
        instruction: 'Look at the bottom right corner and tap the colorful pill button that says "Compose" with a pencil icon.',
        explanation: '"Compose" is simply a polite word for "write a new email".',
        slowExplanation: 'At the bottom right, you will see a round or pill button with a pencil. Tap it once to start writing.',
        expectedAction: 'Tap the Compose button.',
        helpText: 'If you only see a pencil inside a colorful circle, tap that pencil.',
        visual: {
          screenName: 'Gmail Inbox',
          targetHighlight: { top: 82, left: 60, width: 35, height: 14, label: 'Compose Button (✏️)' },
          screenPreview: { header: 'Primary Inbox', content: 'Email list', footer: 'Compose Button floating' }
        }
      },
      {
        stepNumber: 3,
        title: 'Type the Recipient, Subject, and Message',
        instruction: 'In "To", type their email address. In "Subject", write what it is about. In "Compose email", write your message.',
        explanation: 'Subject is like the headline of your letter. The big area below is where your warm letter goes.',
        slowExplanation: 'First tap "To" and type the email (like rahul@gmail.com). Next tap "Subject" and write a short title. Then tap below and type your letter.',
        expectedAction: 'Fill in To, Subject, and email body.',
        helpText: 'Take your time with typing. There is no rush at all.',
        visual: {
          screenName: 'Compose Screen',
          targetHighlight: { top: 15, left: 10, width: 80, height: 35, label: 'To & Subject Fields' },
          screenPreview: { header: 'Compose', content: 'To: ... \nSubject: ... \nMessage...', footer: 'Keyboard' }
        }
      },
      {
        stepNumber: 4,
        title: 'Tap the Send Arrow',
        instruction: 'Look at the top right corner and tap the blue paper airplane arrow (➤) to send.',
        explanation: 'The paper airplane icon flies your email directly to their inbox.',
        slowExplanation: 'Right at the top right edge of your screen, you will see a blue triangular arrow. Tap it once. Your email is sent!',
        expectedAction: 'Tap the Send paper airplane icon.',
        helpText: 'If you want to attach a photo or document before sending, tap the paperclip icon next to the blue arrow.',
        visual: {
          screenName: 'Compose Header',
          targetHighlight: { top: 5, left: 75, width: 12, height: 12, label: 'Send Icon (➤)' },
          screenPreview: { header: 'Compose [📎] [➤] [⋮]', content: 'Completed letter', footer: '' }
        }
      }
    ],
    practiceQuestions: [
      {
        question: 'What does the word "Compose" mean in Gmail?',
        options: ['Delete old emails', 'Write a new email', 'Change my password', 'Turn off the phone'],
        correctIndex: 1,
        explanation: 'Spot on! "Compose" means writing a brand new email letter.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000004'),
    title: 'Attaching Photos in Gmail',
    slug: 'gmail-attach-photo',
    category: 'Email',
    difficulty: 'Easy',
    icon: '📎',
    estimatedTime: '4 mins',
    description: 'Learn how to attach doctor prescriptions, bills, or family photos to an email.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Start a New Email or Reply',
        instruction: 'Open Gmail and tap Compose (the pencil button) or tap Reply on an existing email.',
        explanation: 'You can attach files whenever you are writing an email.',
        slowExplanation: 'Make sure you are on the screen where you can type your email message.',
        expectedAction: 'Open the email writing screen.',
        helpText: 'Write the person’s email in the "To" box first.',
        visual: { screenName: 'Gmail Compose', targetHighlight: { top: 10, left: 10, width: 80, height: 20, label: 'Compose View' }, screenPreview: { header: 'Compose', content: 'New message', footer: '' } }
      },
      {
        stepNumber: 2,
        title: 'Tap the Paperclip at the Top',
        instruction: 'Look at the very top bar of your screen and tap the paperclip (📎) icon.',
        explanation: 'Just like on physical paper, the paperclip attaches a picture or document to your email.',
        slowExplanation: 'Look above the "To" line at the top bar. You will see a small curved metal clip. Tap it gently.',
        expectedAction: 'Tap the top paperclip icon.',
        helpText: 'A small menu will appear with "Attach file". Tap "Attach file".',
        visual: { screenName: 'Top Bar', targetHighlight: { top: 5, left: 65, width: 12, height: 12, label: 'Paperclip (📎)' }, screenPreview: { header: 'Compose [📎] [➤]', content: 'Attach file option', footer: '' } }
      },
      {
        stepNumber: 3,
        title: 'Choose the Picture & Send',
        instruction: 'Tap the picture you want from your files, then tap the blue paper airplane to send.',
        explanation: 'You will see the picture attached at the bottom of your letter. Tap Send when ready.',
        slowExplanation: 'Tap on your photo. It will now show up inside your email. When you are ready, tap the blue arrow at the top right to send.',
        expectedAction: 'Pick the file and tap Send.',
        helpText: 'You can attach multiple photos if needed by tapping the paperclip again.',
        visual: { screenName: 'Email with Attachment', targetHighlight: { top: 60, left: 10, width: 80, height: 20, label: 'Attached Photo Box' }, screenPreview: { header: 'Compose', content: 'Letter body + Photo preview', footer: 'Send Button at top' } }
      }
    ],
    practiceQuestions: [
      {
        question: 'Where is the paperclip icon located when writing an email in Gmail?',
        options: ['Inside the phone battery', 'At the very top bar near the send arrow', 'On the keyboard spacebar', 'Under the phone back cover'],
        correctIndex: 1,
        explanation: 'Correct! The paperclip is at the top right bar of the Gmail compose screen.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000005'),
    title: 'Joining a Google Meet Video Call',
    slug: 'google-meet-join-meeting',
    category: 'Google Meet',
    difficulty: 'Absolute Beginner',
    icon: '💻',
    estimatedTime: '4 mins',
    description: 'Step-by-step guidance to easily join family gatherings, doctor appointments, or club meetings online.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Tap the Meeting Link',
        instruction: 'Open the WhatsApp message or email that has the meeting link (looks like meet.google.com/...) and tap it.',
        explanation: 'Meeting invitations are usually sent as blue underlined web links in your WhatsApp or SMS.',
        slowExplanation: 'Look for the message from your family. Find the blue text starting with "meet.google.com". Tap directly on that blue text.',
        expectedAction: 'Tap the blue Google Meet link.',
        helpText: 'If you have a meeting code instead, you can open the Meet app and tap "Join with a code".',
        visual: { screenName: 'WhatsApp Message', targetHighlight: { top: 40, left: 10, width: 80, height: 20, label: 'meet.google.com Link' }, screenPreview: { header: 'Family Group', content: 'Join our family call: meet.google.com/abc-defg-hij', footer: '' } }
      },
      {
        stepNumber: 2,
        title: 'Check Your Camera and Microphone',
        instruction: 'You will see yourself on screen. Make sure the microphone and camera buttons are turned on.',
        explanation: 'Before you enter the room, Google Meet lets you adjust your hair and lighting.',
        slowExplanation: 'Look at the two circular buttons below your face. If there is a diagonal slash across the microphone or camera, tap it to turn it back on.',
        expectedAction: 'Verify video preview and microphone.',
        helpText: 'A red circle with a slash means you will enter muted. That is okay if you want to unmute later.',
        visual: { screenName: 'Green Room Preview', targetHighlight: { top: 60, left: 30, width: 40, height: 20, label: 'Mic & Camera Controls' }, screenPreview: { header: 'Ready to join?', content: 'Self video preview with [Mic] [Cam]', footer: '[Ask to join] button' } }
      },
      {
        stepNumber: 3,
        title: 'Tap "Ask to Join" or "Join Now"',
        instruction: 'Tap the large blue button that says "Join" or "Ask to join".',
        explanation: 'The host will let you in, and you will see all your loved ones in the meeting room!',
        slowExplanation: 'Tap the big blue button on your screen. You will hear a pleasant chime when you enter the call.',
        expectedAction: 'Tap Join Now.',
        helpText: 'To leave the meeting when done, tap the red telephone receiver at the bottom.',
        visual: { screenName: 'Join Screen', targetHighlight: { top: 75, left: 25, width: 50, height: 15, label: 'Join Now Button' }, screenPreview: { header: 'Family Call', content: 'Other people already in call', footer: 'Blue Join Now button' } }
      }
    ],
    practiceQuestions: [
      {
        question: 'What button do you press when you want to leave a Google Meet call?',
        options: ['The red telephone receiver icon', 'The volume up button', 'The restart button', 'The flashlight'],
        correctIndex: 0,
        explanation: 'Exactly right! The red telephone receiver icon ends or leaves the call peacefully.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000006'),
    title: 'Finding Places on Google Maps',
    slug: 'google-maps-find-location',
    category: 'Google Maps',
    difficulty: 'Easy',
    icon: '🗺️',
    estimatedTime: '5 mins',
    description: 'Learn how to find pharmacies, hospitals, temples, or children\'s addresses with directions.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Open Google Maps',
        instruction: 'Tap the colorful map pin icon labeled "Maps".',
        explanation: 'Google Maps shows roads, shops, hospitals, and directions anywhere in the world.',
        slowExplanation: 'Find the app that looks like a colorful teardrop or folded map pin. Tap it once.',
        expectedAction: 'Open Google Maps.',
        helpText: 'Allow the app to use your location when asked so it knows where you are starting from.',
        visual: { screenName: 'Home Screen', targetHighlight: { top: 35, left: 35, width: 35, height: 35, label: 'Maps Pin Icon' }, screenPreview: { header: 'Apps', content: 'Maps Icon', footer: '' } }
      },
      {
        stepNumber: 2,
        title: 'Type or Speak the Place Name',
        instruction: 'Tap the white search bar at the top, or tap the microphone icon (🎙️) and say the place name.',
        explanation: 'You can say "Apollo Pharmacy near me" or type your relative\'s colony name.',
        slowExplanation: 'Tap the little microphone inside the top search bar. Speak clearly: "Nearest medical store".',
        expectedAction: 'Search for a destination.',
        helpText: 'Speaking into the microphone is very fast and prevents typing mistakes.',
        visual: { screenName: 'Maps Search Bar', targetHighlight: { top: 8, left: 10, width: 80, height: 12, label: 'Search Bar & Mic (🎙️)' }, screenPreview: { header: 'Search here [🎙️]', content: 'Map view with blue dot (you)', footer: 'Explore nearby' } }
      },
      {
        stepNumber: 3,
        title: 'Tap "Directions" or "Start"',
        instruction: 'When the place appears, tap the blue "Directions" or "Start" button for voice turn-by-turn guidance.',
        explanation: 'Maps will draw a blue route and can speak out directions: "Turn right in 100 meters".',
        slowExplanation: 'Look at the bottom of your screen for the blue circular button with an arrow. Tap "Start".',
        expectedAction: 'Tap Directions or Start.',
        helpText: 'To exit navigation when you arrive, tap the "X" button at the bottom left.',
        visual: { screenName: 'Destination Card', targetHighlight: { top: 70, left: 10, width: 45, height: 15, label: 'Directions Button' }, screenPreview: { header: 'Apollo Pharmacy - Open', content: 'Distance: 1.2 km (5 mins)', footer: '[Directions] [Start] [Call]' } }
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the fastest way to search for a place on Google Maps without typing on small keys?',
        options: ['Tap the microphone icon and speak the place name', 'Send a letter by post', 'Restart the smartphone', 'Turn off Wi-Fi'],
        correctIndex: 0,
        explanation: 'Splendid! Tapping the microphone lets you simply speak the destination effortlessly.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000007'),
    title: 'Searching and Watching Videos on YouTube',
    slug: 'youtube-search-video',
    category: 'YouTube',
    difficulty: 'Absolute Beginner',
    icon: '▶️',
    estimatedTime: '4 mins',
    description: 'Find bhajans, cooking recipes, old songs, news, and yoga sessions on YouTube.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Open YouTube',
        instruction: 'Find the red rectangle with a white triangle play button labeled "YouTube" and tap it.',
        explanation: 'YouTube has millions of helpful videos, songs, and educational programs.',
        slowExplanation: 'Look for the bright red icon with a white sideways triangle. Tap it once.',
        expectedAction: 'Open the YouTube app.',
        helpText: 'YouTube is usually pre-installed on every Android phone.',
        visual: { screenName: 'Home Screen', targetHighlight: { top: 45, left: 40, width: 30, height: 30, label: 'YouTube Red Icon' }, screenPreview: { header: 'Apps', content: 'YouTube Icon', footer: '' } }
      },
      {
        stepNumber: 2,
        title: 'Tap the Search Magnifying Glass',
        instruction: 'At the top right corner, tap the magnifying glass (🔍) or microphone (🎙️).',
        explanation: 'This lets you search for anything you enjoy, like "Morning classical music" or "Healthy soup recipe".',
        slowExplanation: 'Look at the top bar. You will see a small magnifying glass. Tap it to open the search box.',
        expectedAction: 'Tap the search icon or mic.',
        helpText: 'Tap the microphone icon to speak your search in Hindi, Marathi, or English!',
        visual: { screenName: 'YouTube Header', targetHighlight: { top: 5, left: 70, width: 12, height: 12, label: 'Search Glass (🔍)' }, screenPreview: { header: 'YouTube [Cast] [Bell] [🔍]', content: 'Video feed', footer: 'Home | Shorts | Subscriptions' } }
      },
      {
        stepNumber: 3,
        title: 'Tap the Video to Play',
        instruction: 'Look at the list of videos. Tap on the picture or title of the video you want to watch.',
        explanation: 'The video will open and start playing. Tap the small square at the bottom right of the video to make it full screen.',
        slowExplanation: 'Touch the video picture once. It will start playing sound and picture. Relax and enjoy!',
        expectedAction: 'Tap a video thumbnail to play.',
        helpText: 'To pause the video at any time, tap once on the middle of the playing screen and tap the two vertical bars (⏸️).',
        visual: { screenName: 'Video Player', targetHighlight: { top: 10, left: 5, width: 90, height: 40, label: 'Video Playing Area' }, screenPreview: { header: 'Video Title - Channel', content: 'Playing video with play/pause controls', footer: 'Comments & related videos' } }
      }
    ],
    practiceQuestions: [
      {
        question: 'How do you pause a YouTube video while watching?',
        options: ['Throw the phone on the bed', 'Tap the middle of the screen and tap the pause bars (⏸️)', 'Delete the YouTube app', 'Unplug your charger'],
        correctIndex: 1,
        explanation: 'Spot on! Tapping the screen brings up the pause icon (⏸️) so you can pause anytime.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000008'),
    title: 'Connecting to Home Wi-Fi',
    slug: 'smartphone-connect-wifi',
    category: 'Smartphone',
    difficulty: 'Easy',
    icon: '📶',
    estimatedTime: '4 mins',
    description: 'Connect your smartphone to home Wi-Fi to save mobile data and enjoy fast internet.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Open Phone Settings',
        instruction: 'Swipe down from the top of your screen and tap the gear (⚙️) icon, or find "Settings" in your apps.',
        explanation: 'Settings is the control room of your phone where Wi-Fi, sounds, and display are managed.',
        slowExplanation: 'Drag your finger downward from the very top edge of your screen. Look for a small metal wheel or gear shape and tap it.',
        expectedAction: 'Open Settings.',
        helpText: 'You can also find an app named "Settings" with a grey gear on your home screen.',
        visual: { screenName: 'Top Notification Shade', targetHighlight: { top: 5, left: 80, width: 15, height: 15, label: 'Gear Icon (⚙️)' }, screenPreview: { header: 'Quick Settings', content: 'Brightness slider and quick toggles', footer: 'Gear Icon at top right' } }
      },
      {
        stepNumber: 2,
        title: 'Tap on "Wi-Fi" or "Network & Internet"',
        instruction: 'Near the top of the Settings list, tap "Wi-Fi" (or "Network & Internet").',
        explanation: 'This opens the list of wireless internet networks in your home or building.',
        slowExplanation: 'Look for the word "Wi-Fi" with curved signal waves next to it. Tap on that row.',
        expectedAction: 'Tap Wi-Fi.',
        helpText: 'Make sure the toggle switch next to Wi-Fi is turned ON (colored blue or green).',
        visual: { screenName: 'Settings Menu', targetHighlight: { top: 15, left: 10, width: 80, height: 12, label: 'Wi-Fi row' }, screenPreview: { header: 'Settings', content: '📶 Wi-Fi\n📱 SIM Cards\n🔔 Sound', footer: '' } }
      },
      {
        stepNumber: 3,
        title: 'Select Your Home Network & Enter Password',
        instruction: 'Tap your home Wi-Fi name. Type your Wi-Fi password carefully, then tap "Connect".',
        explanation: 'The Wi-Fi password is often written on a sticker on your home internet router.',
        slowExplanation: 'Tap your network name. A box will open asking for the password. Type each letter carefully. Tap the eye icon to see what you typed! Then tap "Connect".',
        expectedAction: 'Enter password and tap Connect.',
        helpText: 'Once connected, you will see a small fan-shaped Wi-Fi symbol at the very top of your phone screen.',
        visual: { screenName: 'Wi-Fi Networks', targetHighlight: { top: 30, left: 10, width: 80, height: 20, label: 'Home Wi-Fi Network' }, screenPreview: { header: 'Available Networks', content: 'Home_WiFi_5G (Lock icon)\nEnter password: ...', footer: '[Cancel] [Connect]' } }
      }
    ],
    practiceQuestions: [
      {
        question: 'What icon appears at the very top of your phone screen when Wi-Fi is connected?',
        options: ['An airplane', 'A curved fan-shaped signal icon (📶)', 'A shopping cart', 'A skull'],
        correctIndex: 1,
        explanation: 'Well done! The curved fan symbol confirms your phone is connected to Wi-Fi.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000009'),
    title: 'Understanding QR Code Payments Safely',
    slug: 'digital-payments-qr-safety',
    category: 'Digital Payments',
    difficulty: 'Easy',
    icon: '💳',
    estimatedTime: '5 mins',
    description: 'Learn how QR codes work at grocery stores and vegetable vendors, with critical safety rules.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Understand the Golden Rule of UPI',
        instruction: 'Remember: You ONLY enter your UPI PIN to SEND money, NEVER to RECEIVE money.',
        explanation: 'If anyone says "Scan this QR code or enter your PIN to receive prize money/refund", it is 100% a fraud scam. To receive money, nobody needs your PIN.',
        slowExplanation: 'Repeat this golden truth: A PIN is like your bank vault key. You only turn your key when you are giving money to a shopkeeper. Receiving money never requires a PIN.',
        expectedAction: 'Acknowledge the Golden Rule.',
        helpText: 'Never share your 4-digit or 6-digit UPI PIN with anyone, even if they claim to be from the bank.',
        visual: { screenName: 'Safety Rule Card', targetHighlight: { top: 20, left: 10, width: 80, height: 40, label: 'Golden Rule Warning' }, screenPreview: { header: 'IMPORTANT SAFETY RULE', content: 'Sending Money = Requires PIN\nReceiving Money = NEVER requires PIN!', footer: 'Protect your bank account' } }
      },
      {
        stepNumber: 2,
        title: 'Open Your Payment App (Google Pay / PhonePe / Paytm)',
        instruction: 'Open your preferred UPI app and tap the "Scan any QR" icon.',
        explanation: 'Every UPI app has a square QR scanner button right in the middle of the main screen.',
        slowExplanation: 'Look for a square box icon with horizontal lines or a small camera. Tap it to open your camera scanner.',
        expectedAction: 'Tap the QR scanner icon.',
        helpText: 'Point your camera directly at the shopkeeper’s printed QR standee until it beeps.',
        visual: { screenName: 'Payment App Home', targetHighlight: { top: 25, left: 35, width: 30, height: 30, label: 'Scan QR Button' }, screenPreview: { header: 'Payment App', content: '[Scan QR Code] [Pay Contacts] [Pay Phone Number]', footer: '' } }
      },
      {
        stepNumber: 3,
        title: 'Verify Shop Name and Amount Before PIN',
        instruction: 'Check the shopkeeper’s name on your screen. Type the exact amount. Only then enter your PIN.',
        explanation: 'Always verify that the name matches the store (e.g. "Ramesh General Store") and double check the rupees amount before typing your PIN.',
        slowExplanation: 'Look at the screen. Read the name. Read the amount (e.g. ₹50). If correct, tap Pay, enter your secret PIN, and tap the checkmark.',
        expectedAction: 'Verify store name, amount, and complete payment.',
        helpText: 'You will hear a chime and see a green checkmark indicating successful payment.',
        visual: { screenName: 'Payment Confirmation', targetHighlight: { top: 50, left: 10, width: 80, height: 25, label: 'Amount & Store Name' }, screenPreview: { header: 'Paying Ramesh Store', content: '₹ 50.00\nFrom: State Bank of India', footer: '[Proceed to Pay]' } }
      }
    ],
    practiceQuestions: [
      {
        question: 'Someone calls you and says: "Enter your UPI PIN to receive ₹5,000 lottery refund". What should you do?',
        options: ['Enter your PIN immediately', 'Never enter your PIN! It is a scam because receiving money never requires a PIN', 'Give them your bank password', 'Send them your ATM card photo'],
        correctIndex: 1,
        explanation: 'Brilliant! You will never fall for a scam. Receiving money NEVER requires a PIN.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000010'),
    title: 'Recognizing Suspicious Messages & Scams',
    slug: 'online-safety-scam-recognition',
    category: 'Online Safety',
    difficulty: 'Absolute Beginner',
    icon: '🛡️',
    estimatedTime: '5 mins',
    description: 'Learn the red flags of fake courier texts, electricity bill disconnection threats, and lottery scams.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Watch for Urgent Fear or Greed Words',
        instruction: 'Be suspicious if a message says: "Urgent! Electricity will be cut tonight at 9 PM" or "You won 25 Lakhs".',
        explanation: 'Scammers deliberately create panic or greed to make you click without thinking. Real government bodies never send threats like this.',
        slowExplanation: 'Whenever a message makes your heart beat faster with panic or excitement, stop! Take a deep breath. Scammers use urgency as a trick.',
        expectedAction: 'Identify urgent fear tactics.',
        helpText: 'Always discuss any threatening message with your son, daughter, or a trusted neighbor before doing anything.',
        visual: { screenName: 'Fake SMS Example', targetHighlight: { top: 20, left: 10, width: 80, height: 30, label: 'Fake Urgent SMS' }, screenPreview: { header: 'SMS from +91-9876543210', content: 'Dear consumer your electricity power will be disconnected tonight at 9:30pm call immediately...', footer: '' } }
      },
      {
        stepNumber: 2,
        title: 'Never Click Unknown Blue Links in SMS',
        instruction: 'Do NOT click links sent by unknown numbers (like bit.ly/... or apk download links).',
        explanation: 'Clicking an unknown link can install dangerous software on your phone that steals personal information.',
        slowExplanation: 'Treat strange blue links like an open ditch on a road. Do not step into it! Leave it untouched.',
        expectedAction: 'Avoid clicking unknown links.',
        helpText: 'You can copy the message and paste it into the ElderEase Safety Center to check if it is risky.',
        visual: { screenName: 'Suspicious Link Warning', targetHighlight: { top: 40, left: 10, width: 80, height: 15, label: 'Dangerous Link in SMS' }, screenPreview: { header: 'Warning', content: 'bit.ly/update-bill-now (DO NOT CLICK)', footer: '' } }
      },
      {
        stepNumber: 3,
        title: 'The Golden Rule: Never Share OTP or Passwords',
        instruction: 'Never share an OTP (One-Time Password) received on SMS with ANYONE on phone call or message.',
        explanation: 'Bank managers, police officers, and company agents will NEVER ask for your OTP. Anyone asking for OTP is attempting theft.',
        slowExplanation: 'If someone calls claiming to be from your bank and says "Madam, just tell me the 6 numbers on your SMS to renew your card", say NO and disconnect the call.',
        expectedAction: 'Memorize the rule: Never give OTP to anyone.',
        helpText: 'ElderEase has a Safety Center where you can check any message or screenshot anytime.',
        visual: { screenName: 'Bank Safety Advice', targetHighlight: { top: 30, left: 10, width: 80, height: 35, label: 'Shield & Lock Icon' }, screenPreview: { header: 'Official Bank Advisory', content: 'Bank staff will never ask for your OTP or PIN under any circumstances.', footer: 'Dial 1930 for cyber helpline' } }
      }
    ],
    practiceQuestions: [
      {
        question: 'A stranger calls claiming to be from the electricity board asking for a 6-digit OTP to prevent power cut. What do you do?',
        options: ['Tell them the OTP quickly', 'Disconnect the call immediately and never share the OTP', 'Send them money', 'Give them your ATM PIN'],
        correctIndex: 1,
        explanation: 'Excellent decision! Disconnecting immediately protects your savings and peace of mind.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000011'),
    title: 'Sending a Voice Note on WhatsApp',
    slug: 'whatsapp-voice-message',
    category: 'WhatsApp',
    difficulty: 'Absolute Beginner',
    icon: '🎙️',
    estimatedTime: '3 mins',
    description: 'Speak your message with your own voice instead of typing on a small keyboard.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Open the Chat',
        instruction: 'Open WhatsApp and tap the person you want to send a voice note to.',
        explanation: 'Open their conversation window just like when you send a text.',
        slowExplanation: 'Find the chat of your family member and tap it once.',
        expectedAction: 'Open contact chat.',
        helpText: 'Voice notes are wonderful because you can speak in your mother tongue naturally.',
        visual: { screenName: 'WhatsApp Chat', targetHighlight: { top: 20, left: 10, width: 80, height: 15, label: 'Chat Header' }, screenPreview: { header: 'Sunita (Daughter)', content: 'Chat history', footer: 'Bottom bar' } }
      },
      {
        stepNumber: 2,
        title: 'Press and Hold the Green Microphone Icon',
        instruction: 'Look at the bottom right corner for the round green microphone icon (🎙️). Press and hold it while speaking.',
        explanation: 'Keep your finger pressed on the microphone as you speak. When you lift your finger, the voice note is sent!',
        slowExplanation: 'Put your finger on the green microphone button at the bottom right. Hold it down firmly. Speak your message clearly: "Beta, call me when you reach home". When finished, simply lift your finger.',
        expectedAction: 'Press and hold mic to record.',
        helpText: 'If you want to cancel the recording without sending, slide your finger to the left towards the trash bin.',
        visual: { screenName: 'Voice Recording', targetHighlight: { top: 85, left: 82, width: 14, height: 14, label: 'Microphone Button (🎙️)' }, screenPreview: { header: 'Recording voice...', content: 'Audio waveform: 0:04 🔴', footer: '< Slide to cancel | Green Mic' } }
      }
    ],
    practiceQuestions: [
      {
        question: 'What happens when you lift your finger off the green microphone icon after speaking?',
        options: ['The phone turns off', 'Your voice message is sent to the person', 'A loud alarm rings', 'Nothing happens'],
        correctIndex: 1,
        explanation: 'Correct! Lifting your finger sends your heartfelt voice message right away.'
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000012'),
    title: 'Making Text Larger & Screen Brighter',
    slug: 'smartphone-larger-text',
    category: 'Smartphone',
    difficulty: 'Absolute Beginner',
    icon: '🔍',
    estimatedTime: '4 mins',
    description: 'Adjust your phone settings so letters are big, clear, and easy on your eyes.',
    isPredefined: true,
    steps: [
      {
        stepNumber: 1,
        title: 'Open Settings and Tap "Display"',
        instruction: 'Open your phone Settings (gear icon ⚙️) and tap "Display".',
        explanation: 'Display settings control how bright the screen is and how large words appear.',
        slowExplanation: 'Tap Settings. Scroll down a little bit and look for the word "Display" with a sun or brightness symbol.',
        expectedAction: 'Tap Display in Settings.',
        helpText: 'On some phones it is called "Display & Brightness".',
        visual: { screenName: 'Settings', targetHighlight: { top: 25, left: 10, width: 80, height: 12, label: 'Display Row' }, screenPreview: { header: 'Settings', content: '🔆 Display\n🔒 Lock Screen\n🔋 Battery', footer: '' } }
      },
      {
        stepNumber: 2,
        title: 'Tap "Font Size" and Drag Slider to the Right',
        instruction: 'Tap "Font size" or "Text size". Drag the dot on the slider to the right to make words bigger.',
        explanation: 'Moving the slider to the right makes letters bigger across all your apps including WhatsApp and SMS.',
        slowExplanation: 'Touch the small blue circle on the slider line and gently slide it toward the right side. You will see the preview text grow larger immediately.',
        expectedAction: 'Increase font size slider.',
        helpText: 'ElderEase also has its own text size button (A+ / A-) at the top of every page!',
        visual: { screenName: 'Font Size Settings', targetHighlight: { top: 50, left: 20, width: 60, height: 15, label: 'Font Size Slider' }, screenPreview: { header: 'Font Size', content: 'Sample text gets larger as you slide right', footer: 'Slider: [Small --- ● --- Huge]' } }
      }
    ],
    practiceQuestions: [
      {
        question: 'Which way do you move the font size slider to make letters bigger and easier to read?',
        options: ['Toward the right', 'Toward the left', 'Downwards', 'Throw the phone'],
        correctIndex: 0,
        explanation: 'Yes! Sliding to the right increases the letter size for maximum clarity.'
      }
    ]
  }
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    const isMongoLive = mongoose.connection.readyState === 1;

    console.log(`[Seed] Initializing seed data (MongoDB live: ${isMongoLive})...`);

    // Prepare demo users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const demoUsers = [
      {
        _id: new mongoose.Types.ObjectId('661111111111111111111101'),
        name: 'Asha Sharma',
        email: 'asha@elderease.com',
        password: hashedPassword,
        role: 'senior',
        avatar: '👵',
        preferredLanguage: 'English',
        teachingSpeed: 'Step by Step',
        accessibilityPreferences: { textSize: 'large', highContrast: false, reducedMotion: false, voiceSpeed: 0.9, autoRead: true },
        familySharingEnabled: true,
        interests: ['WhatsApp', 'Video Calls', 'Online Safety'],
        onboardingCompleted: true,
        learningStreak: 4,
        createdAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId('661111111111111111111102'),
        name: 'Ramesh Patel',
        email: 'ramesh@elderease.com',
        password: hashedPassword,
        role: 'senior',
        avatar: '👴',
        preferredLanguage: 'Hindi',
        teachingSpeed: 'Slowly',
        accessibilityPreferences: { textSize: 'extra-large', highContrast: true, reducedMotion: false, voiceSpeed: 0.8, autoRead: true },
        familySharingEnabled: true,
        interests: ['Digital Payments', 'WhatsApp', 'Google Maps'],
        onboardingCompleted: true,
        learningStreak: 7,
        createdAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId('661111111111111111111103'),
        name: 'Sunita Deshmukh',
        email: 'sunita@elderease.com',
        password: hashedPassword,
        role: 'senior',
        avatar: '🧓',
        preferredLanguage: 'Marathi',
        teachingSpeed: 'Step by Step',
        accessibilityPreferences: { textSize: 'large', highContrast: false, reducedMotion: true, voiceSpeed: 0.9, autoRead: true },
        familySharingEnabled: true,
        interests: ['YouTube', 'Email', 'WhatsApp'],
        onboardingCompleted: true,
        learningStreak: 2,
        createdAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId('661111111111111111111104'),
        name: 'Balaji Rao',
        email: 'balaji@elderease.com',
        password: hashedPassword,
        role: 'senior',
        avatar: '👨‍🦳',
        preferredLanguage: 'Hinglish',
        teachingSpeed: 'Step by Step',
        accessibilityPreferences: { textSize: 'large', highContrast: false, reducedMotion: false, voiceSpeed: 0.95, autoRead: true },
        familySharingEnabled: false,
        interests: ['Google Meet', 'Computer Basics', 'Online Safety'],
        onboardingCompleted: true,
        learningStreak: 5,
        createdAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId('661111111111111111111105'),
        name: 'Rahul Sharma',
        email: 'rahul@elderease.com',
        password: hashedPassword,
        role: 'family',
        avatar: '🧑‍💼',
        preferredLanguage: 'English',
        teachingSpeed: 'Quickly',
        accessibilityPreferences: { textSize: 'normal', highContrast: false, reducedMotion: false, voiceSpeed: 1.0, autoRead: false },
        familySharingEnabled: true,
        interests: ['Caregiving', 'Tech Education'],
        onboardingCompleted: true,
        learningStreak: 12,
        createdAt: new Date()
      }
    ];

    // Seed into in-memory resilience store
    inMemoryStore.users = [...demoUsers];
    inMemoryStore.lessons = [...predefinedLessons];

    // Sample progress for Asha Sharma
    const sampleProgress = [
      {
        _id: new mongoose.Types.ObjectId('662222222222222222222201'),
        userId: demoUsers[0]._id,
        lessonId: predefinedLessons[0]._id, // WhatsApp: Send photo
        currentStep: 4,
        completedSteps: [1, 2, 3],
        percentage: 75,
        status: 'in_progress',
        practiceCompleted: false,
        lastAccessedAt: new Date(Date.now() - 3600000)
      },
      {
        _id: new mongoose.Types.ObjectId('662222222222222222222202'),
        userId: demoUsers[0]._id,
        lessonId: predefinedLessons[2]._id, // Gmail: Send email
        currentStep: 2,
        completedSteps: [1],
        percentage: 40,
        status: 'in_progress',
        practiceCompleted: false,
        lastAccessedAt: new Date(Date.now() - 86400000)
      },
      {
        _id: new mongoose.Types.ObjectId('662222222222222222222203'),
        userId: demoUsers[0]._id,
        lessonId: predefinedLessons[4]._id, // Google Meet: Join
        currentStep: 3,
        completedSteps: [1, 2, 3],
        percentage: 100,
        status: 'completed',
        practiceCompleted: true,
        practiceScore: 100,
        lastAccessedAt: new Date(Date.now() - 172800000)
      }
    ];
    inMemoryStore.progress = [...sampleProgress];

    // Sample safety checks
    const sampleSafetyChecks = [
      {
        _id: new mongoose.Types.ObjectId('663333333333333333333301'),
        userId: demoUsers[0]._id,
        type: 'message',
        queryContent: 'Dear customer, your electricity power will be disconnected at 9:30 PM tonight due to pending bill. Call officer immediately at 9876543210 to update payment.',
        riskLevel: 'dangerous',
        riskScore: 92,
        headline: '⚠️ Highly Suspicious: Fake Electricity Disconnection Scam',
        reasons: [
          'Creates false panic with an urgent threat of power cutoff tonight.',
          'Asks you to call a private mobile number instead of official electricity board offices.',
          'Legitimate utility departments provide registered bills and formal advance notice by mail.'
        ],
        actionAdvice: [
          'DO NOT call the phone number in the message.',
          'DO NOT transfer any money or share card/UPI numbers.',
          'Check your official electricity bill physically or ask your family to verify online.'
        ],
        flaggedKeywords: ['electricity power', 'disconnected tonight', 'call immediately', 'pending bill'],
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        _id: new mongoose.Types.ObjectId('663333333333333333333302'),
        userId: demoUsers[0]._id,
        type: 'link',
        queryContent: 'http://lottery-claim-prize-free2026.xyz/win',
        riskLevel: 'dangerous',
        riskScore: 98,
        headline: '🚨 High Danger: Fraudulent Lottery / Phishing Link',
        reasons: [
          'Unrecognized suspicious web address ending in .xyz.',
          'Promises unearned lottery or prize money to steal personal information.',
          'Contains no verified digital security certificate.'
        ],
        actionAdvice: [
          'Never click or open this link.',
          'Delete the message or block the unknown sender.',
          'Remember: Real lotteries never send random links via SMS.'
        ],
        flaggedKeywords: ['lottery-claim', 'free2026', '.xyz'],
        createdAt: new Date(Date.now() - 86400000)
      }
    ];
    inMemoryStore.safetyChecks = [...sampleSafetyChecks];

    // Family connection: Rahul connected to Asha
    const sampleConnections = [
      {
        _id: new mongoose.Types.ObjectId('664444444444444444444401'),
        seniorUserId: demoUsers[0]._id,
        familyUserId: demoUsers[4]._id,
        relation: 'Son',
        status: 'active'
      }
    ];
    inMemoryStore.familyConnections = [...sampleConnections];

    // Family notes
    const sampleNotes = [
      {
        _id: new mongoose.Types.ObjectId('665555555555555555555501'),
        seniorUserId: demoUsers[0]._id,
        senderUserId: demoUsers[4]._id,
        senderName: 'Rahul',
        senderRelation: 'Son',
        message: 'So proud of you Mom for completing the Google Meet lesson! Let’s have our family video call this Sunday! ❤️',
        emoji: '🌟',
        readBySenior: true,
        createdAt: new Date(Date.now() - 12000000)
      }
    ];
    inMemoryStore.familyNotes = [...sampleNotes];

    // If live MongoDB is connected, persist to MongoDB
    if (isMongoLive) {
      for (const u of demoUsers) {
        await User.findByIdAndUpdate(u._id, u, { upsert: true, new: true });
      }
      for (const l of predefinedLessons) {
        await Lesson.findByIdAndUpdate(l._id, l, { upsert: true, new: true });
      }
      for (const p of sampleProgress) {
        await LearningProgress.findByIdAndUpdate(p._id, p, { upsert: true, new: true });
      }
      for (const s of sampleSafetyChecks) {
        await SafetyCheck.findByIdAndUpdate(s._id, s, { upsert: true, new: true });
      }
      for (const c of sampleConnections) {
        await FamilyConnection.findByIdAndUpdate(c._id, c, { upsert: true, new: true });
      }
      for (const n of sampleNotes) {
        await FamilyNote.findByIdAndUpdate(n._id, n, { upsert: true, new: true });
      }
      console.log('[Seed] Database successfully populated in MongoDB.');
    } else {
      console.log('[Seed] Seed data successfully populated in In-Memory Resilience Store.');
    }

    return true;
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    return false;
  }
};

// Allow running directly: node src/seeds/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().then(() => {
    console.log('[Seed] Done.');
    process.exit(0);
  });
}
