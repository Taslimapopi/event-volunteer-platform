# VolunteerHub: Community Event & Volunteer Management Platform

A Next.js app where organizers publish community events and manage volunteers, and volunteers discover events, register, and manage their participation.

- **Live:** https://event-volunteer-platform.vercel.app
- **Repo:** https://github.com/Taslimapopi/event-volunteer-platform

## Demo credentials

| Role      | Email              | Password |
| --------- | ------------------ | -------- |
| Organizer | organizer@demo.com | Demo@123 |
| Volunteer | volunteer@demo.com | Demo@123 |

## Tech stack

Next.js (App Router), TypeScript, Tailwind CSS, MongoDB Atlas + Mongoose, NextAuth v4, Zod, React Hook Form, Recharts, Google Gemini API.

**Additional libraries (and why):**

- `mongoose`: MongoDB models and queries
- `bcryptjs`: password hashing
- `zod` + `react-hook-form` + `@hookform/resolvers`: one validation schema shared by client and server
- `sonner`: success/error toast notifications

## Features

**Organizer**

- Create, edit, publish, close/reopen and delete events
- View volunteers per event (name, email, registration date, skill, status) and update their status (Registered / Confirmed / Attended / Cancelled)
- Dashboard: total events, upcoming events, total volunteers, available slots, completed events, plus upcoming events with capacity bars
- Analytics with 4 charts
- AI event description assistant

**Volunteer**

- Browse events with title search and category / location / upcoming-past filters
- Event details with live slot count, then register with a selected skill
- My Events (upcoming / past), registration status, cancel before the event
- Dashboard with a personal overview

**Public:** Home, Events, Event details, Login, Register.

UI is responsive (desktop, tablet, mobile) and includes loading skeletons, empty states, error messages, form validation, toasts and confirmation dialogs.

## Authentication strategy

NextAuth v4 with the **Credentials provider** and **JWT sessions** (7 days).

- Passwords are hashed with `bcryptjs`; plain passwords are never stored.
- On login, the user's `id` and `role` are put into the JWT (`jwt` callback) and copied to the session (`session` callback).
- Users choose a role (Organizer or Volunteer) at registration.

## Role-based authorization

Protection works in three layers:

1. **`src/proxy.ts`** (Next.js 16 proxy/middleware): `/organizer/*` is organizer-only, `/volunteer/*` is volunteer-only. Unauthenticated users go to `/login`, wrong-role users go to `/unauthorized`.
2. **Page level:** server pages re-check the session and ownership (for example, an organizer can only open the edit page of their own event).
3. **API level (most important):** every API route checks the session with `requireRole()`.
   - Volunteers get `403` on event create/update/delete and on organizer endpoints.
   - Organizers get `403` when trying to register as volunteers.
   - Event queries are scoped with `organizerId = session.user.id`, and registration queries with `userId = session.user.id`. IDs are never trusted from the request body, so users can't access another user's private registration data.

## Event capacity logic

`available = capacity - registrations where status != cancelled`. Registration is blocked when:

- the user already registered (unique DB index on `eventId + userId`, plus an API check), returns `409`
- the registration deadline has passed or the event is closed or finished, returns `400`
- the event is full, returns `409` (capacity is re-checked after insert to handle simultaneous requests)

The UI shows a "Full" badge and disables registration. Cancelled registrations release their slot, and a volunteer can re-register later. Organizers cannot lower capacity below current registrations. Deleting an event also deletes its registrations; deleted or draft events return 404.

## AI implementation

**AI Event Description Assistant** (organizer, create/edit event page).

1. The organizer types a short idea (for example, "tree plantation program").
2. The browser calls `POST /api/ai/generate` (organizer-only, input validated with Zod).
3. The server calls the **Google Gemini API** (`generateContent`, JSON output) with a prompt asking for `description`, `roles`, `skills` and `promo`. The response is parsed and validated with Zod.
4. The description and skills fill the event form; suggested roles and the promo message appear in a panel. The organizer can **review and edit everything** before saving.
5. **Fallback:** if `GEMINI_API_KEY` is missing, or Gemini fails or times out (15s), the server returns a keyword-based **mock response** so the feature always works. The panel tells the user when sample content is shown.

The API key stays server-side and is never exposed to the browser.

## Analytics implementation

Built with **Recharts**. The server page `/organizer/analytics` computes the data from MongoDB (aggregations) and passes it to a client chart component:

- Events by category (bar)
- Registrations vs capacity per event (grouped bar)
- Upcoming vs completed events (pie)
- Volunteer status distribution, including confirmed vs cancelled (pie)

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable          | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `MONGODB_URI`     | MongoDB Atlas connection string (include a database name)                     |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (`openssl rand -base64 32`)                     |
| `NEXTAUTH_URL`    | App URL (`http://localhost:3000` locally, the live URL in production)         |
| `GEMINI_API_KEY`  | Optional. Google AI Studio key. Without it the AI feature uses mock responses |
| `GEMINI_MODEL`    | Optional. Defaults to `gemini-2.5-flash`                                      |

## Local setup

```bash
git clone https://github.com/Taslimapopi/event-volunteer-platform.git
cd event-volunteer-platform
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm seed                    # creates demo users and sample events
pnpm dev                     # http://localhost:3000
```

`pnpm seed` creates the demo users above and sample events (open, full, closed, past and draft) to test every state.

## Deployment (Vercel)

1. Push the repo to GitHub.
2. In MongoDB Atlas, allow network access from `0.0.0.0/0`.
3. Import the repo in Vercel, then add the environment variables above.
4. Deploy, then set `NEXTAUTH_URL` to the live URL and redeploy.
5. Run `pnpm seed` once against the production database (if needed).

## Project structure

```
src/
  app/          pages and API routes (App Router)
  components/   UI, auth, events, organizer, volunteer components
  lib/          db, auth config, validators, capacity logic, AI
  models/       Mongoose models (User, Event, Registration)
  proxy.ts      route protection
scripts/seed.ts demo data
```

## Bonus features

Not implemented.
