# ElderEase Security & Privacy Architecture

## 1. Threat Model & Safeguards

ElderEase operates in a high-trust assistive environment where elderly users are vulnerable to social engineering, fraud, and accidental data exposure.

### 1.1 Password & Session Security
- Passwords hashed using `bcrypt` (10 rounds).
- Stateless JWT authentication with signed tokens containing only `userId` and `role`.
- Tokens expire in 7 days; invalidation handled gracefully.

### 1.2 Role-Based Access Control (RBAC)
- Roles: `SENIOR`, `CAREGIVER`, `ADMIN`.
- Caregivers can **only** access seniors who have explicitly approved their connection via a secret 6-character invite code.
- Senior private conversations with AI are strictly confidential and are not shared with caregivers without explicit consent.
- Administrative users cannot view private conversations or sensitive health notes.

### 1.3 Safe Browser Extension Guard
- The Chrome Extension (Manifest V3) operates only on user-initiated clicks (`activeTab`).
- The content script explicitly ignores `<input type="password">`, credit card number inputs, CVV fields, and OTP fields.
- The extension **never** automatically clicks submit buttons or executes transactions.

### 1.4 Medical Safety Guardrails
- ElderEase AI is strictly non-diagnostic.
- Any queries regarding medicine dosage adjustments or medical diagnosis return a canned reassuring advisory to contact their physician or caregiver.
- Prescription extraction feature explicitly flags results as **"Draft - Human Confirmation Required"** before any reminder can be created.

### 1.5 Privacy & Consent
- Microphones are only activated when the user clicks the microphone button. Audio streams are transcribed locally in the browser via Web Speech API or processed transiently without permanent storage.
- Consent settings are transparently viewable and modifiable at `/consent`.
