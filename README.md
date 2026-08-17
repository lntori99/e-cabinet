# e-Cabinet — Secretariat console

Administrative console for the Government of Malawi's sovereign e-Cabinet programme
(Ministry of Information & Communications Technology, implemented by Bahamus Limited).
Built with **Next.js 16.3 (App Router) + TypeScript + Redux Toolkit + Tailwind CSS v4 +
Headless UI + react-icons**.

There is no public-facing marketing site — the application is the admin side, and the
front door is authentication.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

`npm run build && npm start` for production.

## Routes

| Route | Notes |
|---|---|
| `/` | Server redirect — `/welcome` when a session exists, otherwise `/auth/login` |
| `/auth/login` | First factor: email + password |
| `/auth/mfa` | Second factor: 6-digit code (reachable only mid-sign-in) |
| `/auth/forget-password` | Request a single-use reset link |
| `/auth/reset-password?token=…` | Set a new password |
| `/welcome` | App launcher — the landing screen after sign-in (auth required) |
| `/dashboard` | Secretariat console overview (auth required) |
| `/dashboard/meetings` `…/documents` `…/decisions` `…/video` `…/audit` `…/users` | The console's sections |

Each auth route is a **single `page.tsx`** — markup, field styling and the server action
all inline. Nothing is shared between them on purpose: change one screen and no other
screen moves.

Console routes are `page.tsx` (server: metadata) plus a sibling module file (client:
Redux hooks), flat in the route folder — no `components/` subfolders anywhere.

`src/app/dashboard/layout.tsx` guards the whole segment with `isAuthenticated()` and
wraps it in `MainLayout`, so the shell is defined once and survives client-side
navigation between sections — the Redux store is never remounted.

**File naming:** component files start with a small letter (`sidebar.tsx`,
`mainLayout.tsx`, `meetingsModule.tsx`); the exported component keeps PascalCase.

