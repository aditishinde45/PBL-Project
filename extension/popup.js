// ElderEase Browser Helper Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('langSelect');
  const btnExplainPage = document.getElementById('btnExplainPage');
  const btnVoiceHelp = document.getElementById('btnVoiceHelp');
  const resultBox = document.getElementById('resultBox');
  const resultTitle = document.getElementById('resultTitle');
  const resultContent = document.getElementById('resultContent');
  const safetyWarning = document.getElementById('safetyWarning');
  const btnSpeakResult = document.getElementById('btnSpeakResult');

  let currentExplanationText = '';

  // Load cached language preference
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['elderEaseLang'], (res) => {
      if (res.elderEaseLang) {
        langSelect.value = res.elderEaseLang;
      }
    });
  }

  langSelect.addEventListener('change', () => {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ elderEaseLang: langSelect.value });
    }
  });

  // 1. Explain This Page Action
  btnExplainPage.addEventListener('click', async () => {
    resultBox.style.display = 'block';
    resultTitle.innerText = 'तपासत आहे... (Analyzing Page...)';
    resultContent.innerHTML = '<em>कृपया थांबा, एल्डरईज हे वेबपेज वाचत आहे...</em>';
    safetyWarning.style.display = 'none';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        resultContent.innerText = 'Active browser tab not found.';
        return;
      }

      // Inject content script into active tab
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ['content.js'],
        },
        () => {
          chrome.tabs.sendMessage(
            tab.id,
            { action: 'EXTRACT_PAGE_DATA' },
            async (pageData) => {
              if (chrome.runtime.lastError || !pageData) {
                // Fallback using tab title and url
                pageData = {
                  title: tab.title || 'Current Webpage',
                  url: tab.url || '',
                  visibleText: 'General web browsing assistance.',
                };
              }

              try {
                const response = await fetch('http://localhost:5000/api/ai/explain-page', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    pageTitle: pageData.title,
                    url: pageData.url,
                    visibleText: pageData.visibleText,
                    language: langSelect.value,
                  }),
                });

                const data = await response.json();
                if (data.success && data.data) {
                  const expl = data.data;
                  resultTitle.innerText = 'पानाचा सारांश (Page Summary)';
                  resultContent.innerHTML = `
                    <p><strong>${expl.summary}</strong></p>
                    <p style="margin-top: 8px;">👉 ${expl.stepToTake}</p>
                  `;

                  if (expl.safetyCaution) {
                    safetyWarning.style.display = 'block';
                    safetyWarning.innerText = `🛡️ ${expl.safetyCaution}`;
                  }

                  currentExplanationText = `${expl.summary}. ${expl.stepToTake}. ${expl.safetyCaution || ''}`;
                  speakText(currentExplanationText, langSelect.value);
                } else {
                  resultContent.innerText = 'काही अडचण आली. कृपया पुन्हा प्रयत्न करा.';
                }
              } catch (apiErr) {
                resultContent.innerHTML = `
                  <p><strong>हे "${pageData.title}" चे वेबपेज आहे.</strong></p>
                  <p style="margin-top: 8px;">👉 पहिली पायरी: पानावर विचारलेली माहिती शांतपणे वाचा आणि फक्त आवश्यक माहिती भरा.</p>
                `;
                safetyWarning.style.display = 'block';
                safetyWarning.innerText = '🛡️ सुरक्षितता: तुमचा पासवर्ड किंवा ओटीपी कधीही अनोळखी पानांवर टाकू नका.';
              }
            }
          );
        }
      );
    } catch (err) {
      resultContent.innerText = 'Could not access the webpage: ' + err.message;
    }
  });

  // 2. Voice Help Action
  btnVoiceHelp.addEventListener('click', () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not available in this browser extension window.');
      return;
    }

    const recognizer = new SpeechRecognition();
    recognizer.lang =
      langSelect.value === 'mr' ? 'mr-IN' : langSelect.value === 'hi' ? 'hi-IN' : 'en-IN';

    resultBox.style.display = 'block';
    resultTitle.innerText = 'मी ऐकत आहे... (Listening...)';
    resultContent.innerHTML = '<em>शांतपणे बोला, तुमचा प्रश्न विचारा...</em>';

    recognizer.onresult = async (event) => {
      const query = event.results[0][0].transcript;
      resultTitle.innerText = 'प्रश्न: ' + query;
      resultContent.innerHTML = '<em>एल्डरईज उत्तर तयार करत आहे...</em>';

      try {
        const response = await fetch('http://localhost:5000/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            language: langSelect.value,
          }),
        });
        const data = await response.json();
        const reply = data.data?.reply || 'मला समजले नाही, पुन्हा सांगा.';
        resultContent.innerText = reply;
        currentExplanationText = reply;
        speakText(reply, langSelect.value);
      } catch (e) {
        resultContent.innerText = 'काही हरकत नाही. आपण पुन्हा प्रयत्न करूया.';
      }
    };

    recognizer.onerror = () => {
      resultTitle.innerText = 'आवाज समजला नाही';
      resultContent.innerText = 'कृपया पुन्हा एकदा माइक बटण दाबा.';
    };

    recognizer.start();
  });

  // 3. Repeat / Listen Aloud Action
  btnSpeakResult.addEventListener('click', () => {
    if (currentExplanationText) {
      speakText(currentExplanationText, langSelect.value);
    }
  });

  function speakText(text, lang) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }
});
