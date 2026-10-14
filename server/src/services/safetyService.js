/**
 * Safety Service for ElderEase
 * Evaluates messages, links, and payments for senior cyber-safety
 */

const SCAM_PATTERNS = [
  {
    category: 'Electricity / Utility Threat',
    regex: /(electricity|power|bill|disconnected|tonight|light cut|bijli|urja)/i,
    weight: 45,
    reason: 'Mentions electricity or utility disconnection tonight. This is one of the most widespread scam formats used to induce panic.'
  },
  {
    category: 'Fake Urgency / Pressure',
    regex: /(urgent|immediately|within 2 hours|tonight at \d+|hurry|last warning|blocked today)/i,
    weight: 25,
    reason: 'Creates extreme artificial urgency to rush you into acting without consulting your family.'
  },
  {
    category: 'OTP / Credential Solicitation',
    regex: /(otp|pin|password|cvv|secret code|six digit|atm card)/i,
    weight: 45,
    reason: 'Explicitly requests or talks about OTP, PIN, or password. Legitimate companies never ask you to share these codes.'
  },
  {
    category: 'Lottery / Prize / Free Money',
    regex: /(lottery|won|winner|lakhs|crores|prize|kbc|reward points|cashback of \d+)/i,
    weight: 40,
    reason: 'Promises unexpected prize money, lottery winnings, or cashback. Real lotteries do not inform winners via random messages.'
  },
  {
    category: 'Bank Account / KYC Suspension',
    regex: /(kyc|pan card|aadhaar|account suspended|deactivated|bank blocked|update immediately)/i,
    weight: 30,
    reason: 'Claims your bank account or KYC will be frozen immediately unless you click a link or call a personal phone number.'
  },
  {
    category: 'Dangerous File or App Download',
    regex: /(\.apk|download app|anydesk|teamviewer|quicksupport|install)/i,
    weight: 45,
    reason: 'Instructs you to install an unknown APK file or remote control app that can take over your phone.'
  },
  {
    category: 'Suspicious Domain / Link',
    regex: /(bit\.ly|tinyurl\.com|is\.gd|\.xyz|\.top|\.ru|\.click|free-money|update-bill)/i,
    weight: 35,
    reason: 'Uses shortened or unusual web links designed to hide where the website actually leads.'
  }
];

export const analyzeSafetyQuery = ({ type = 'message', content = '' }) => {
  const text = (content || '').trim();
  if (!text) {
    return {
      riskLevel: 'caution',
      riskScore: 20,
      headline: 'No message provided to check',
      reasons: ['Please type or paste the message you would like to inspect.'],
      actionAdvice: ['Copy the full SMS or message text and check again.'],
      flaggedKeywords: []
    };
  }

  let totalScore = 0;
  const detectedReasons = [];
  const flaggedKeywords = [];

  for (const pattern of SCAM_PATTERNS) {
    if (pattern.regex.test(text)) {
      totalScore += pattern.weight;
      detectedReasons.push(pattern.reason);

      const matches = text.match(pattern.regex);
      if (matches && matches[0]) {
        flaggedKeywords.push(matches[0]);
      }
    }
  }

  // URL-specific checks
  if (type === 'link' || /https?:\/\//i.test(text)) {
    if (/xyz|top|work|loan|win|apk/i.test(text)) {
      totalScore += 25;
      detectedReasons.push('The web link uses an unfamiliar or high-risk domain extension (.xyz, .top, etc.).');
    }
    if (!text.startsWith('https://')) {
      totalScore += 15;
      detectedReasons.push('The website does not use a verified secure connection (https:// is missing).');
    }
  }

  // Cap score at 100
  const normalizedScore = Math.min(Math.max(totalScore, 5), 98);

  let riskLevel = 'safe';
  let headline = '✅ This message looks normal and low risk';

  if (normalizedScore >= 70) {
    riskLevel = 'dangerous';
    headline = '🚨 Highly Dangerous: Strong Signs of an Online Scam!';
  } else if (normalizedScore >= 40) {
    riskLevel = 'suspicious';
    headline = '⚠️ Suspicious: Please Exercise Caution!';
  } else if (normalizedScore >= 20) {
    riskLevel = 'caution';
    headline = '🔍 Caution: Keep a watchful eye';
  }

  if (detectedReasons.length === 0) {
    detectedReasons.push('No obvious scam triggers or urgency threats detected in the text.');
  }

  const actionAdvice = [];
  if (riskLevel === 'dangerous' || riskLevel === 'suspicious') {
    actionAdvice.push('DO NOT click any blue links or phone numbers inside this message.');
    actionAdvice.push('DO NOT share any 4-digit or 6-digit OTP or PIN with anyone.');
    actionAdvice.push('Show this message to a family member or call your official bank/utility customer service directly.');
    actionAdvice.push('ElderEase Reminder: We will NEVER ask you for your passwords or bank codes.');
  } else {
    actionAdvice.push('Always remember: Never share your OTP, ATM PIN, or passwords with anyone.');
    actionAdvice.push('If in doubt, you can always ask a family member or come back to ElderEase.');
  }

  return {
    type,
    queryContent: text,
    riskLevel,
    riskScore: normalizedScore,
    headline,
    reasons: detectedReasons,
    actionAdvice,
    flaggedKeywords: Array.from(new Set(flaggedKeywords))
  };
};

