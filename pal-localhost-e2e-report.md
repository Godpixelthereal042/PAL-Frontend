# Pal Frontend Localhost E2E QA Report

Date: Wednesday, June 10, 2026  
Target: `pal-frontend` on `localhost:3000`  
Mode: Read-only source review + non-destructive UI/API smoke testing with minimal labeled test data.

## Executive Summary

The app runs locally on `localhost:3000` and the main screens render successfully: onboarding/auth prototype, dashboard, chat, projects, project detail, research, analytics, weekly data, invoices, profile, notifications, logs, and integration detail screens. SQLite-backed read paths are mostly working, and core write paths for chat, projects, project milestones/briefs, invoices, profile, schedules, logs, notifications, and integrations are implemented.

The biggest product risks are that authentication is only a local prototype, several integration/team features are UI placeholders rather than real flows, Gemini quota/service failures leak raw provider error text into chat history, and `.env.local` contains a Gemini API key. No source files were modified.

## What Was Tested

- Auth/onboarding: sign-up/sign-in screens, Google/Base ID buttons by code and UI inspection.
- Chat: text send, image payload send, message persistence, existing upload messages, `/api/chat` read/write.
- Projects: list, detail, project creation API, project brief/milestone creation API.
- Research: search/results route and `/api/research` fallback behavior.
- Dashboard/views: home dashboard, analytics, weekly data, notifications, logs, profile, invoices.
- Integrations: dashboard shortcuts and `/connect/gmail`, `/connect/slack`, `/connect/google`, `/connect/x`, `/connect/facebook`, `/connect/apple`-style component support; direct integration API checks.
- Backend/API: route smoke tests for primary pages and API endpoints.
- Security pass: local environment file checked for exposed key names only; secret value was not copied into this report.

## Minimal Test Data Created

The following clearly labeled records were created during the pass:

- Chat messages: `Clicky E2E test chat message. Please reply briefly.` and `Clicky E2E image upload send test`.
- Project: `Clicky E2E Test Project` with description `Temporary test project created during localhost QA pass.`
- Project milestone/brief: `Clicky E2E test milestone - safe to delete` under project `1`.
- Integration update: `google` integration was POSTed and returned synced state.

No destructive actions were performed. I did not delete records or alter source files.

## Working Flows

### App Shell and Navigation

- All tested pages returned HTTP 200: `/`, `/onboarding`, `/chat`, `/projects`, `/projects/1`, `/research`, `/research/results`, `/analytics`, `/weekly-data`, `/quick-invoice`, `/profile`, `/notifications`, `/log-history`, `/connect/google`, `/connect/x`, `/connect/facebook`, and similar integration routes.
- Bottom navigation exposes dashboard, projects, research, and chat.
- Dashboard cards route into analytics, camera, notifications, profile, and integration screens.

### Chat

- `GET /api/chat` returns persisted SQLite messages.
- Valid `POST /api/chat` with `{ "text": "..." }` succeeds and stores both user and AI messages.
- Valid `POST /api/chat` with `text`, `image`, and `attachments` succeeds and stores the image data URL plus attachment metadata.
- Chat responds even when Gemini is unavailable by falling back to a canned business-assistant response.

### Projects and Briefs

- `GET /api/projects` returns seeded projects plus newly created test projects.
- `POST /api/projects` succeeds when the frontend contract is used: `title`, `type`, `description`, `date`, and `color`.
- `GET /api/projects/1` returns project details and milestones.
- `POST /api/projects/1` creates a milestone/brief-style item.
- Project detail screen supports milestone toggling and adding new goals via prompt.

### Research

- `/research` and `/research/results` render.
- `GET /api/research?q=Clicky%20E2E%20Test` returned a structured fallback report when Gemini was unavailable or throttled.

### Dashboard and Business Data

- `GET /api/analytics` returned health index, total ingestions, outstanding invoice total, total projects, and chart data.
- `GET /api/weekly-data` returned weekly operational stats and co-founder advice.
- `GET /api/invoices` returned pending/paid/overdue invoice summary data.
- `GET /api/notifications`, `/api/logs`, `/api/profile`, and `/api/schedules` returned expected seeded data.

## Key Bugs and Reproduction Steps

### 1. Auth Is Prototype-Only, Not Real Authentication

Steps:
1. Open `/onboarding`.
2. Use Sign up or Log in fields.
3. Submit any non-empty email/password.

Observed:
- The flow stores profile-like data in `localStorage` and navigates to the dashboard.
- There is no backend user creation, password validation, session token, logout/session expiry, or protected route enforcement.
- Google and Base ID buttons trigger alert placeholders rather than OAuth.

Impact:
- Users may think they have a secure account, but the app currently behaves like a demo shell.

Recommendation:
- Decide the auth provider and add real session handling before using any private business data.

### 2. Gemini Failures Leak Raw Provider Errors Into Chat

Steps:
1. Send chat messages while Gemini quota/high-demand errors occur.
2. Inspect `/api/chat` or the chat screen.

Observed:
- Previous persisted AI messages include raw Gemini error payloads, including quota/resource-exhausted and service-unavailable details.
- The latest valid chat test fell back to a generic canned response, which is safer, but existing raw error history remains visible.

Impact:
- Poor UX and possible provider/internal diagnostic leakage to end users.

Recommendation:
- Never persist raw upstream error bodies as assistant messages. Map provider failures to a short friendly fallback and log details server-side only.

