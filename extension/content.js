// ElderEase Content Script - Safe DOM Extraction
(function () {
  function getSafeVisibleText() {
    // Collect non-sensitive headings and text
    const title = document.title || 'Untitled Page';
    const url = window.location.href;

    // Filter out scripts, styles, hidden inputs, passwords
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map((el) => el.innerText.trim())
      .filter((t) => t.length > 0)
      .slice(0, 5)
      .join(' | ');

    // Collect visible input labels (ignoring passwords, pins, otps)
    const safeInputs = Array.from(document.querySelectorAll('label, button, a'))
      .map((el) => el.innerText.trim())
      .filter((t) => {
        const lower = t.toLowerCase();
        return (
          t.length > 0 &&
          !lower.includes('password') &&
          !lower.includes('pin') &&
          !lower.includes('otp') &&
          !lower.includes('cvv')
        );
      })
      .slice(0, 10)
      .join(', ');

    const paragraphs = Array.from(document.querySelectorAll('p, main, article'))
      .map((el) => el.innerText.trim())
      .filter((t) => t.length > 0)
      .slice(0, 3)
      .join(' ');

    const combinedSnippet = `Headings: ${headings}. Interactive options: ${safeInputs}. Context: ${paragraphs.slice(0, 500)}`;

    return {
      title,
      url,
      visibleText: combinedSnippet,
    };
  }

  // Listen for extraction requests from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_PAGE_DATA') {
      const data = getSafeVisibleText();
      sendResponse(data);
    }
    return true;
  });
})();