export const COMMON_SCAM_GUIDES = [
  {
    id: 'scam-electricity-bill',
    title: 'The "Electricity Bill" Disconnection Scam',
    icon: '⚡',
    shortDescription: 'Scammers claim your power will be cut tonight unless you call a personal number.',
    howItWorks: 'You receive an SMS saying your power bill is unpaid and light will be disconnected by 9:30 PM. They give a 10-digit phone number.',
    redFlags: ['Urgent threat of power disconnection tonight', 'Gives a mobile number instead of official power board', 'Demands money via an unknown payment link'],
    whatToDo: 'Never call that number. Pay your electric bill only through official government counters or verified apps like Electricity Board websites.'
  },
  {
    id: 'scam-lottery-kbc',
    title: 'The "Lottery / Lucky Draw" Scam',
    icon: '🎁',
    shortDescription: 'Messages claiming you won ₹25 Lakhs or a new car in a lucky draw.',
    howItWorks: 'They ask you to pay a "processing fee" or "tax" of ₹2,000 to release your prize money.',
    redFlags: ['You never bought a lottery ticket but won anyway', 'They ask for advance fees or bank details to send your prize'],
    whatToDo: 'Block and delete the message. Remember: You cannot win a lottery you never entered.'
  },
  {
    id: 'scam-fake-courier',
    title: 'The "Courier Parcel Undelivered" Scam',
    icon: '📦',
    shortDescription: 'Fake SMS saying a parcel is waiting, click link to update your home address.',
    howItWorks: 'Clicking the link asks for ₹5 address re-routing fee, but secretly tries to steal your card details.',
    redFlags: ['You did not order anything recently', 'Urgent link with unknown address ending in .xyz or short link'],
    whatToDo: 'Do not click the link. If you are expecting a parcel, check the official website where you purchased the item.'
  },
  {
    id: 'scam-digital-arrest',
    title: 'The "Digital Arrest / Police" Threat Scam',
    icon: '👮',
    shortDescription: 'Fraudsters pretending to be Police or CBI on video calls claiming legal trouble.',
    howItWorks: 'Scammers wear fake uniforms on video calls and threaten you with arrest unless you transfer money to a "safety escrow account".',
    redFlags: ['Government agencies and police NEVER interrogate citizens on Skype or WhatsApp video', 'Demands immediate money transfer to avoid jail'],
    whatToDo: 'Disconnect immediately. Dial 1930 (National Cyber Crime Helpline) or inform your family immediately. There is no legal concept called "Digital Arrest".'
  }
];