`src/proxy.ts` (Next 16's replacement for `middleware.ts`) gates `/dashboard/*` on the
presence of a session cookie so unauthenticated visitors bounce to sign-in without
rendering the console. That check is **optimistic only** — the cookie's value is
verified in the page itself via `isAuthenticated()`, which is what actually protects
the route.

## Auth

Two-stage, cookie-based demo auth in `src/lib/auth.ts` (`logoutAction` lives in `src/lib/auth-actions.ts`, since the
console sidebar and header use it):

1. **Password** → `verifyCredentials()` against `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then a
   short-lived `ecab_session_pending` cookie (10 min) and a redirect to `/auth/mfa`.
2. **MFA** → any 6-digit code passes in the demo. On success the pending cookie is
   destroyed and exchanged for the full `ecab_session`, and the operator lands on
   `/welcome`.

`/auth/mfa` redirects back to sign-in when there is no pending cookie, so the second
factor cannot be reached without passing the first. Every `/auth/*` page redirects a
signed-in visitor to `/welcome`.

- Session cookies are httpOnly, `sameSite: lax`, `secure` in production, 8-hour expiry
- The token is a base64url of `secretariat:<AUTH_SECRET>` — **replace with a signed JWT
  or IdP integration before any real deployment**
- Password reset is UI-only: `forget-password` always reports success (so the form
  can't be used to enumerate accounts) and `reset-password` validates the policy in
  `src/lib/password.ts` but does not yet issue or verify a real token

Demo credentials, configured in `.env`:

```
secretariat@cabinet.gov.mw / eCabinet@2026  ·  MFA: any 6-digit code
```

The signed-in operator is hard-coded as `OPERATOR` in `src/core/app-constants.ts` and
is what audit entries are attributed to. Read it from the session once a real IdP is
wired in.

## Welcome screen

`/welcome` is the landing screen after sign-in: the fourteen e-Cabinet functional areas
as tiles, each showing its FR code, short label and full title. The catalogue lives in
`src/data/apps.ts`; a tile with no `href` is a module that has not been built yet and
renders as **Not yet available** rather than linking to a dead route. Ten of the
fourteen currently open into the console — give the rest an `href` as they land.

The console sidebar has an **All apps** link back to it.

## Console modules

- **Overview** — KPIs, action-status chart, latest audit events, platform posture
- **Meetings & agenda** — create meetings, agenda register, **pack freeze** control
- **Cabinet papers** — classification stamps, clearance workflow advance, version history, handling rules (watermark / download / print)
- **Decisions & actions** — recorded outcomes + implementation tracker (click a status badge to update)
- **Video sessions** — host controls: mute, video, remove, lock meeting, pack presentation
- **Audit log** — severity filter + pagination; store mutations append live entries
- **Users & roles** — RBAC register, MFA state, suspend/reactivate

## State — Redux Toolkit

All client state is in one RTK store. `src/core/store.ts` exports a `makeStore()`
**factory**, not a singleton: in the App Router a module-level store would be shared
across requests. `Providers` (`src/core/providers.tsx`) calls it once per client.

| Slice | Holds |
|---|---|
| `meetings` | sittings, expanded row, create-modal flag |
| `documents` | paper register, search request, selected paper |
| `decisions` | recorded decisions + the action tracker |
| `users` | named accounts |
| `audit` | log entries + the `AuditQueryRequest` (severity **and** page — they are one query) |
| `session` | video: lock, pack presentation, participants |
| `ui` | theme (the active section is the URL, not store state) |

Reducers are pure. Everything non-deterministic — timestamps, generated IDs — happens
in `src/core/thunks.ts`, which holds **one thunk per operator action**. Each dispatches
the domain mutation *and* the audit entry it generates, so a component fires one
dispatch for one user intent and the log can't drift from the change that caused it:

```ts
dispatch(freezeMeetingPack({ meetingId: m.id }))
// → meetings/packFrozen  +  audit/logged
```

Derived data is computed in `createSelector` selectors co-located with each slice
(`selectPendingClearance`, `selectActionsByStatus`, `selectFilteredAudit`, …) rather
than in components.

Use the typed hooks from `src/core/hook.ts` — `useAppDispatch`, `useAppSelector`,
`useAppStore` — never the untyped react-redux originals.

State is seeded from `src/data/ecabinet.ts`. Swap the seeds for RTK Query endpoints or
async thunks when the backend is available; the request models already describe the
payloads.

## Typography & theming

**Inter is the only typeface.** The `font-display`, `font-body` and `font-mono`
utilities are kept as distinct tokens in `src/app/globals.css` but all resolve to Inter;
the "mono" token carries `tnum` so audit timestamps and register columns still align in
a grid.

Neutral light/dark mode with a class strategy (`.dark` on `<html>`), a no-flash inline
script in `layout.tsx`, and a toggle in the console header. Design tokens (state green,
seal red, signal amber) are defined via Tailwind v4 `@theme`.

## Structure

```
src/
  app/
    page.tsx           root redirect
    auth/
      login/page.tsx           each auth screen is one self-contained file
      mfa/page.tsx
      forget-password/page.tsx
      reset-password/page.tsx
    dashboard/
      layout.tsx       auth guard + MainLayout
      page.tsx  overview.tsx
      meetings/        page.tsx + meetingsModule.tsx + newMeetingModal.tsx
      documents/  decisions/  video/  audit/  users/    (page.tsx + <name>Module.tsx)
    not-found.tsx, layout.tsx, globals.css
  common/              sidebar, header, nav, ui, logo, modal, pagination
  shared/
    mainLayout.tsx     the console shell — sidebar + header + content column
  core/
    store.ts           makeStore() factory, RootState / AppDispatch / AppThunk
    slices/            one slice per domain, with its createSelector selectors
    thunks.ts          one thunk per operator action (mutation + audit entry)
    providers.tsx      redux Provider + theme ↔ DOM sync
    hook.ts            useAppDispatch / useAppSelector / useAppStore, usePagination
    app-constants.ts
  data/                ecabinet.ts (seed data)
  lib/                 auth.ts
  models/
    request/           payload shapes for every mutation & query
    response/          base-response.ts (domain types)
  proxy.ts             route gate
```

## Request models

Every mutation and query in the console builds a typed request object from
`src/models/request/` before touching the store, so the thunks already take the payload
a real endpoint would receive.

| File | Types |
|---|---|
| `base-request.ts` | `PaginatedRequest` |
| `auth-request.ts` | `LoginRequest`, `MfaRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest` |
| `meeting-request.ts` | `CreateMeetingRequest`, `FreezePackRequest` |
| `document-request.ts` | `SearchDocumentsRequest`, `AdvanceDocumentRequest` |
| `decision-request.ts` | `RecordDecisionRequest`, `UpdateActionStatusRequest` |
| `user-request.ts` | `CreateUserRequest`, `UpdateUserStatusRequest` |
| `session-request.ts` | `UpdateSessionRequest`, `UpdateParticipantRequest`, `RemoveParticipantRequest` |
| `audit-request.ts` | `AuditQueryRequest`, `AuditSeverityFilter` |

`RecordDecisionRequest` and `CreateUserRequest` are defined but not yet wired — the
console has no "record a decision" or "enrol a user" form.
