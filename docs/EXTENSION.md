# ElderEase Browser Helper — Chrome Extension Guide

The **ElderEase Browser Helper** is an optional Chrome Manifest V3 extension designed to guide senior citizens when navigating third-party websites (such as bill payments, railway booking, government forms, or news).

## Architecture

- **Manifest Version**: 3
- **Permissions**:
  - `activeTab`: Access only the currently focused tab upon explicit user interaction.
  - `storage`: Cache user preference (font size, language) locally.
  - `scripting`: Inject safe content script upon user button click.

## Features

1. **[🎤 Talk to ElderEase]**: Opens a voice-first assistance dialogue directly within the popup.
2. **[🔍 Explain This Page]**: Extracts visible headings and paragraph text from the active webpage, sends it to the ElderEase AI backend (`/api/ai/explain-page`), and delivers an easy-to-understand explanation in Marathi, Hindi, or English.
3. **[🛡️ Is This Safe?]**: Evaluates the webpage domain and form structure for suspicious requests (e.g. asking for OTPs, PINs, or urgent payment demands).
4. **[📖 Step-by-Step Guidance]**: Breaks down complex web forms into manageable single instructions with element highlighting.
5. **[🌐 Open ElderEase Web App]**: One-click quick link back to the primary web dashboard.

## Loading in Chrome (Developer Mode)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable the **"Developer mode"** toggle in the top right corner.
3. Click **"Load unpacked"**.
4. Select the `PBL-Project/extension` folder.
5. Pin the **ElderEase Browser Helper** icon to your Chrome toolbar.
