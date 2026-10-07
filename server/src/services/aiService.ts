import { prisma } from '../prisma';
import { config } from '../config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VisualTargetData {
  type: 'app_icon' | 'button' | 'action_symbol';
  name: string;
  description: string;
  icon: 'whatsapp' | 'video-camera' | 'youtube' | 'camera' | 'send-arrow' | 'search';
  badgeColor?: string;
}

export type UserIntent =
  | 'CURRENT_STEP_QUESTION'
  | 'LOCATION_QUERY'
  | 'APPEARANCE_QUERY'
  | 'WHY_QUERY'
  | 'CONFUSION'
  | 'STEP_CONFIRMED'
  | 'NEXT_STEP'
  | 'PREV_STEP'
  | 'REPEAT_REQUEST'
  | 'HELP_REQUEST'
  | 'WHAT_DO_I_SEE'
  | 'STOP_TASK'
  | 'TASK_REQUEST'
  | 'GENERAL_QUESTION'
  | 'SCAM_WARNING'
  | 'FAMILY_HELP';

export type AssistantAction =
  | 'EXPLAIN'
  | 'START_TASK'
  | 'NEXT_STEP'
  | 'PREV_STEP'
  | 'REPEAT'
  | 'STOP_TASK'
  | 'CALL_FAMILY'
  | 'NONE';

export interface AiChatContext {
  userId?: string;
  seniorId?: string;
  language?: 'mr' | 'hi' | 'en';
  voiceSpeed?: 'SLOW' | 'NORMAL';
  voiceEnabled?: boolean;
  currentTaskSlug?: string;
  currentStepIndex?: number;
  lastInstruction?: string;
  lastAIResponse?: string;
  userConfusionLevel?: number; // 1 to 4
}

export interface AiChatResponse {
  message: string;
  reply: string; // for backward compatibility
  intent: UserIntent;
  action: AssistantAction;
  speak: boolean;
  visualTarget?: VisualTargetData;
  mode: 'CONVERSATION' | 'GUIDED_TASK';
  taskId?: string;
  taskSlug?: string;
  taskTitle?: string;
  taskStep?: number;
  explanationLevel?: number;
  language: string;
  suggestedAction?: string;
}

export class AiService {
  /**
   * Main conversational assistant with context awareness, multi-level explanations,
   * visual targets, and turn-taking state.
   */
  static async chat(
    userMessage: string,
    history: ChatMessage[] = [],
    context: AiChatContext = {}
  ): Promise<AiChatResponse> {
    const lang = (context.language || 'mr') as 'mr' | 'hi' | 'en';
    const voiceEnabled = context.voiceEnabled !== false;
    const cleanMsg = userMessage.trim().toLowerCase();

    // 1. If currently in a guided task, prioritize in-task contextual understanding & follow-up
    if (context.currentTaskSlug) {
      const taskResponse = await this.handleTaskConversation(
        cleanMsg,
        userMessage,
        context,
        lang,
        voiceEnabled
      );
      if (taskResponse) {
        return taskResponse;
      }
    }

    // 2. Intent Detection to initiate one of the 3 Guided Tasks
    const taskIntent = await this.detectTaskInitiation(cleanMsg, lang, voiceEnabled);
    if (taskIntent) {
      return taskIntent;
    }

    // 3. Try live external LLM if key is configured, with conversational context
    if (config.aiApiKey) {
      try {
        const externalReply = await this.callExternalLLM(userMessage, history, { lang, context });
        if (externalReply) {
          return {
            message: externalReply,
            reply: externalReply,
            intent: 'GENERAL_QUESTION',
            action: 'NONE',
            speak: voiceEnabled,
            mode: 'CONVERSATION',
            language: lang,
          };
        }
      } catch (err) {
        console.warn('[External AI Failed, using built-in conversational companion]:', err);
      }
    }

    // 4. Built-in Patient, Mature Female Conversational Companion
    return this.generateEmpathicConversation(cleanMsg, userMessage, lang, voiceEnabled, context);
  }

