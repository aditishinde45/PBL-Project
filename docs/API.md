# ElderEase REST API Specification

All API endpoints return standard JSON responses with proper HTTP status codes.

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional user friendly message"
}
```

In error cases:
```json
{
  "success": false,
  "error": "Friendly error message",
  "code": "ERROR_CODE"
}
```

---

## 1. Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register-senior` — Register senior with phone/email, passcode, language, font size, voice speed.
- `POST /api/auth/register-caregiver` — Register caregiver with credentials and relationship.
- `POST /api/auth/login` — Login with email/phone and password; returns JWT token and user profile.
- `GET /api/auth/me` — Retrieve current authenticated user profile and role.
- `POST /api/auth/logout` — Invalidate session.

## 2. Senior Endpoints (`/api/senior`)
- `GET /api/senior/profile` — Get senior's profile, invite code, linked caregivers.
- `PATCH /api/senior/preferences` — Update font size, contrast, language, voice speed, TTS.
- `GET /api/senior/overview` — Get senior dashboard data (today's medicines, appointment, check-in state).
- `POST /api/senior/caregiver-code` — Generate fresh 6-character connection code.
- `PATCH /api/senior/connections/:id` — Approve or reject a caregiver pairing request.

## 3. Caregiver Endpoints (`/api/caregiver`)
- `GET /api/caregiver/dashboard` — Get aggregated status of linked seniors (check-ins, medicines, appointments, alerts).
- `POST /api/caregiver/connect` — Request connection to a senior via invite code.
- `GET /api/caregiver/seniors/:seniorId/medicines` — Get detailed medicine schedule and logs for a senior.
- `POST /api/caregiver/seniors/:seniorId/family-tasks` — Create a family task for the senior.
- `GET /api/caregiver/seniors/:seniorId/activity` — Get audit log of senior activities relevant to care.

## 4. Medicines Endpoints (`/api/medicines`)
- `GET /api/medicines` — List all medicines for the current senior.
- `POST /api/medicines` — Create a medicine and its reminder schedules.
- `PATCH /api/medicines/:id` — Update medicine details or deactivate.
- `POST /api/medicines/:id/confirm` — Record confirmation (`TAKEN` or `DELAYED`).
- `GET /api/medicines/today` — Get today's scheduled doses with status.
- `POST /api/medicines/check-missed` — Cron/background trigger to identify missed doses and notify caregiver.

## 5. Daily Check-In Endpoints (`/api/checkins`)
- `GET /api/checkins/today` — Get today's check-in status.
- `POST /api/checkins` — Submit daily check-in (`OKAY` or `HELP_NEEDED`).
- `GET /api/checkins/history` — Get last 30 days check-in history.

## 6. Emergency & Help Endpoints (`/api/help`)
- `POST /api/help/emergency` — Trigger "I NEED HELP" emergency event with optional coordinates.
- `POST /api/help/family` — Trigger "CALL FAMILY" assistance request.
- `GET /api/help/active` — List open emergency or help requests.
- `PATCH /api/help/:id/resolve` — Mark emergency/help request as resolved.

## 7. Appointments Endpoints (`/api/appointments`)
- `GET /api/appointments` — List appointments for senior.
- `POST /api/appointments` — Create doctor appointment.
- `PATCH /api/appointments/:id` — Update or cancel appointment.

## 8. Guided Tasks Endpoints (`/api/tasks`)
- `GET /api/tasks` — List published guided tasks (WhatsApp, Payment, Video Call, etc.).
- `GET /api/tasks/:id` — Get full task steps with multi-language instructions.
- `POST /api/tasks/:id/start` — Start/resume a guided task session.
- `PATCH /api/tasks/sessions/:sessionId` — Update step progress or complete session.
- `GET /api/tasks/sessions/active` — Check for recoverable active session.

## 9. Admin Tasks Endpoints (`/api/admin/tasks`)
- `GET /api/admin/tasks` — List all tasks (including drafts).
- `POST /api/admin/tasks` — Create new task with steps.
- `PATCH /api/admin/tasks/:id` — Update task details and step order.
- `PATCH /api/admin/tasks/:id/publish` — Toggle published state.
- `DELETE /api/admin/tasks/:id` — Delete task.

## 10. AI Companion Endpoints (`/api/ai`)
- `POST /api/ai/chat` — Conversational assistance with patient tone, context, multilingual awareness.
- `POST /api/ai/check-scam` — Analyze suspicious message/SMS/link for fraud patterns.
- `POST /api/ai/explain-page` — Endpoint for browser extension to explain visible webpage context.
- `POST /api/ai/extract-prescription` — OCR/prescription parser returning structured medicines for human review.

## 11. Notifications Endpoints (`/api/notifications`)
- `GET /api/notifications` — Get user notifications.
- `PATCH /api/notifications/:id/read` — Mark notification as read.
- `PATCH /api/notifications/read-all` — Mark all as read.

## 12. Feedback & Analytics Endpoints (`/api/feedback` & `/api/analytics`)
- `POST /api/feedback` — Submit feedback on guided task session (`GOOD` / `POOR`).
- `GET /api/analytics/summary` — Admin privacy-preserving analytics overview.

## 13. Development / Demo Mode Endpoints (`/api/demo`)
- `POST /api/demo/trigger-medicine` — Simulate an immediate medicine reminder.
- `POST /api/demo/simulate-missed-medicine` — Simulate a missed medicine alert to caregiver.
- `POST /api/demo/simulate-missed-checkin` — Simulate a missed check-in alert.
- `POST /api/demo/trigger-emergency` — Simulate emergency dispatch.
- `POST /api/demo/reset` — Reset database to initial demo state.
