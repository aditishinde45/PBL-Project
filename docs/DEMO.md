# ElderEase Demonstration & Evaluation Guide

This guide is for evaluators, college professors, and project reviewers to test all features of ElderEase without waiting hours for real-world reminder timeouts.

## Preloaded Demonstration Accounts

| Role | Email / ID | Password | Profile Name | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Senior** | `aai@elderease.com` | `aai123` | **Demo Aai** | Large interface, Marathi/English, voice AI, medicine reminders |
| **Caregiver** | `daughter@elderease.com` | `daughter123` | **Demo Daughter** | Linked to Demo Aai, real-time alerts, prescription scan |
| **Admin** | `admin@elderease.com` | `admin123` | **System Admin** | CMS for guided tasks, system analytics |

---

## Interactive Demo Controls

Under Caregiver / Admin view, an explicit **"DEVELOPMENT MODE"** control panel is available with one-click actions:

1. **Trigger Demo Medicine Reminder**: Instantly sends a live prompt to the senior for "BP Medicine (Amlodipine 5mg)".
2. **Simulate Missed Medicine**: Simulates expiration of the confirmation window and dispatches an alert to Demo Daughter: *"Dad/Aai has not confirmed the 8:00 AM medicine."*
3. **Simulate Missed Daily Check-in**: Generates a gentle reminder: *"We have not received today's check-in from Aai. Please check on them."*
4. **Trigger Emergency Alert**: Simulates senior triggering emergency distress with GPS coordinates and sound alert.
5. **Reset Demo Data**: Restores database to fresh demonstration state in seconds.