  /**
   * Deep in-task conversational engine handling follow-ups, confusion levels,
   * visual queries, commands, and turn taking during an active step.
   */
  private static async handleTaskConversation(
    cleanMsg: string,
    originalMsg: string,
    context: AiChatContext,
    lang: 'mr' | 'hi' | 'en',
    voiceEnabled: boolean
  ): Promise<AiChatResponse | null> {
    const taskSlug = context.currentTaskSlug!;
    const stepIndex = context.currentStepIndex ?? 0;
    const currentLevel = context.userConfusionLevel ?? 1;

    // Fetch the task and its steps from database
    let task: any = null;
    try {
      task = await prisma.task.findFirst({
        where: { slug: taskSlug },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });
    } catch (e) {
      console.warn('Error loading task for interruption:', e);
    }

    if (!task || !task.steps || task.steps.length === 0) {
      return null;
    }

    const steps = task.steps;
    const activeStep = steps[Math.min(stepIndex, steps.length - 1)];
    const visual = this.getVisualTargetForStep(taskSlug, stepIndex, lang);

    // Intent Classifiers
    const isRepeat =
      cleanMsg.includes('repeat') ||
      cleanMsg.includes('again') ||
      cleanMsg.includes('फिर से') ||
      cleanMsg.includes('पुन्हा सांगा') ||
      cleanMsg.includes('एकदा पुन्हा') ||
      cleanMsg.includes('दोबारा') ||
      cleanMsg.includes('say that again');

    const isHelp =
      cleanMsg.includes('need help') ||
      cleanMsg.includes('help me') ||
      cleanMsg.includes('मदत हवी') ||
      cleanMsg.includes('मदत करा') ||
      cleanMsg.includes('मदद चाहिए') ||
      cleanMsg.includes('मदद करो') ||
      cleanMsg === 'help' ||
      cleanMsg === 'मदत' ||
      cleanMsg === 'मदद' ||
      cleanMsg.includes('सहायता');

    const isLocationQuery =
      cleanMsg.includes('kahan hai') ||
      cleanMsg.includes('kahan') ||
      cleanMsg.includes('कहाँ') ||
      cleanMsg.includes('कहा है') ||
      cleanMsg.includes('where is') ||
      cleanMsg.includes('where') ||
      cleanMsg.includes('कुठे आहे') ||
      cleanMsg.includes('कुठे सापडेल') ||
      cleanMsg.includes('nahi mil raha') ||
      cleanMsg.includes('nahi mil') ||
      cleanMsg.includes('नहीं मिल') ||
      cleanMsg.includes("can't find") ||
      cleanMsg.includes('cannot find') ||
      cleanMsg.includes('सापडत नाही') ||
      cleanMsg.includes('which place');

    const isAppearanceQuery =
      cleanMsg.includes('kaise dikhta hai') ||
      cleanMsg.includes('kaisa dikhta hai') ||
      cleanMsg.includes('kaisa dikhta') ||
      cleanMsg.includes('kaise dikhta') ||
      cleanMsg.includes('what does it look like') ||
      cleanMsg.includes('how does it look') ||
      cleanMsg.includes('कसा दिसतो') ||
      cleanMsg.includes('कशी दिसते') ||
      cleanMsg.includes('कैसा दिखता') ||
      cleanMsg.includes('कैसी दिखती') ||
      cleanMsg.includes('which icon') ||
      cleanMsg.includes('kaun sa icon') ||
      cleanMsg.includes('कोणता आयकॉन') ||
      cleanMsg.includes('symbol');

    const isWhyQuery =
      cleanMsg.includes('kyun') ||
      cleanMsg.includes('why') ||
      cleanMsg.includes('का') ||
      cleanMsg.includes('कशासाठी') ||
      cleanMsg.includes('क्यों') ||
      cleanMsg.includes('reason');

    const isConfusion =
      cleanMsg.includes("don't understand") ||
      cleanMsg.includes('not understanding') ||
      cleanMsg.includes('confused') ||
      cleanMsg.includes('samajh nahi') ||
      cleanMsg.includes('samajh me nahi') ||
      cleanMsg.includes('samajh nahi aaya') ||
      cleanMsg.includes('samajh nahi aa raha') ||
      cleanMsg.includes('samajhla nahi') ||
      cleanMsg.includes('samajat nahi') ||
      cleanMsg.includes('kalat nahi') ||
      cleanMsg.includes('explain again') ||
      cleanMsg.includes('समझ नहीं') ||
      cleanMsg.includes('समझ में नहीं') ||
      cleanMsg.includes('समजलं नाही') ||
      cleanMsg.includes('समजले नाही') ||
      cleanMsg.includes('कळत नाही') ||
      cleanMsg.includes('कठीण') ||
      cleanMsg.includes('mushkil') ||
      cleanMsg.includes('difficult');

    const isWhatDoISee =
      cleanMsg.includes('bahut saare icons') ||
      cleanMsg.includes('many icons') ||
      cleanMsg.includes('screen par kya') ||
      cleanMsg.includes('खूप आयकॉन') ||
      cleanMsg.includes('screen var') ||
      cleanMsg.includes('what do i see');

    const isStepConfirmed =
      cleanMsg.includes('mil gaya') ||
      cleanMsg.includes('found it') ||
      cleanMsg.includes('सापडले') ||
      cleanMsg.includes('दिख गया') ||
      cleanMsg.includes('got it') ||
      cleanMsg.includes('saw it');

    const isNext =
      cleanMsg.includes('kar diya') ||
      cleanMsg.includes('done') ||
      cleanMsg.includes('next') ||
      cleanMsg.includes('आगे') ||
      cleanMsg.includes('हो गया') ||
      cleanMsg.includes('झाले') ||
      cleanMsg.includes('पुढे चला') ||
      cleanMsg.includes('पुढची पायरी');

    const isPrev =
      cleanMsg.includes('go back') ||
      cleanMsg.includes('back') ||
      cleanMsg.includes('peechhe') ||
      cleanMsg.includes('पीछे') ||
      cleanMsg.includes('मागे जा') ||
      cleanMsg.includes('मागची पायरी') ||
      cleanMsg.includes('mistake') ||
      cleanMsg.includes('galti') ||
      cleanMsg.includes('गलती') ||
      cleanMsg.includes('चूक') ||
      cleanMsg.includes('previous');

    const isStop =
      cleanMsg.includes('stop') ||
      cleanMsg.includes('pause') ||
      cleanMsg.includes('रुक जाओ') ||
      cleanMsg.includes('बंद करो') ||
      cleanMsg.includes('थांबा') ||
      cleanMsg.includes('cancel');

    const isFamily =
      cleanMsg.includes('family') ||
      cleanMsg.includes('daughter') ||
      cleanMsg.includes('priya') ||
      cleanMsg.includes('परिवार') ||
      cleanMsg.includes('बेटी') ||
      cleanMsg.includes('मुलगी') ||
      cleanMsg.includes('कुटुंब');

    // 1. REPEAT REQUEST: Re-speaks current instruction faithfully
    if (isRepeat) {
      let msg = '';
      if (lang === 'mr') {
        msg = `मी पुन्हा सांगते: ${activeStep.instructionMr}`;
      } else if (lang === 'hi') {
        msg = `मैं फिर से बताती हूँ: ${activeStep.instructionHi}`;
      } else {
        msg = `I will say it again: ${activeStep.instructionEn}`;
      }
      return {
        message: msg,
        reply: msg,
        intent: 'REPEAT_REQUEST',
        action: 'REPEAT',
        speak: voiceEnabled,
        visualTarget: visual,
        mode: 'CONVERSATION',
        taskSlug,
        taskStep: stepIndex + 1,
        language: lang,
      };
    }

    // 2. HELP REQUEST ("I need help", "मदद चाहिए", "मदत हवी आहे")
    if (isHelp) {
      let msg = '';
      const helpText = lang === 'mr' ? activeStep.helpMr : lang === 'hi' ? activeStep.helpHi : activeStep.helpEn;
      if (lang === 'mr') {
        msg = `मी नक्की मदत करते. ${helpText || activeStep.instructionMr}`;
      } else if (lang === 'hi') {
        msg = `मैं आपकी मदद करती हूँ। ${helpText || activeStep.instructionHi}`;
      } else {
        msg = `I am right here to help you. ${helpText || activeStep.instructionEn}`;
      }

      return {
        message: msg,
        reply: msg,
        intent: 'HELP_REQUEST',
        action: 'EXPLAIN',
        speak: voiceEnabled,
        visualTarget: visual,
        mode: 'CONVERSATION',
        taskSlug,
        taskStep: stepIndex + 1,
        language: lang,
      };
    }

    // 3. LOCATION QUERY ("Kahan hai?", "Where is it?", "Mujhe nahi mil raha")
    if (isLocationQuery) {
      let msg = '';
      const isCantFind =
        cleanMsg.includes('nahi mil') ||
        cleanMsg.includes('नहीं मिल') ||
        cleanMsg.includes("can't find") ||
        cleanMsg.includes('cannot find') ||
        cleanMsg.includes('सापडत नाही');

      if (taskSlug === 'whatsapp-photo' && stepIndex === 0) {
        if (isCantFind) {
          if (lang === 'mr') {
            msg = 'काही काळजी करू नका. आधी व्हॉट्सॲपचा आयकॉन शोधूया. मी तुम्हाला सांगते की तो कसा दिसतो.';
          } else if (lang === 'hi') {
            msg = 'कोई बात नहीं। पहले व्हाट्सएप का आइकन ढूंढते हैं। मैं आपको बताती हूँ कि वह कैसा दिखता है।';
          } else {
            msg = "No problem. Let's find the WhatsApp icon first. I will show you what it looks like.";
          }
        } else {
          if (lang === 'mr') {
            msg = 'व्हॉट्सॲप तुमच्या फोनच्या मुख्य स्क्रीनवर आहे. हिरव्या रंगाचा गोल आयकॉन शोधा, ज्यामध्ये पांढरा फोन आहे. मी खाली त्याचे चित्रही दाखवले आहे.';
          } else if (lang === 'hi') {
            msg = 'व्हाट्सएप आपके फोन की होम स्क्रीन पर है। यह हरे रंग का गोल निशान है जिसके अंदर सफेद फोन बना है। मैंने नीचे इसका चित्र भी दिखाया है।';
          } else {
            msg = 'WhatsApp is on your phone home screen. Look for the green round icon with a white phone symbol inside. I have shown it below.';
          }
        }
      } else if (taskSlug === 'whatsapp-photo' && stepIndex === 2) {
        // Camera icon location
        if (lang === 'mr') {
          msg = 'खाली जिथे मेसेज लिहितात, त्या जागेच्या उजव्या बाजूला एक लहान कॅमेरा दिसेल.';
        } else if (lang === 'hi') {
          msg = 'नीचे जहाँ आप मैसेज लिखते हैं, उस पट्टी के ठीक पास छोटा कैमरा बना होगा।';
        } else {
          msg = 'Look near the bottom where you type messages. You will see a small camera symbol right there.';
        }
      } else if (taskSlug === 'video-call' && stepIndex === 1) {
        // Video call icon location
        if (lang === 'mr') {
          msg = 'स्क्रीनच्या अगदी वरच्या उजव्या कोपऱ्यात पाहा. तिथे लहान व्हिडिओ कॅमेरा दिसेल.';
        } else if (lang === 'hi') {
          msg = 'स्क्रीन के सबसे ऊपर, दाईं तरफ देखिए। वहाँ एक छोटा वीडियो कैमरा बना है।';
        } else {
          msg = 'Look at the very top right corner of your screen. You will see a small video camera icon.';
        }
      } else {
        const helpText = lang === 'mr' ? activeStep.helpMr : lang === 'hi' ? activeStep.helpHi : activeStep.helpEn;
        msg = helpText || activeStep.instructionEn;
      }

      return {
        message: msg,
        reply: msg,
        intent: 'LOCATION_QUERY',
        action: 'EXPLAIN',
        speak: voiceEnabled,
        visualTarget: visual,
        mode: 'CONVERSATION',
        taskSlug,
        taskStep: stepIndex + 1,
        explanationLevel: 2,
        language: lang,
      };
    }

    // 4. APPEARANCE QUERY ("Kaise dikhta hai?", "What does it look like?", "कसा दिसतो?")
    if (isAppearanceQuery) {
      let msg = '';
      if (taskSlug === 'whatsapp-photo' && stepIndex === 0) {
        if (lang === 'mr') {
          msg = 'व्हॉट्सॲपचा आयकॉन हिरवा असतो. त्याच्या आत पांढरा फोन असतो. स्क्रीनवर तोच आयकॉन शोधायला मी तुम्हाला मदत करते.';
        } else if (lang === 'hi') {
          msg = 'व्हाट्सएप का आइकन हरा होता है। उसके अंदर सफेद रंग का फोन बना होता है। मैं स्क्रीन पर उसी निशान को ढूंढने में आपकी मदद करूंगी।';
        } else {
          msg = 'The WhatsApp icon is green with a white phone symbol inside. I will help you spot that symbol on your screen.';
        }
      } else if (visual) {
        if (lang === 'mr') {
          msg = `${visual.name} चे चिन्ह: ${visual.description}. मी स्क्रीनवर याचे उदाहरण दाखवले आहे.`;
        } else if (lang === 'hi') {
          msg = `${visual.name} का निशान: ${visual.description}। मैंने नीचे इसका उदाहरण भी दिखाया है।`;
        } else {
          msg = `The ${visual.name} symbol: ${visual.description}. I have highlighted an example right below.`;
        }
      } else {
        const helpText = lang === 'mr' ? activeStep.helpMr : lang === 'hi' ? activeStep.helpHi : activeStep.helpEn;
        msg = helpText || activeStep.instructionEn;
      }

      return {
        message: msg,
        reply: msg,
        intent: 'APPEARANCE_QUERY',
        action: 'EXPLAIN',
        speak: voiceEnabled,
        visualTarget: visual,
        mode: 'CONVERSATION',
        taskSlug,
        taskStep: stepIndex + 1,
        explanationLevel: 2,
        language: lang,
      };
    }

    // 4. WHY QUERY ("Why do I need to open it?", "Kyun kholna hai?")
    if (isWhyQuery) {
      let msg = '';
      if (taskSlug === 'whatsapp-photo' && stepIndex === 0) {
        if (lang === 'mr') {
          msg = 'फोटो पाठवण्याची सुविधा व्हॉट्सॲपच्या आत असते. म्हणूनच आपल्याला आधी व्हॉट्सॲप उघडावे लागेल.';
        } else if (lang === 'hi') {
          msg = 'फोटो भेजने की सुविधा व्हाट्सएप के अंदर ही होती है। इसलिए हमें सबसे पहले व्हाट्सएप खोलना है।';
        } else {
          msg = 'Photos are sent through WhatsApp, which is why we open the app first.';
        }
      } else {
        if (lang === 'mr') {
          msg = 'हे पाऊल उचलल्याने आपले काम सुरक्षित आणि योग्य पद्धतीने पूर्ण होईल.';
        } else if (lang === 'hi') {
          msg = 'इस कदम को करने से हमारा काम सही और सुरक्षित तरीके से आगे बढ़ेगा।';
        } else {
          msg = 'Completing this step ensures our task proceeds smoothly and safely.';
        }
      }

      return {
        message: msg,
        reply: msg,
        intent: 'WHY_QUERY',
        action: 'EXPLAIN',
        speak: voiceEnabled,
        visualTarget: visual,
        mode: 'CONVERSATION',
        taskSlug,
        taskStep: stepIndex + 1,
        language: lang,
      };
    }

    // 5. WHAT DO I SEE QUERY ("Screen par bahut saare icons hain")
    // HONEST SCREEN UNDERSTANDING: Never claim to see screen if not technically possible!
    if (isWhatDoISee) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'काही काळजी करू नका. स्क्रीनवर काय काय दिसत आहे ते मला सांगा, मी योग्य चिन्ह ओळखायला मदत करते.';
      } else if (lang === 'hi') {
        msg = 'कोई बात नहीं। आप मुझे बताइए कि स्क्रीन पर क्या-क्या दिख रहा है, मैं आपको सही निशान पहचानने में मदद करती हूँ।';
      } else {
        msg = 'Do not worry. Tell me what icons or colors you see on your screen, and I will help you spot the right one.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'WHAT_DO_I_SEE',
        action: 'EXPLAIN',
        speak: voiceEnabled,
        visualTarget: visual,
        mode: 'CONVERSATION',
        taskSlug,
        taskStep: stepIndex + 1,
        explanationLevel: 4,
        language: lang,
      };
    }

    // 6. CONFUSION / "I DON'T UNDERSTAND" ("Mujhe samajh nahi aaya")
    // Advance explanation level progressively (Level 2 -> 3 -> 4) and NEVER repeat same wording!
    if (isConfusion) {
      const nextLevel = Math.min((currentLevel || 1) + 1, 4);
      let explanation = '';

      if (nextLevel === 2) {
        // Level 2: More descriptive (color, shape, placement)
        if (lang === 'mr') {
          explanation = `काही काळजी करू नका. मी आणखी सोपे करून सांगते: ${activeStep.helpMr || activeStep.instructionMr}`;
        } else if (lang === 'hi') {
          explanation = `कोई बात नहीं। मैं इसे और आसान तरीके से बताती हूँ: ${activeStep.helpHi || activeStep.instructionHi}`;
        } else {
          explanation = `Don't worry. Let me explain in simpler words: ${activeStep.helpEn || activeStep.instructionEn}`;
        }
      } else if (nextLevel === 3) {
        // Level 3: Concrete visual target and exact finger action
        if (visual) {
          if (lang === 'mr') {
            explanation = `स्क्रीनवर खाली दाखवलेले चित्र पाहा. ${visual.description}. त्यावर फक्त एकदा हळूच बोट ठेवा.`;
          } else if (lang === 'hi') {
            explanation = `स्क्रीन पर नीचे दिखाए गए चित्र को देखिए। ${visual.description}। उस पर सिर्फ एक बार हल्के से टैप कीजिए।`;
          } else {
            explanation = `Look at the picture shown below. ${visual.description}. Simply tap it once gently.`;
          }
        } else {
          explanation = lang === 'mr' ? activeStep.instructionMr : lang === 'hi' ? activeStep.instructionHi : activeStep.instructionEn;
        }
      } else {
        // Level 4: Ask what they see
        if (lang === 'mr') {
          explanation = 'स्क्रीनवर आता कोणते रंग किंवा चिन्हे दिसत आहेत? मला सांगा, आपण मिळून शोधूया.';
        } else if (lang === 'hi') {
          explanation = 'आपकी स्क्रीन पर अभी कौन-कौन से निशान दिख रहे हैं? मुझे बताइए, हम मिलकर ढूंढेंगे।';
        } else {
          explanation = 'What do you see on your screen right now? Tell me and we will find it together.';
        }
      }

      return {
        message: explanation,
        reply: explanation,
        intent: 'CONFUSION',
        action: 'EXPLAIN',
        speak: voiceEnabled,
        visualTarget: visual,
        mode: 'CONVERSATION',
        taskSlug,
        taskStep: stepIndex + 1,
        explanationLevel: nextLevel,
        language: lang,
      };
    }

    // 7. STEP CONFIRMED ("Mil gaya", "Found it")
    if (isStepConfirmed) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'खूप छान! आता त्यावर एकदा हळूच बोट ठेवा.';
      } else if (lang === 'hi') {
        msg = 'बहुत अच्छा। अब उस पर एक बार हल्के से टैप कीजिए।';
      } else {
        msg = 'Wonderful. Now tap on it once gently.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'STEP_CONFIRMED',
        action: 'EXPLAIN',
        speak: voiceEnabled,
        visualTarget: visual,
        mode: 'CONVERSATION',
        taskSlug,
        taskStep: stepIndex + 1,
        language: lang,
      };
    }

    // 8. NEXT STEP COMMAND ("Kar diya", "Done", "Next")
    if (isNext) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'छान! आता आपण पुढची पायरी करूया.';
      } else if (lang === 'hi') {
        msg = 'शाबाश। अब अगला कदम करते हैं।';
      } else {
        msg = 'Great. Now let us move to the next step.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'NEXT_STEP',
        action: 'NEXT_STEP',
        speak: voiceEnabled,
        mode: 'GUIDED_TASK',
        taskSlug,
        taskStep: Math.min(stepIndex + 2, steps.length),
        language: lang,
      };
    }

    // 9. PREVIOUS STEP COMMAND ("Go back", "Peechhe jao")
    if (isPrev) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'काही हरकत नाही. आपण मागच्या पायरीवर परत जाऊया.';
      } else if (lang === 'hi') {
        msg = 'कोई बात नहीं। हम पिछले कदम पर वापस चलते हैं।';
      } else {
        msg = 'No problem. Let us go back to the previous step.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'PREV_STEP',
        action: 'PREV_STEP',
        speak: voiceEnabled,
        mode: 'GUIDED_TASK',
        taskSlug,
        taskStep: Math.max(stepIndex, 1),
        language: lang,
      };
    }

    // 10. STOP / PAUSE TASK COMMAND ("Stop", "Ruk jao")
    if (isStop) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'ठीक आहे, आपण इथेच थांबूया. तुम्हाला हवे तेव्हा आपण पुन्हा सुरू करू शकतो.';
      } else if (lang === 'hi') {
        msg = 'ठीक है, हम यहीं रुक जाते हैं। जब भी आप चाहें, हम फिर से शुरू कर सकते हैं।';
      } else {
        msg = 'Okay, we will pause here. You can start again whenever you are ready.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'STOP_TASK',
        action: 'STOP_TASK',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        taskSlug,
        language: lang,
      };
    }

    // 11. ASK FAMILY ("Family help")
    if (isFamily) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'काळजी करू नका. मी तुमच्या मुलीला (प्रिया) लगेच निरोप देते.';
      } else if (lang === 'hi') {
        msg = 'चिंता मत कीजिए। मैं आपकी बेटी (प्रिया) को तुरंत सूचना भेजती हूँ।';
      } else {
        msg = 'Do not worry. I will notify your daughter Priya right away.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'FAMILY_HELP',
        action: 'CALL_FAMILY',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    return null;
  }

  /**
   * Return authentic, descriptive VisualTarget metadata for the active step
   */
  private static getVisualTargetForStep(
    taskSlug: string,
    stepIndex: number,
    lang: 'mr' | 'hi' | 'en'
  ): VisualTargetData | undefined {
    if (taskSlug === 'whatsapp-photo') {
      if (stepIndex === 0) {
        return {
          type: 'app_icon',
          name: 'WhatsApp',
          icon: 'whatsapp',
          badgeColor: '#25D366',
          description:
            lang === 'mr'
              ? 'हिरवा गोल आयकॉन, ज्याच्या आत पांढरा फोन चिन्ह आहे'
              : lang === 'hi'
              ? 'हरा गोल आइकन, जिसके अंदर सफेद फोन बना है'
              : 'Green round icon with a white phone symbol inside',
        };
      }
      if (stepIndex === 1) {
        return {
          type: 'action_symbol',
          name: lang === 'mr' ? 'व्यक्तीचे नाव' : lang === 'hi' ? 'व्यक्ति का नाम' : 'Contact Name',
          icon: 'search',
          badgeColor: '#0284c7',
          description:
            lang === 'mr'
              ? 'यादीमध्ये तुमच्या कुटुंबियांचे किंवा मित्राचे नाव'
              : lang === 'hi'
              ? 'सूची में अपने परिवार के सदस्य या मित्र का नाम'
              : 'Name of your family member or friend in the list',
        };
      }
      if (stepIndex === 2) {
        return {
          type: 'button',
          name: lang === 'mr' ? 'कॅमेरा चिन्ह' : lang === 'hi' ? 'कैमरा आइकन' : 'Camera Icon',
          icon: 'camera',
          badgeColor: '#0f766e',
          description:
            lang === 'mr'
              ? 'मेसेज लिहिण्याच्या जागेजवळ लहान कॅमेऱ्याचे चिन्ह'
              : lang === 'hi'
              ? 'मैसेज लिखने की जगह के पास छोटा कैमरा निशान'
              : 'Small camera symbol next to the message box',
        };
      }
      if (stepIndex === 3) {
        return {
          type: 'button',
          name: lang === 'mr' ? 'सेंड बटण' : lang === 'hi' ? 'सेंड बटन' : 'Send Button',
          icon: 'send-arrow',
          badgeColor: '#16a34a',
          description:
            lang === 'mr'
              ? 'पांढरा बाण असलेले गोल हिरवे सेंड बटण'
              : lang === 'hi'
              ? 'सफेद तीर वाला गोल हरा सेंड बटन'
              : 'Round green button with a white send arrow',
        };
      }
    }

    if (taskSlug === 'video-call') {
      if (stepIndex === 0) {
        return {
          type: 'app_icon',
          name: 'WhatsApp',
          icon: 'whatsapp',
          badgeColor: '#25D366',
          description:
            lang === 'mr'
              ? 'हिरवा व्हॉट्सॲप आयकॉन उघडा आणि व्यक्ती निवडा'
              : lang === 'hi'
              ? 'हरा व्हाट्सएप आइकन खोलें और व्यक्ति चुनें'
              : 'Open green WhatsApp icon and select the person',
        };
      }
      if (stepIndex === 1) {
        return {
          type: 'button',
          name: lang === 'mr' ? 'व्हिडिओ कॉल' : lang === 'hi' ? 'वीडियो कॉल' : 'Video Call Camera',
          icon: 'video-camera',
          badgeColor: '#0284c7',
          description:
            lang === 'mr'
              ? 'स्क्रीनच्या वरच्या उजव्या बाजूला लहान व्हिडिओ कॅमेरा चिन्ह'
              : lang === 'hi'
              ? 'स्क्रीन के ऊपर दाईं तरफ छोटा वीडियो कैमरा निशान'
              : 'Small video camera icon at top right of the screen',
        };
      }
      if (stepIndex === 2) {
        return {
          type: 'action_symbol',
          name: lang === 'mr' ? 'फोन सरळ धरा' : lang === 'hi' ? 'फोन सामने रखें' : 'Hold Phone in Front',
          icon: 'video-camera',
          badgeColor: '#14b8a6',
          description:
            lang === 'mr'
              ? 'फोन चेहऱ्यासमोर स्थिर पकडा आणि बोला'
              : lang === 'hi'
              ? 'फोन अपने चेहरे के सामने सीधा रखें और बात करें'
              : 'Hold phone steadily in front of your face and smile',
        };
      }
    }

    if (taskSlug === 'youtube-video') {
      if (stepIndex === 0) {
        return {
          type: 'app_icon',
          name: 'YouTube',
          icon: 'youtube',
          badgeColor: '#FF0000',
          description:
            lang === 'mr'
              ? 'पांढरा प्ले त्रिकोण असलेला लाल चौकोनी आयकॉन'
              : lang === 'hi'
              ? 'सफेद प्ले त्रिकोण वाला लाल चौकोर आइकन'
              : 'Red square icon with a white play triangle',
        };
      }
      if (stepIndex === 1) {
        return {
          type: 'button',
          name: lang === 'mr' ? 'शोध चिन्ह' : lang === 'hi' ? 'सर्च लेंस' : 'Search Magnifier',
          icon: 'search',
          badgeColor: '#6366f1',
          description:
            lang === 'mr'
              ? 'वरच्या उजव्या कोपऱ्यातील लहान भिंग चिन्ह'
              : lang === 'hi'
              ? 'ऊपर दाईं ओर गोल लेंस (सर्च) का निशान'
              : 'Round magnifying glass search icon at top right',
        };
      }
      if (stepIndex === 2) {
        return {
          type: 'button',
          name: lang === 'mr' ? 'माइक चिन्ह' : lang === 'hi' ? 'माइक आइकन' : 'Search Mic',
          icon: 'search',
          badgeColor: '#0f766e',
          description:
            lang === 'mr'
              ? 'सर्च बारमध्ये लहान माइक दाबून नाव बोला'
              : lang === 'hi'
              ? 'सर्च बार में छोटा माइक दबाकर भजन या गाने का नाम बोलें'
              : 'Tap microphone icon in YouTube to speak the name',
        };
      }
      if (stepIndex === 3) {
        return {
          type: 'action_symbol',
          name: lang === 'mr' ? 'व्हिडिओ चित्र' : lang === 'hi' ? 'वीडियो तस्वीर' : 'Video Thumbnail',
          icon: 'youtube',
          badgeColor: '#dc2626',
          description:
            lang === 'mr'
              ? 'आवडलेल्या व्हिडिओच्या चित्रावर एकदा हळूच दाबा'
              : lang === 'hi'
              ? 'मनपसंद वीडियो की तस्वीर पर एक बार हल्के से टैप करें'
              : 'Tap the video picture thumbnail to start playing',
        };
      }
    }

    return undefined;
  }

  /**
   * Detect intent to initiate one of the 3 primary MVP tasks
   */
  private static async detectTaskInitiation(
    cleanMsg: string,
    lang: 'mr' | 'hi' | 'en',
    voiceEnabled: boolean
  ): Promise<AiChatResponse | null> {
    const isWhatsAppPhoto =
      cleanMsg.includes('photo') ||
      cleanMsg.includes('फोटो') ||
      cleanMsg.includes('चित्र') ||
      cleanMsg.includes('pic') ||
      cleanMsg.includes('picture') ||
      cleanMsg.includes('तस्वीर') ||
      (cleanMsg.includes('whatsapp') && !cleanMsg.includes('call'));

    const isVideoCall =
      cleanMsg.includes('video call') ||
      cleanMsg.includes('video') ||
      cleanMsg.includes('व्हिडिओ कॉल') ||
      cleanMsg.includes('व्हिडीओ कॉल') ||
      cleanMsg.includes('वीडियो कॉल') ||
      cleanMsg.includes('face call');

    const isYouTube =
      cleanMsg.includes('youtube') ||
      cleanMsg.includes('यूट्यूब') ||
      cleanMsg.includes('song') ||
      cleanMsg.includes('गाणी') ||
      cleanMsg.includes('गाना') ||
      cleanMsg.includes('भजन') ||
      cleanMsg.includes('recipe') ||
      cleanMsg.includes('cooking');

    let matchedSlug: string | null = null;
    if (isWhatsAppPhoto) matchedSlug = 'whatsapp-photo';
    else if (isVideoCall) matchedSlug = 'video-call';
    else if (isYouTube) matchedSlug = 'youtube-video';

    if (matchedSlug) {
      try {
        const task = await prisma.task.findFirst({
          where: { slug: matchedSlug },
        });

        if (task) {
          let msg = '';
          let taskTitle = task.titleEn || task.title;

          if (lang === 'mr') {
            taskTitle = task.titleMr || task.title;
            if (matchedSlug === 'whatsapp-photo') {
              msg = 'नक्कीच, मी तुमच्या सोबत आहे. आपण सावकाशपणे व्हॉट्सॲपवर फोटो पाठवायला शिकूया.';
            } else if (matchedSlug === 'video-call') {
              msg = 'मी तुमच्या सोबत आहे. व्हिडिओ कॉल करणे खूप सोपे आहे. आपण मिळून करूया.';
            } else {
              msg = 'मी मदत करते. यूट्यूबवर तुमचे आवडते गाणे किंवा भजन शोधूया.';
            }
          } else if (lang === 'hi') {
            taskTitle = task.titleHi || task.title;
            if (matchedSlug === 'whatsapp-photo') {
              msg = 'बिल्कुल। मैं आपके साथ हूँ। हम इसे धीरे-धीरे करेंगे।';
            } else if (matchedSlug === 'video-call') {
              msg = 'मैं आपके साथ हूँ। वीडियो कॉल करना बहुत आसान है। हम कदम-दर-कदम करेंगे।';
            } else {
              msg = 'मैं आपकी मदद करती हूँ। यूट्यूब पर आपके पसंदीदा भजन या गाने ढूंढते हैं।';
            }
          } else {
            if (matchedSlug === 'whatsapp-photo') {
              msg = 'I am right here with you. We will take this step by step together.';
            } else if (matchedSlug === 'video-call') {
              msg = "I am right here with you. Making a video call is very simple. Let's do it together.";
            } else {
              msg = "I will gladly help you find your favorite video on YouTube. Let's take it one step at a time.";
            }
          }

          const visual = this.getVisualTargetForStep(matchedSlug, 0, lang);

          return {
            message: msg,
            reply: msg,
            intent: 'TASK_REQUEST',
            action: 'START_TASK',
            speak: voiceEnabled,
            visualTarget: visual,
            mode: 'GUIDED_TASK',
            taskId: task.id,
            taskSlug: task.slug,
            taskTitle,
            taskStep: 1,
            language: lang,
          };
        }
      } catch (err) {
        console.warn('Error querying task by slug:', err);
      }
    }

    return null;
  }

  /**
   * Built-in natural conversational companion (warm, mature female helper)
   */
  private static async generateEmpathicConversation(
    cleanMsg: string,
    originalMsg: string,
    lang: 'mr' | 'hi' | 'en',
    voiceEnabled: boolean,
    context?: AiChatContext
  ): Promise<AiChatResponse> {
    // 0. Doctor / Appointment Query
    const isDoctorQuery =
      cleanMsg.includes('doctor') ||
      cleanMsg.includes('डॉक्टर') ||
      cleanMsg.includes('भेट') ||
      cleanMsg.includes('appointment') ||
      cleanMsg.includes('तपासणी') ||
      cleanMsg.includes('दवाखाना');

    if (isDoctorQuery) {
      let docName = 'Dr. Kulkarni (डॉ. कुलकर्णी)';
      if (context?.seniorId) {
        try {
          const apt = await prisma.appointment.findFirst({
            where: { seniorId: context.seniorId, status: 'SCHEDULED' },
            orderBy: { dateTime: 'asc' },
          });
          if (apt) {
            docName = apt.doctorName;
          }
        } catch (e) {
          // fallback
        }
      }

      const msg =
        lang === 'mr'
          ? `तुमची पुढची डॉक्टरांची भेट ${docName} यांच्याशी नियोजित आहे. आपण काळजी करू नका.`
          : lang === 'hi'
          ? `आपकी अगली डॉक्टर की मुलाकात ${docName} के साथ तय है।`
          : `Your next doctor appointment with ${docName} is scheduled.`;

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 1. Asking for family / daughter
    if (
      cleanMsg.includes('daughter') ||
      cleanMsg.includes('family') ||
      cleanMsg.includes('call') ||
      cleanMsg.includes('beta') ||
      cleanMsg.includes('mulgi') ||
      cleanMsg.includes('मुलगी') ||
      cleanMsg.includes('मदद') ||
      cleanMsg.includes('मदत') ||
      cleanMsg.includes('कुटुंब')
    ) {
      const msg =
        lang === 'mr'
          ? 'काळजी करू नका. तुम्ही "कुटुंबाची मदत" दाबू शकता, मी तुमच्या मुलीला (प्रिया) लगेच निरोप देते.'
          : lang === 'hi'
          ? 'चिंता मत कीजिए। आप "परिवार की मदद" दबा सकते हैं, मैं आपकी बेटी (प्रिया) को तुरंत सूचना भेजती हूँ।'
          : 'Do not worry. You can tap "Family Help", and I will notify your daughter Priya right away.';

      return {
        message: msg,
        reply: msg,
        intent: 'FAMILY_HELP',
        action: 'CALL_FAMILY',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        suggestedAction: 'FAMILY_HELP',
        language: lang,
      };
    }

    // 2. Confusion or mistake reassurance
    if (
      cleanMsg.includes('mistake') ||
      cleanMsg.includes('galti') ||
      cleanMsg.includes('चूक') ||
      cleanMsg.includes('चुकीचे') ||
      cleanMsg.includes('गलती') ||
      cleanMsg.includes('wrong')
    ) {
      const msg =
        lang === 'mr'
          ? 'काही हरकत नाही. आपण पुन्हा शांतपणे सुरू करू शकतो. तुम्ही निश्चिंत राहा, काहीही बिघडलेले नाही.'
          : lang === 'hi'
          ? 'कोई बात नहीं। हम फिर से कर सकते हैं। आप बिल्कुल परेशान न हों, सब ठीक है।'
          : "That is completely okay. We can try again together. Don't worry, nothing is broken.";

      return {
        message: msg,
        reply: msg,
        intent: 'CONFUSION',
        action: 'EXPLAIN',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 3. Security / Scam / OTP Query
    if (
      cleanMsg.includes('otp') ||
      cleanMsg.includes('pin') ||
      cleanMsg.includes('password') ||
      cleanMsg.includes('bank') ||
      cleanMsg.includes('scam') ||
      cleanMsg.includes('ओटीपी') ||
      cleanMsg.includes('पैसे')
    ) {
      const msg =
        lang === 'mr'
          ? 'सुरक्षिततेचा नियम: तुमचा OTP, बँक पासवर्ड किंवा पिन कोणालाही सांगू नका. बँक कधीही फोनवर OTP मागत नाही.'
          : lang === 'hi'
          ? 'सुरक्षा नियम: अपना ओटीपी, बैंक पासवर्ड या पिन किसी को न दें। बैंक कभी भी फोन पर ओटीपी नहीं मांगता।'
          : 'Important safety rule: Never share your OTP, bank PIN, or passwords with anyone over phone or messages.';

      return {
        message: msg,
        reply: msg,
        intent: 'SCAM_WARNING',
        action: 'EXPLAIN',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 4. Time, Clock & Date Query
    if (
      cleanMsg.includes('time') ||
      cleanMsg.includes('kitne baje') ||
      cleanMsg.includes('kiti vajle') ||
      cleanMsg.includes('वाजले') ||
      cleanMsg.includes('बजे') ||
      cleanMsg.includes('date') ||
      cleanMsg.includes('tarikh') ||
      cleanMsg.includes('तारीख') ||
      cleanMsg.includes('aaj kaun sa din') ||
      cleanMsg.includes('aaj cha divas') ||
      cleanMsg.includes('वार')
    ) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12
        ? (lang === 'mr' ? 'दुपार/संध्याकाळचे' : lang === 'hi' ? 'दोपहर/शाम के' : 'PM')
        : (lang === 'mr' ? 'सकाळचे' : lang === 'hi' ? 'सुबह के' : 'AM');
      const displayHours = hours % 12 || 12;

      let msg = '';
      if (lang === 'mr') {
        msg = `आता घड्याळात साधारण ${period} ${displayHours}:${minutes} झाले आहेत. दिवस शांत आणि आनंदी जावो.`;
      } else if (lang === 'hi') {
        msg = `अभी घड़ी में लगभग ${period} ${displayHours}:${minutes} बजे हैं। आपका दिन शुभ और सुखद रहे।`;
      } else {
        msg = `Right now it is approximately ${displayHours}:${minutes} ${period}. I hope you are having a peaceful day.`;
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 5. Weather & Season Query
    if (
      cleanMsg.includes('mausam') ||
      cleanMsg.includes('weather') ||
      cleanMsg.includes('havaman') ||
      cleanMsg.includes('हवामान') ||
      cleanMsg.includes('मौसम') ||
      cleanMsg.includes('barish') ||
      cleanMsg.includes('thand') ||
      cleanMsg.includes('garmi') ||
      cleanMsg.includes('पाऊस') ||
      cleanMsg.includes('थंडी')
    ) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'बाहेरचे वातावरण आल्हाददायक वाटते. तुम्ही खिडकीतून ताजी हवा घेऊ शकता. आवश्यक असल्यास हलकी शाल किंवा पाणी जवळ ठेवा.';
      } else if (lang === 'hi') {
        msg = 'बाहर का मौसम काफी सुहावना लग रहा है। आप खिड़की से ताजी हवा ले सकते हैं। थोड़ा पानी पिएं और आराम से बैठें।';
      } else {
        msg = 'The weather outside looks pleasant today. Feel free to enjoy some fresh air by the window, and keep a glass of water nearby.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 6. Food, Cooking & Tea Recipes
    if (
      cleanMsg.includes('chai') ||
      cleanMsg.includes('tea') ||
      cleanMsg.includes('चहा') ||
      cleanMsg.includes('चाय') ||
      cleanMsg.includes('khana') ||
      cleanMsg.includes('recipe') ||
      cleanMsg.includes('khichdi') ||
      cleanMsg.includes('poha') ||
      cleanMsg.includes('पोहा') ||
      cleanMsg.includes('खिचडी') ||
      cleanMsg.includes('नाश्ता')
    ) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'गरमागरम चहासाठी: एका भांड्यात पाणी उकळून त्यात थोडे आले आणि चहापत्ती घाला. उकळी आल्यावर दूध व आवडीनुसार साखर घालून गाळून घ्या. एक कप चहा मनाला ताजेतवाने करतो.';
      } else if (lang === 'hi') {
        msg = 'स्वादिष्ट अदरक वाली चाय के लिए: पानी में कुटी हुई अदरक और चायपत्ती डालकर उबालें। फिर दूध और स्वादानुसार चीनी डालें, अच्छे से पकाकर गरमागरम छान लें।';
      } else {
        msg = 'For a soothing warm cup of tea: boil water with crushed ginger and tea leaves, add milk and a spoon of sugar, let it simmer, and strain into your favorite cup.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 7. Health, Sleep, Pain & Walking Advice
    if (
      cleanMsg.includes('neend') ||
      cleanMsg.includes('sleep') ||
      cleanMsg.includes('झोप') ||
      cleanMsg.includes('नींद') ||
      cleanMsg.includes('dard') ||
      cleanMsg.includes('pain') ||
      cleanMsg.includes('दुखत') ||
      cleanMsg.includes('दर्द') ||
      cleanMsg.includes('headache') ||
      cleanMsg.includes('sar dard') ||
      cleanMsg.includes('डोकेदुखी') ||
      cleanMsg.includes('bp') ||
      cleanMsg.includes('sugar') ||
      cleanMsg.includes('walk') ||
      cleanMsg.includes('walking') ||
      cleanMsg.includes('थकवा') ||
      cleanMsg.includes('tired')
    ) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'शरीराला आरामाची गरज असू शकते. एक घोट कोमट पाणी प्या, डोळे मिटून दीर्घ श्वास घ्या. जर त्रास जास्त वाटत असेल तर आपल्या कुटुंबियांना किंवा डॉक्टरांना लगेच सांगा.';
      } else if (lang === 'hi') {
        msg = 'शरीर को थोड़े आराम की आवश्यकता हो सकती है। एक घूंट गुनगुना पानी पिएं और आंखें बंद करके गहरी सांस लें। अगर तकलीफ अधिक लगे तो डॉक्टर या परिवार को अवश्य बताएं।';
      } else {
        msg = 'Your body might need a little rest right now. Sip some warm water and take gentle, deep breaths. If any discomfort persists, please let your family or doctor know.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 8. Phone Features (Flashlight/Torch, Photo, Volume, Battery)
    if (
      cleanMsg.includes('torch') ||
      cleanMsg.includes('flashlight') ||
      cleanMsg.includes('टॉर्च') ||
      cleanMsg.includes('volume') ||
      cleanMsg.includes('awaz') ||
      cleanMsg.includes('आवाज') ||
      cleanMsg.includes('battery') ||
      cleanMsg.includes('charge') ||
      cleanMsg.includes('चार्ज') ||
      cleanMsg.includes('wifi') ||
      cleanMsg.includes('इंटरनेट')
    ) {
      let msg = '';
      if (cleanMsg.includes('torch') || cleanMsg.includes('flashlight') || cleanMsg.includes('टॉर्च')) {
        msg = lang === 'mr'
          ? 'टॉर्च चालू करण्यासाठी: स्क्रीनच्या अगदी वरच्या भागावरून बोट खाली ओढा. तिथे टॉर्चचे चिन्ह दिसेल, त्यावर एकदा दाबा.'
          : lang === 'hi'
          ? 'टॉर्च जलाने के लिए: स्क्रीन के सबसे ऊपर से उंगली नीचे की तरफ खींचें। वहाँ टॉर्च का निशान दिखेगा, उस पर टैप करें।'
          : 'To turn on the flashlight: swipe down from the very top of your screen and tap the torch icon.';
      } else if (cleanMsg.includes('volume') || cleanMsg.includes('awaz') || cleanMsg.includes('आवाज')) {
        msg = lang === 'mr'
          ? 'आवाज वाढवण्यासाठी फोनच्या बाजूला असलेले वरचे लांब बटण दाबा.'
          : lang === 'hi'
          ? 'आवाज बढ़ाने के लिए फोन के किनारे दिया गया ऊपर वाला बटन दबाएं।'
          : 'To increase the volume, press the upper volume button on the side of your phone.';
      } else {
        msg = lang === 'mr'
          ? 'फोनच्या या सुविधेसाठी स्क्रीनवरील सेटिंग्ज किंवा वरचा मेनू वापरू शकता. मी प्रत्येक गोष्टीत मदत करायला सोबत आहे.'
          : lang === 'hi'
          ? 'फोन की इस सुविधा के लिए स्क्रीन पर ऊपर से नीचे स्वाइप कर सकते हैं। मैं आपको सिखाने के लिए साथ हूँ।'
          : 'You can access quick phone controls by swiping down from the top of your screen.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 9. Small Talk, Well-being & Feelings
    if (
      cleanMsg.includes('kaise ho') ||
      cleanMsg.includes('kaisi ho') ||
      cleanMsg.includes('how are you') ||
      cleanMsg.includes('kasa ahes') ||
      cleanMsg.includes('kashi ahes') ||
      cleanMsg.includes('तुम्ही कसे आहात') ||
      cleanMsg.includes('आप कैसे हैं') ||
      cleanMsg.includes('kya kar rahi ho') ||
      cleanMsg.includes('क्या कर रही हो') ||
      cleanMsg.includes('काय करत आहात') ||
      cleanMsg.includes('thank you') ||
      cleanMsg.includes('dhanyavad') ||
      cleanMsg.includes('shukriya') ||
      cleanMsg.includes('धन्यवाद') ||
      cleanMsg.includes('शुक्रिया') ||
      cleanMsg.includes('bore') ||
      cleanMsg.includes('akela') ||
      cleanMsg.includes('lonely') ||
      cleanMsg.includes('एकटे')
    ) {
      let msg = '';
      if (cleanMsg.includes('thank') || cleanMsg.includes('dhanya') || cleanMsg.includes('shukri')) {
        msg = lang === 'mr'
          ? 'तुमचे खूप खूप आभार! तुम्हाला मदत करताना मला मनापासून आनंद होतो. मी नेहमी तुमच्या सोबत आहे.'
          : lang === 'hi'
          ? 'आपका बहुत-बहुत धन्यवाद! आपकी सहायता करके मुझे बहुत खुशी मिलती है। मैं हमेशा आपके साथ हूँ।'
          : 'You are most welcome! It brings me joy to assist you. I am always right beside you.';
      } else if (cleanMsg.includes('bore') || cleanMsg.includes('akela') || cleanMsg.includes('lonely') || cleanMsg.includes('एकटे')) {
        msg = lang === 'mr'
          ? 'अजिबात एकटे वाटून घेऊ नका. मी तुमच्या सोबत आहे. आपण जुनी गाणी ऐकू शकतो किंवा गप्पा मारू शकतो. तुम्हाला काय आवडेल?'
          : lang === 'hi'
          ? 'बिल्कुल अकेला महसूस न करें। मैं आपके साथ हूँ। हम पुराने भजन या गाने सुन सकते हैं या बात कर सकते हैं। आप क्या पसंद करेंगे?'
          : 'You are never alone. I am right here with you. We can listen to songs or have a friendly chat whenever you like.';
      } else {
        msg = lang === 'mr'
          ? 'मी अगदी छान आहे, विचारल्याबद्दल धन्यवाद! तुम्हाला आनंदात पाहून मला समाधान मिळते. आज तुमची तब्येत कशी आहे?'
          : lang === 'hi'
          ? 'मैं बहुत अच्छी हूँ, पूछने के लिए धन्यवाद! आपको देखकर मेरा मन प्रसन्न हो जाता है। आप आज कैसा महसूस कर रहे हैं?'
          : 'I am doing wonderful, thank you for asking! Seeing you brings me peace. How are you feeling today?';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 10. Jokes & Humor
    if (
      cleanMsg.includes('joke') ||
      cleanMsg.includes('chutkula') ||
      cleanMsg.includes('vinod') ||
      cleanMsg.includes('विनोद') ||
      cleanMsg.includes('चुटकुला') ||
      cleanMsg.includes('हंसना') ||
      cleanMsg.includes('hasao')
    ) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'एक लहानसा विनोद: नातवाने आजीला विचारले, "आजी, तू कधी फोन विसरतेस का?" आजी हसून म्हणाली, "नाही रे बाळा, मी फक्त तो कुठे ठेवला ते विसरते!" हसत राहा, हसणे आरोग्यासाठी उत्तम असते.';
      } else if (lang === 'hi') {
        msg = 'एक प्यारा सा चुटकुला: पोते ने दादी से पूछा, "दादी, क्या आप कभी फोन भूलती हैं?" दादी मुस्कुराई और बोलीं, "नहीं बेटा, मैं बस यह भूलती हूँ कि उसे कहाँ रखा था!" मुस्कुराते रहिए, हंसी सबसे अच्छी दवा है।';
      } else {
        msg = 'A sweet smile for you: A grandson asked his grandmother, "Do you ever forget your phone?" She smiled and said, "Never, dear! I only forget which room I left it in!" Keep smiling, it brightens the day.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 11. Stories & Wisdom
    if (
      cleanMsg.includes('kahani') ||
      cleanMsg.includes('story') ||
      cleanMsg.includes('goshtha') ||
      cleanMsg.includes('गोष्ट') ||
      cleanMsg.includes('कहानी') ||
      cleanMsg.includes('कथा')
    ) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'एक सुंदर विचार: झाडाला गोड फळे तेव्हाच येतात जेव्हा त्याची मुळे जमिनीत शांत व घट्ट असतात. माणसाचे आयुष्यही तसेच असते — संयम आणि प्रेमाने प्रत्येक क्षण गोड होतो.';
      } else if (lang === 'hi') {
        msg = 'एक प्यारी सी सीख: एक राजा ने बीरबल से पूछा, "मन को शांति कैसे मिले?" बीरबल ने कहा, "महाराज, जो बीत गया उसकी चिंता छोड़िए और आज के हर पल में अपनों को मुस्कान दीजिए।"';
      } else {
        msg = 'A short inspiring thought: Just as roots stay quietly grounded to give sweet fruits to a tree, a calm and patient heart brings sweetness to every day of life.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 12. Devotion, Prayer & Spiritual Thoughts
    if (
      cleanMsg.includes('bhajan') ||
      cleanMsg.includes('prayer') ||
      cleanMsg.includes('god') ||
      cleanMsg.includes('bhagwan') ||
      cleanMsg.includes('dev') ||
      cleanMsg.includes('भजन') ||
      cleanMsg.includes('भगवान') ||
      cleanMsg.includes('देव') ||
      cleanMsg.includes('शांती') ||
      cleanMsg.includes('geeta') ||
      cleanMsg.includes('shloka') ||
      cleanMsg.includes('श्लोक')
    ) {
      let msg = '';
      if (lang === 'mr') {
        msg = 'ईश्वराचे नामस्मरण मनाला अथांग शांती देते. "कराग्रे वसते लक्ष्मी, करमध्ये सरस्वती..." शांतपणे डोळे मिटून देवाचे स्मरण करा, मन प्रसन्न होईल.';
      } else if (lang === 'hi') {
        msg = 'ईश्वर का स्मरण मन को असीम शांति देता है। "ॐ शांति शांति शांति..." प्रभु का नाम लेकर मन को शांत कीजिए, सब मंगल होगा।';
      } else {
        msg = 'Remembering the divine brings deep peace to the heart. A few moments of quiet reflection and prayer fills our day with gentle grace.';
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 13. What is ElderEase
    if (
      cleanMsg.includes('what is elderease') ||
      cleanMsg.includes('elderease काय आहे') ||
      cleanMsg.includes('elderease क्या है') ||
      cleanMsg.includes('who are you') ||
      cleanMsg.includes('aap kaun ho') ||
      cleanMsg.includes('तुम्ही कोण') ||
      cleanMsg.includes('तुम कौन हो')
    ) {
      const msg =
        lang === 'mr'
          ? 'मी ElderEase आहे — तुमची डिजिटल मदतनीस. फोन वापरताना तुम्हाला शांतपणे मदत करणे हे माझे काम आहे.'
          : lang === 'hi'
          ? 'मैं ElderEase हूँ — आपकी डिजिटल साथी। फोन चलाने में आपकी मदद करना मेरा काम है।'
          : "I am ElderEase — your patient digital companion. I am here to help you use your phone simply and safely.";

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 14. Universal Intelligent Fallback for ANY other question (never repeating canned greeting)
    const isDirectQuestion =
      cleanMsg.includes('?') ||
      cleanMsg.includes('kya') ||
      cleanMsg.includes('kaise') ||
      cleanMsg.includes('kyun') ||
      cleanMsg.includes('who') ||
      cleanMsg.includes('what') ||
      cleanMsg.includes('how') ||
      cleanMsg.includes('why') ||
      cleanMsg.includes('where') ||
      cleanMsg.includes('सांगा') ||
      cleanMsg.includes('बताओ') ||
      cleanMsg.includes('सांग') ||
      cleanMsg.includes('सांगू शकता') ||
      cleanMsg.includes('बताना');

    if (isDirectQuestion) {
      let msg = '';
      if (lang === 'mr') {
        msg = `तुम्ही विचारलेला प्रश्न मी समजून घेतला आहे. हा एक चांगला विषय आहे. याबद्दल अधिक जाणून घेण्यासाठी आपण यूट्यूबवर माहिती शोधू शकतो किंवा मी अजून सोपे करून सांगू शकेन.`;
      } else if (lang === 'hi') {
        msg = `आपका यह सवाल मैंने समझ लिया है। यह एक महत्वपूर्ण विषय है। इसके बारे में अधिक जानने के लिए हम यूट्यूब पर जानकारी देख सकते हैं या मैं इसे और विस्तार से समझा सकती हूँ।`;
      } else {
        msg = `I understand your question well. That is a thoughtful topic. We can look up more information together on YouTube, or I can explain more details step by step.`;
      }

      return {
        message: msg,
        reply: msg,
        intent: 'GENERAL_QUESTION',
        action: 'NONE',
        speak: voiceEnabled,
        mode: 'CONVERSATION',
        language: lang,
      };
    }

    // 15. Default Gentle Greeting only when user says hi / hello
    const defaultMsg =
      lang === 'mr'
        ? 'नमस्कार! मी तुम्हाला मदत करायला तयार आहे. तुम्ही मला काहीही विचारू शकता — जसे की फोटो पाठवणे, व्हिडिओ कॉल करणे, किंवा मदत मागणे.'
        : lang === 'hi'
        ? 'नमस्ते! मैं आपकी सहायता के लिए तैयार हूँ। आप मुझसे कुछ भी पूछ सकते हैं — जैसे फोटो भेजना, वीडियो कॉल करना, या कोई सवाल।'
        : "Hello! I am here to help you. You can ask me anything — like sending a photo, making a video call, or asking family for help.";

    return {
      message: defaultMsg,
      reply: defaultMsg,
      intent: 'GENERAL_QUESTION',
      action: 'NONE',
      speak: voiceEnabled,
      mode: 'CONVERSATION',
      language: lang,
    };
  }

  /**
   * Optional External LLM call (Gemini API) with enriched conversational context
   */
  private static async callExternalLLM(
    prompt: string,
    history: ChatMessage[],
    meta: { lang: 'mr' | 'hi' | 'en'; context: AiChatContext }
  ): Promise<string | null> {
    if (!config.aiApiKey) return null;

    try {
      const langName = meta.lang === 'mr' ? 'Marathi' : meta.lang === 'hi' ? 'Hindi' : 'English';
      const taskContextDesc = meta.context.currentTaskSlug
        ? `The user is currently on task "${meta.context.currentTaskSlug}", step index ${meta.context.currentStepIndex ?? 0}.`
        : 'The user is on the main conversational home screen.';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.aiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `You are ElderEase, a warm, patient, mature female digital assistant sitting beside an elderly Indian user.
Always respond in simple, respectful, conversational ${langName}.
Keep responses to 1-3 short, clear sentences. Never use technical jargon. Never be overly enthusiastic or repetitive.
Do NOT start responses with "Great!", "Wonderful!", "Sure!", or "Of course!".
${taskContextDesc}
If they ask where something is or what it looks like, explain the icon's color, shape, and symbol calmly.
Never pretend you can see their physical screen.
Never ask for OTPs or passwords.`,
                },
              ],
            },
            contents: [
              ...history.slice(-4).map((h) => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }],
              })),
              { role: 'user', parts: [{ text: prompt }] },
            ],
          }),
        }
      );

      if (response.ok) {
        const data: any = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate.trim();
      }
    } catch (e) {
      console.warn('Gemini request failed, falling back to local empathic engine');
    }

    return null;
  }

  /**
   * Helper for safety check
   */
  static analyzeMessageSafety(messageText: string, lang: string = 'mr') {
    const text = messageText.toLowerCase();
    const scamWords = ['otp', 'pin', 'cvv', 'lottery', 'winner', 'bank blocked', 'electricity bill', 'ओटीपी', 'पैसे'];
    const isSuspicious = scamWords.some((w) => text.includes(w));
    const warningPoints = isSuspicious
      ? [
          lang === 'mr' ? 'OTP कोणाशीही शेअर करू नका' : lang === 'hi' ? 'ओटीपी किसी के साथ साझा न करें' : 'Never share your OTP with anyone',
          lang === 'mr' ? 'अनोळखी लिंकवर क्लिक करू नका' : lang === 'hi' ? 'अज्ञात लिंक पर क्लिक न करें' : 'Do not click on unverified links',
        ]
      : [];

    return {
      isSuspicious,
      warningPoints,
      reason: isSuspicious
        ? (lang === 'mr' ? 'या मेसेजमध्ये OTP किंवा बँक ब्लॉकचा संशय आहे.' : lang === 'hi' ? 'इस संदेश में ओटीपी या संदिग्ध जानकारी का उल्लेख है।' : 'This message asks for sensitive details like OTP or banking.')
        : (lang === 'mr' ? 'मेसेज सामान्य वाटतो.' : lang === 'hi' ? 'संदेश सामान्य प्रतीत होता है।' : 'Message looks safe.'),
      guidance: isSuspicious
        ? (lang === 'mr' ? 'कृपया कोणालाही OTP किंवा पैसे पाठवू नका.' : lang === 'hi' ? 'कृपया किसी के साथ भी ओटीपी साझा न करें।' : 'Never share your OTP, PIN, or send money.')
        : (lang === 'mr' ? 'तरीही अनोळखी व्यक्तीशी गुप्त माहिती शेअर करू नका.' : 'Still stay cautious.'),
    };
  }

  /**
   * Helper for web page explanation
   */
  static explainWebPage(pageTitle: string, url: string, visibleText: string, lang: string = 'mr') {
    return {
      summary: lang === 'mr' ? `हे "${pageTitle}" चे पान आहे.` : lang === 'hi' ? `यह "${pageTitle}" का पेज है।` : `This is the page for "${pageTitle}".`,
      stepToTake: lang === 'mr' ? 'पानावरील सूचना शांतपणे वाचा आणि एक-एक माहिती भरा.' : 'Read instructions carefully and take one step at a time.',
      safetyCaution: lang === 'mr' ? 'पासवर्ड किंवा बँक पिन कधीही अनोळखी पानांवर टाकू नका.' : 'Never enter your bank PIN on unknown sites.',
    };
  }

  /**
   * Helper for prescription parsing
   */
  static extractPrescription(rawText: string) {
    return {
      status: 'NEEDS_HUMAN_CONFIRMATION',
      extractedMedicines: [
        {
          name: 'General Prescription Medicine',
          dosage: '1 tablet daily',
          timing: '09:00',
          instructions: 'Take after food as advised by doctor',
        },
      ],
    };
  }
}