### 3. Chat API Contract Is Easy To Mismatch

Steps:
1. POST to `/api/chat` with `{ "message": "..." }`.
2. Compare with frontend, which sends `{ "text": "..." }`.

Observed:
- API returns `400 { "error": "Text or attachment field is required" }`.
- This is correct for current implementation, but the route does not tolerate common `message` field naming.

Impact:
- External clients or future UI changes can silently break chat if they use `message` instead of `text`.

Recommendation:
- Either document the contract clearly or accept both `text` and `message`.

### 4. Project Creation API Requires UI-Specific Fields

Steps:
1. POST to `/api/projects` with common fields like `name`, `status`, and `progress`.
2. POST again with `title`, `type`, `description`, `date`, `color`.

Observed:
- The first payload returns `400 Missing required fields`.
- The second succeeds.

Impact:
- The business assistant scope likely needs richer project status, owners, accountability, due dates, and progress data than the current visual-card schema supports.

Recommendation:
- Define a product-level project schema rather than a card-only schema.

### 5. Integration Lookup IDs Can Confuse Users

Steps:
1. Request `/api/integrations?source=google-calendar`.
2. Request or POST using current seeded ID `google`.

Observed:
- `google-calendar` returns 404.
- `google` exists and can be updated.
- UI routes use `/connect/google`, `/connect/x`, `/connect/facebook`, `/connect/slack`, etc.; the user-facing concept may be Google Calendar or Google Workspace.

Impact:
- Route names, source IDs, and user-facing integration names can drift.

Recommendation:
- Standardize integration IDs and aliases, especially for Google Calendar versus Google Workspace.

### 6. Team Member Add/Invite Is Placeholder UI

Steps:
1. Open `/projects/1`.
2. Inspect project detail team/share/invite controls.

Observed:
- The invite action is implemented as an alert/deep-link placeholder, not a real invite flow.
- No backend team member or role model was found in SQLite schema.

Impact:
- Co-founder coordination and accountability are not yet end-to-end.

Recommendation:
- Add team tables, invites, roles, ownership, activity history, and notification hooks.

### 7. Image Upload UX Has Evidence of Path/Data Mismatch

Steps:
1. Inspect existing uploaded-photo messages in chat.
2. Send a direct API image payload with a data URL.

Observed:
- API image send stores data URL and attachment JSON correctly.
- Existing chat history includes an uploaded-photo message with `image` null and another row with a local file path-like value instead of a data URL.

Impact:
- Depending on how the UI stages files, previews may work before send but persisted chat rendering can lose or misrepresent the image.

Recommendation:
- Ensure UI always sends a browser-safe data URL or uploaded file URL, never a local filesystem path, and add a test for preview-to-persisted-render behavior.

## UI/UX Notes

- The app has a polished mobile-first visual style, but many controls look production-ready while still acting as prototypes.
- Accessibility tree exposure is inconsistent: several visual cards/buttons are hard to identify by accessible names.
- Sign-up/sign-in fields default to a real-looking email, which can confuse QA and users.
- Project add/edit flows rely on prompts or modal fields; useful for demos, but not enough for accountability workflows.
- Integration cards show synced states and recommendations, but most actions appear simulated.
- Financial summaries exist through invoices/analytics/weekly data, but they are seeded/static-like and not yet accounting-grade.

## Backend/API Findings

- SQLite database file `pal.db` is used locally.
- Core tables include schedules, projects, milestones, invoices, integrations, profile, messages, notifications, and logs.
- Seed data initializes many business-assistant examples, which is useful for demos but may mask missing real integration behavior.
- There is no user/account boundary in the schema, so all data appears global to the local app instance.
- Destructive endpoints exist for projects/milestones; they were not exercised.

## Security Risks

- `.env.local` contains a `GEMINI_API_KEY`. I confirmed the key exists but did not copy or repeat its value.
- Auth is not real yet, so any sensitive business data should be treated as demo-only.
- Raw upstream Gemini error details have been persisted in chat history before; these should be sanitized.
- Local SQLite data contains business-like invoice/profile details with no user-level access model.

## Missing Features Versus Business Assistant Scope

- Workflow management: no robust task owner, due date, dependency, priority, status history, or recurring workflow engine.
- Project accountability: no real member assignments, approvals, comments, audit trail, or weekly accountability check-ins.
- Financial/accounting summaries: invoices exist, but there is no ledger, payment reconciliation, tax/category summaries, cash-flow forecast, or accounting integration.
- Co-founder coordination: chat gives advice, but no shared decision log, meeting notes pipeline, async updates, or partner-specific action tracking.
- Calendar/social integrations: Google/X/Facebook-style screens exist, but they appear seeded/simulated rather than OAuth-backed end-to-end syncs.

## Recommended Next Discussion Points

1. Decide whether Pal is currently a demo prototype or should be hardened into a real multi-user product.
2. Prioritize real auth/session handling before expanding business data storage.
3. Normalize the API contracts for chat, projects, integrations, and files.
4. Add a real project/accountability model: owners, members, invites, due dates, brief documents, activity, and decisions.
5. Replace raw Gemini error persistence with sanitized fallback handling.
6. Define the first real integration to make end-to-end, likely Google Calendar or Gmail, before broadening to all integrations.
7. Add tests for image upload preview → send → persisted chat render.

## Source Change Confirmation

No source files were modified. The only changes made were runtime/test data in the local SQLite database and this QA report file.
