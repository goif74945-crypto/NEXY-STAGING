# NEXY V1 Repository Blueprint

This file is the authoritative path map and project-state blueprint for the clean deterministic rebuild in `NEXY-STAGING`.

It defines:

- canonical root paths
- allowed implementation locations
- current root architecture
- repair wave history
- deterministic runtime law
- auth / OTAC foundation boundary
- middleware / auth gate boundary
- repository wiring ownership
- UI/page integration ownership
- test/stub coverage targets
- files that must not be imported or touched without explicit audit

It is not a replacement for source code, GitHub inspection, typecheck logs, build logs, test logs, or deployment logs.

---

## 1. Project Identity

```text
Project: NEXY-STAGING
Purpose: clean deterministic staging root for the NEXY.AI rebuild
Repository: goif74945-crypto/NEXY-STAGING
Branch: main
Canonical root: src/...
Legacy root: apps/web/** is forbidden for root build
Global deployability: NOT VERIFIED
```

NEXY-STAGING is the active root rebuild lane for NEXY.AI. The project is being rebuilt around deterministic root architecture, strict TypeScript, explicit contracts, server-owned boundaries, and repository-backed static foundation behavior.

The root build must not depend on legacy prototype files.

---

## 2. Canonical Root Lock

The canonical implementation root is:

```text
src/...
```

The root build must not use:

```text
apps/web/**
```

Rules:

- Do not import from `apps/web/**`.
- Do not depend on legacy prototype files.
- Do not rename canonical root paths without explicit instruction.
- Do not move root modules to another folder.
- Do not create alternate root trees.
- Do not use audit summary as a substitute for real file inspection.
- Before editing any file, read the real file state from the repository.

---

## 3. Global Runtime Law

Root foundation and deterministic runtime code must not use:

```text
Date.now
Math.random
crypto.randomUUID
runtime entropy
real database calls
PrismaClient runtime instantiation
fetch/network
filesystem
process.env hidden fallback
window/document/localStorage in foundation/server code
global mutable runtime client
hidden side effects
silent fallback
silent downgrade
```

Root code must use:

```text
explicit input
zod validation
strict schemas
deterministic static data
repository/helper boundaries
cloned return objects/arrays
machine-readable status
explicit auth mode labels
```

---

## 4. Deployability Lock

Current deployability status:

```text
GLOBAL DEPLOYABILITY = NOT VERIFIED
```

Required verification commands:

```bash
npm install
npm run typecheck
npm run build
npm test
```

Do not claim:

```text
production ready
deployable
build passed
typecheck passed
tests passed
secure production auth
real session persistence
real OTAC persistence
real email delivery
```

unless real command logs and source evidence exist.

---

## 5. Root Set / Repair Wave Status

Current project-state record:

```text
SET ROOT-01 = VERIFIED by prior project audit context
SET ROOT-02 = VERIFIED by prior project audit context
SET ROOT-03 = VERIFIED by prior project audit context
SET ROOT-04 = FOUNDATION LOCK REPAIR generated / requires real repo verification after manual paste
SET ROOT-05 = VERIFIED by current project status context
SET ROOT-06 = VERIFIED by current project status context
SET ROOT-07 = API ROUTE INTEGRATION + REPOSITORY WIRING generated in repair batches
SET ROOT-08 = UI/PAGE INTEGRATION generated in repair batch
SET ROOT-09 = TEST / STUB COMPLETION generated in repair batch
SET ROOT-10 = DETERMINISTIC / RUNTIME LAW AUDIT REPAIR generated in repair batch
CRITICAL REPAIR C1 = ROOT AUTH / OTAC FOUNDATION generated and later observed in several auth files
CRITICAL REPAIR C2 = ABSOLUTE MIDDLEWARE + AUTH GATE LOCK generated; requires manual paste confirmation
GLOBAL DEPLOYABILITY = NOT VERIFIED
```

Important:

- Generated code is not proof that the repository has been changed.
- The user applies code manually.
- Every future audit must inspect real GitHub files again.
- Do not mark a repair as complete unless the target files are read after manual paste.

---

## 6. Root File Map

### Root files

```text
package.json
tsconfig.json
next.config.ts
eslint.config.mjs
.gitignore
.env.example
README.md
REPO_BLUEPRINT_NEXY_V1.md
next-env.d.ts
```

Current root file rules:

- `package.json` must keep the root scripts and dependencies stable unless explicitly targeted.
- `tsconfig.json` must not be rewritten unless explicitly targeted.
- `.env.example` must contain deterministic placeholder values only.
- `README.md` records current status and latest repair waves.
- `REPO_BLUEPRINT_NEXY_V1.md` records exact path ownership and system blueprint.
- `next-env.d.ts` must remain the canonical Next type reference file.

---

## 7. Environment Contract

`.env.example` must contain only deterministic placeholder values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexy_staging?schema=public
NEXY_ENV=development
NEXY_AUTH_SECRET=replace-with-local-development-secret
```

Forbidden in `.env.example` for the foundation lock:

```text
real secrets
NODE_ENV
APP_BASE_URL
SESSION_COOKIE_NAME
SESSION_TTL_MINUTES
OTAC_TTL_MINUTES
```

---

## 8. Prisma Foundation Contract

### Prisma file

```text
prisma/schema.prisma
```

Required minimal generator:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Required datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Required models:

```text
AuditEvent
SessionRecord
RunRecord
```

Foundation lock rules:

- No `@default(now())`.
- No `DateTime` automatic clock fields.
- No enum expansion unless explicitly requested.
- No relation complexity during foundation phase.
- No extra models unless the schema expansion is explicitly unlocked.
- Prisma schema may exist, but deterministic repository code must not call real DB.
- `src/lib/db/prisma.ts` must be descriptor-only unless runtime Prisma is explicitly unlocked.

---

## 9. App Router Pages

### Root page files

```text
src/app/layout.tsx
src/app/page.tsx
src/app/front-door/page.tsx
src/app/view/page.tsx
src/app/run/page.tsx
src/app/forge/page.tsx
src/app/sessions/page.tsx
src/app/runs/[id]/page.tsx
src/app/runs/[id]/compare/page.tsx
```

### SET ROOT-08 page integration ownership

`src/app/page.tsx` should be the root status/dashboard entry surface.

It should show:

```text
SET ROOT-05 = VERIFIED
SET ROOT-06 = VERIFIED
SET ROOT-07 = VERIFIED
SET ROOT-08 = active
GLOBAL DEPLOYABILITY = NOT VERIFIED
```

It should use deterministic root components where appropriate:

```text
PulsePreview
AgentStatusPanel
SessionTools
```

It may use deterministic repository functions:

```text
getDashboardSummary
getDashboardAgents
getDashboardRecentRuns
getDashboardIncidents
```

`src/app/front-door/page.tsx` should integrate:

```text
PulsePreview
getDashboardSummary
getDashboardRecentRuns
getDashboardIncidents
```

`src/app/view/page.tsx` should be a deterministic review surface for output/release state and should use repository data instead of static isolated lists when appropriate.

Page rules:

- No fetch.
- No DB.
- No filesystem.
- No runtime clock.
- No random.
- No apps/web import.
- Use server components unless a client component is truly required.
- Do not create new UI components if existing root components are sufficient.

---

## 10. API Route Map

### Auth API routes

```text
src/app/api/auth/request-otac/route.ts
src/app/api/auth/verify-otac/route.ts
src/app/api/auth/me/route.ts
src/app/api/auth/sessions/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/revoke-session/route.ts
src/app/api/auth/revoke-all-other-sessions/route.ts
```

### Directives and runs

```text
src/app/api/directives/route.ts
src/app/api/runs/route.ts
src/app/api/runs/recent/route.ts
src/app/api/runs/[id]/route.ts
src/app/api/runs/[id]/history/route.ts
src/app/api/runs/[id]/compare/route.ts
src/app/api/runs/[id]/freeze/route.ts
src/app/api/runs/[id]/unfreeze/route.ts
src/app/api/runs/[id]/kill/route.ts
```

### Outputs and artifacts

```text
src/app/api/outputs/[id]/export/route.ts
src/app/api/artifacts/[id]/lock/route.ts
```

### Incidents

```text
src/app/api/incidents/route.ts
src/app/api/incidents/[id]/route.ts
src/app/api/incidents/[id]/resolve/route.ts
```

### Dashboard, telemetry, queue, agents

```text
src/app/api/dashboard/summary/route.ts
src/app/api/dashboard/recent-runs/route.ts
src/app/api/dashboard/incidents/route.ts
src/app/api/dashboard/agents/route.ts
src/app/api/agents/status/route.ts
src/app/api/queue/status/route.ts
src/app/api/telemetry/runs/route.ts
src/app/api/telemetry/system/route.ts
src/app/api/front-door/pulse/route.ts
```

---

## 11. API Route Contract

Every route should preserve the root envelope/error pattern.

Expected imports for route files when needed:

```ts
import { NextResponse } from 'next/server';

import { makeEnvelope } from '@/lib/http/envelope';
import {
  getHttpStatusFromRouteError,
  toRouteError,
  toRouteErrorEnvelope,
} from '@/lib/http/route-error';
```

Use `createRouteError` only when route logic needs explicit route errors such as `not_found` or `bad_request`.

Expected dynamic route context typing:

```ts
context: { params: Promise<{ id: string }> }
```

Expected success envelope shape:

```ts
makeEnvelope({
  status: 'OK',
  requestId: REQUEST_ID,
  data,
})
```

Expected error flow:

```ts
const routeError = toRouteError(error);

return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
  status: getHttpStatusFromRouteError(routeError),
});
```

Route rules:

- Do not keep duplicate static data in routes when repository owns that data.
- Do not duplicate repository schemas inside routes unless route-only validation is required.
- Do not call DB.
- Do not instantiate PrismaClient.
- Do not fetch.
- Do not use filesystem.
- Do not use runtime clock/random.
- Do not import from `apps/web/**`.

---

## 12. SET ROOT-07 Repository Wiring Map

Dashboard route wiring:

```text
src/app/api/dashboard/summary/route.ts       -> getDashboardSummary()
src/app/api/dashboard/recent-runs/route.ts   -> getDashboardRecentRuns()
src/app/api/dashboard/incidents/route.ts     -> getDashboardIncidents()
src/app/api/dashboard/agents/route.ts        -> getDashboardAgents()
```

Run route wiring:

```text
src/app/api/runs/route.ts                    -> listRuns()
src/app/api/runs/[id]/route.ts               -> getRunById()
src/app/api/runs/recent/route.ts             -> listRecentRuns()
```

Ops route wiring:

```text
src/app/api/agents/status/route.ts           -> getDashboardAgents()
src/app/api/queue/status/route.ts            -> getQueueStatus()
src/app/api/telemetry/runs/route.ts          -> getRunTelemetry()
src/app/api/telemetry/system/route.ts        -> getSystemTelemetry()
```

Incident route wiring:

```text
src/app/api/incidents/route.ts               -> listIncidents(), createIncidentRecord()
src/app/api/incidents/[id]/route.ts          -> getIncidentById()
src/app/api/incidents/[id]/resolve/route.ts  -> resolveIncident()
```

Output/artifact route wiring:

```text
src/app/api/outputs/[id]/export/route.ts     -> buildOutputExportDescriptor()
src/app/api/artifacts/[id]/lock/route.ts     -> lockArtifact()
```

---

## 13. Components

### Dashboard components

```text
src/components/dashboard/mode-switcher.tsx
src/components/dashboard/agent-status-panel.tsx
src/components/dashboard/session-list-panel.tsx
src/components/dashboard/session-tools.tsx
src/components/dashboard/run-summary-panel.tsx
src/components/dashboard/incident-list-panel.tsx
```

### Front door components

```text
src/components/front-door/pulse-preview.tsx
```

### Runs components

```text
src/components/runs/run-detail-client.tsx
src/components/runs/run-compare-client.tsx
src/components/runs/run-list.tsx
```

Component rules:

- No fetch.
- No DB.
- No filesystem.
- No runtime random.
- No runtime clock.
- No apps/web imports.
- No external UI dependency unless explicitly approved.
- Use deterministic props.
- If component is already valid, do not rewrite it for style.

Known root component contracts from recent work:

```text
PulsePreview accepts deterministic pulse props.
AgentStatusPanel accepts deterministic agents props.
SessionTools returns deterministic React element.
```

---

## 14. Shared Libraries

### Config and DB

```text
src/lib/config/env.ts
src/lib/db/prisma.ts
```

`src/lib/config/env.ts` expected exports:

```text
EnvSchema
Env
parseEnv
buildEnv
```

Rules:

- zod schema must be strict.
- No module-level `process.env` parsing.
- No singleton parsed env export.
- No silent fallback.
- `parseEnv(input: unknown)`.
- `buildEnv(input: unknown)`.

`src/lib/db/prisma.ts` expected exports:

```text
PrismaClientDescriptorSchema
PrismaClientDescriptor
createPrismaClientDescriptor
```

Rules:

- descriptor-only
- no PrismaClient import
- no PrismaClient instantiation
- no database call
- no process.env
- no global mutable client

---

## 15. Auth Libraries

```text
src/lib/auth/session-types.ts
src/lib/auth/session.ts
src/lib/auth/require-session.ts
src/lib/auth/require-owner.ts
src/lib/auth/require-operator-or-owner.ts
src/lib/auth/mode-access.ts
src/lib/auth/route-policy.ts
src/lib/auth/session-cookie.ts
```

### Auth mode lock

Current root auth mode:

```text
deterministic_fixture_not_production
```

This is not production auth.

Allowed claims:

```text
deterministic fixture auth contract exists
explicit now_epoch_ms guard exists
server-owned deterministic OTAC fixture exists
OTAC public/server descriptor separation exists
middleware policy can require cookie presence for protected route access
```

Forbidden claims:

```text
production auth
secure production login
real email delivery
real session persistence
real OTAC persistence
real cookie-backed persistent session store
```

---

## 16. CRITICAL REPAIR C1 — Auth / OTAC Foundation

C1 target:

```text
root OTAC/auth mock -> deterministic server-owned contract
```

C1 target files:

```text
src/app/api/auth/request-otac/route.ts
src/app/api/auth/verify-otac/route.ts
src/app/api/auth/me/route.ts
src/app/api/auth/sessions/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/revoke-session/route.ts
src/app/api/auth/revoke-all-other-sessions/route.ts
src/lib/auth/session.ts
src/lib/auth/session-types.ts
src/lib/auth/require-session.ts
src/lib/auth/require-owner.ts
src/lib/auth/require-operator-or-owner.ts
tests/auth-session-routes.ts
```

C1 rules:

- Do not use client-provided OTAC record as source of truth.
- `request-otac` must not send secret code or server record in public response.
- `verify-otac` must not accept a full server record from client.
- Separate public response and server-side descriptor.
- Include TTL fields:

```text
issued_at_epoch_ms
expires_at_epoch_ms
consumed_at_epoch_ms
```

- Include attempt/rate-limit fields:

```text
attempt_count
max_attempts
```

- Include hash/salt fields:

```text
code_hash
salt
```

- Do not use runtime random.
- Do not claim email delivery.
- Do not claim real one-time persistence.
- Do not hardcode owner session in routes as source truth.
- Use deterministic fixture helpers instead.

Expected auth/session helper exports include:

```text
getAuthFixtureNowEpochMs
getCurrentSessionFixture
listSessionFixtures
getSessionFixtureById
logoutCurrentSessionFixture
revokeSessionFixture
revokeAllOtherSessionFixtures
requestDeterministicOtac
verifyDeterministicOtac
getDeterministicOtacFixtureRecord
```

---

## 17. CRITICAL REPAIR C2 — Middleware + Auth Gate Lock

C2 target:

```text
absolute middleware + deterministic route auth gate
```

C2 allowed repair files only:

```text
src/middleware.ts
src/lib/auth/route-policy.ts
src/lib/auth/session-cookie.ts
tests/root-security-auth-gate.ts
```

C2 middleware must:

- import `NextRequest` and `NextResponse` from `next/server`
- import `evaluateRoutePolicy` from `@/lib/auth/route-policy`
- import `getSessionCookieValue` from `@/lib/auth/session-cookie`
- import `makeEnvelope` from `@/lib/http/envelope`
- inspect `request.nextUrl.pathname`
- bypass static/internal paths from policy
- allow public paths from policy
- require session cookie for protected paths
- return deterministic 401 envelope when cookie missing
- call `NextResponse.next()` when cookie exists
- set headers:

```text
x-nexy-auth-mode = deterministic_fixture_not_production
x-nexy-route-access = requires_session
```

C2 middleware must not:

- validate real persistent session
- call DB
- call network
- read filesystem
- use runtime clock
- use random
- claim production security

Middleware 401 envelope:

```text
status = ERROR
requestId = middleware_auth_required
traceId = middleware_auth_required
data = null
error.code = AUTH_REQUIRED
error.message = Authentication is required for this route.
```

---

## 18. Route Policy Contract

File:

```text
src/lib/auth/route-policy.ts
```

Required exports:

```text
RouteAccessLevelSchema
RoutePolicyDecisionSchema
RouteAccessLevel
RoutePolicyDecision
evaluateRoutePolicy
isBypassPath
isPublicPath
isProtectedPath
```

Access levels:

```text
bypass
public
requires_session
```

Bypass paths:

```text
/_next/static
/_next/image
/favicon.ico
```

Public paths:

```text
/
/front-door
/view
/run
/forge
/sessions
/api/auth/request-otac
/api/auth/verify-otac
```

Protected prefixes:

```text
/api/auth/me
/api/auth/sessions
/api/auth/logout
/api/auth/revoke-session
/api/auth/revoke-all-other-sessions
/api/runs
/api/directives
/api/incidents
/api/artifacts
/api/outputs
/api/telemetry
/api/queue
/api/agents
```

Unknown API path:

```text
/api/* -> requires_session
```

Unknown non-api app page:

```text
public unless dangerous path
```

Dangerous app path prefixes:

```text
/admin
/internal
/private
/security
/vault
```

Route policy rules:

- zod strict schema.
- no runtime clock.
- no random.
- no crypto.
- no env.
- no fetch.
- no filesystem.
- no mutable global state.

---

## 19. Session Cookie Contract

File:

```text
src/lib/auth/session-cookie.ts
```

Required exports:

```ts
parseCookieHeader(header: string | null): Readonly<Record<string, string>>
getSessionCookieValue(header: string | null): string | null
```

Cookie parser rules:

- `null` header -> empty object
- empty string -> empty object
- split by `;`
- trim key and value
- ignore malformed empty key
- decodeURIComponent safely
- if decode fails, use raw value
- duplicate policy: last duplicate wins
- no uncontrolled throw
- no dependency

Session cookie name comes from:

```text
SESSION_COOKIE_NAME
```

defined in:

```text
src/lib/auth/session.ts
```

Expected cookie name:

```text
nexy_session
```

---

## 20. Errors / Validation / Verification

```text
src/lib/errors/app-errors.ts
src/lib/errors/failure-map.ts
src/lib/validation.ts
src/lib/verify/checklist.ts
```

Rules:

- Errors must be machine-readable.
- Route errors must map to stable HTTP status.
- Validation helpers must be deterministic.
- Checklist helpers must be deterministic.
- No hidden fallback.
- No broad untyped error shape.
- No `any`.

---

## 21. HTTP / Schema Libraries

```text
src/lib/http/envelope.ts
src/lib/http/route-error.ts
src/lib/http/errors.ts
src/lib/http/release-policy.ts
src/lib/http/state.ts
src/lib/schemas/pack6-responses.ts
```

Core expected exports:

```text
makeEnvelope
toRouteError
toRouteErrorEnvelope
getHttpStatusFromRouteError
createRouteError
```

Rules:

- Envelope shape must remain stable.
- Error response must be deterministic.
- Route files should not invent alternate envelope shapes.
- Middleware 401 must use the canonical `makeEnvelope`.

---

## 22. Types

```text
src/lib/types/modes.ts
src/lib/types/output-class.ts
```

Mode values:

```text
VIEW
RUN
FORGE
```

Output class values:

```text
RAW
CLEAN
FINAL
REJECT
```

Rules:

- Do not change enum values.
- Do not rename parser functions.
- Do not add legacy output classes.
- Do not import output classes from `apps/web/**`.

---

## 23. Repositories

```text
src/lib/repositories/session-repository.ts
src/lib/repositories/run-repository.ts
src/lib/repositories/incident-repository.ts
src/lib/repositories/artifact-repository.ts
src/lib/repositories/dashboard-repository.ts
src/lib/repositories/telemetry-repository.ts
src/lib/repositories/audit-repository.ts
```

Repository rules:

- deterministic static repository only
- no DB
- no PrismaClient
- no fetch
- no filesystem
- no Date.now
- no Math.random
- return cloned objects/arrays
- zod object schemas must use `.strict()`
- no mutable runtime state
- no hidden side effects

Expected repository function map:

```text
dashboard-repository.ts
- getDashboardSummary
- getDashboardRecentRuns
- getDashboardIncidents
- getDashboardAgents

run-repository.ts
- listRuns
- getRunById
- listRecentRuns

incident-repository.ts
- listIncidents
- getIncidentById
- createIncidentRecord
- resolveIncident

artifact-repository.ts
- listArtifacts
- getArtifactById
- buildOutputExportDescriptor
- lockArtifact

telemetry-repository.ts
- getQueueStatus
- getRunTelemetry
- getSystemTelemetry

audit-repository.ts
- listAuditRecords
- getAuditRecordById
```

---

## 24. Runtime Helpers

```text
src/lib/utils/ids.ts
src/lib/utils/text-diff.ts
src/lib/front-door/pulse.ts
src/lib/ui/format.ts
src/lib/ui/http-client.ts
```

### ID helper contract

File:

```text
src/lib/utils/ids.ts
```

Required exports:

```text
createRequestId
createEntityId
```

Required behavior:

```text
createRequestId(prefix, value)
createEntityId(prefix, value)
```

Example:

```text
createRequestId('req', 'Alpha 001') -> req_alpha_001
createEntityId('run', 'RUN 001') -> run_run_001
```

Rules:

- explicit input only
- no random suffix
- no UUID
- no runtime clock
- no crypto import
- no env fallback
- lowercase output
- trim whitespace
- replace invalid characters with `_`
- collapse repeated `_`
- remove leading/trailing `_`
- throw deterministic Error for invalid prefix/value

---

## 25. Middleware

```text
src/middleware.ts
```

Middleware must not be pass-through only after C2 is applied.

Expected middleware ownership:

```text
route-policy decides access level
session-cookie parses cookie header
middleware enforces cookie presence for protected paths
middleware does not validate real persistent session
middleware does not claim production security
```

Allowed behavior:

```text
bypass -> NextResponse.next()
public -> NextResponse.next()
requires_session + no cookie -> 401 deterministic envelope
requires_session + cookie -> NextResponse.next() with auth headers
```

---

## 26. Tests

Core tests:

```text
tests/pack1-foundation.ts
tests/pack1-validation.ts
tests/auth-session-routes.ts
tests/mode-and-output-enforcement.ts
tests/root-repository-wiring.ts
tests/root-ui-components.ts
tests/root-deterministic-runtime-law.ts
tests/root-security-auth-gate.ts
```

Stubs:

```text
tests/stubs/next-server.ts
tests/stubs/next-navigation.ts
tests/stubs/prisma-client.ts
```

Legacy/blueprint-listed stubs that must be verified before use:

```text
tests/stubs/zod.ts
tests/stubs/ulid.ts
```

Test rules:

- Use `node:test`.
- Use `node:assert/strict`.
- Do not use DOM library.
- Do not use testing-library.
- Do not add dependency.
- Do not create `.tsx` tests while script is `tests/**/*.ts`.
- Import from `../src/**`.
- Do not import from `apps/web/**`.
- No DB.
- No network.
- No filesystem.
- No runtime clock.
- No random.

Expected test script:

```json
"test": "tsx --test tests/**/*.ts"
```

---

## 27. SET ROOT-09 Test Coverage Targets

Generated test file:

```text
tests/root-repository-wiring.ts
```

Required coverage:

```text
getDashboardSummary()
getDashboardRecentRuns()
getDashboardIncidents()
getDashboardAgents()
listRuns()
getRunById('run_001')
getRunById('missing') returns null
listRecentRuns() sorted deterministically
```

Generated test file:

```text
tests/root-ui-components.ts
```

Required coverage:

```text
PulsePreview accepts deterministic pulse props
AgentStatusPanel accepts deterministic agents props
SessionTools returns deterministic React element
```

Generated test file:

```text
tests/root-deterministic-runtime-law.ts
```

Required coverage:

```text
createRequestId('req', 'Alpha 001') -> req_alpha_001
createEntityId('run', 'RUN 001') -> run_run_001
invalid empty prefix throws
invalid empty value throws
repeated calls with same input produce same output
output has no spaces
output has no uppercase
output does not match UUID/random shape
```

Generated test file:

```text
tests/root-security-auth-gate.ts
```

Required coverage:

```text
/_next/static/chunk.js -> bypass
/front-door -> public
/api/auth/request-otac -> public
/api/auth/me -> requires_session
/api/unknown -> requires_session
getSessionCookieValue(null) -> null
getSessionCookieValue('nexy_session=session_owner_001') -> session_owner_001
parseCookieHeader handles multiple cookies
decode malformed cookie does not throw
evaluateRoutePolicy repeated call returns same object value
```

---

## 28. Manual Repair Workflow

When applying repairs manually:

1. Read the real file from GitHub.
2. Classify it as one of:

```text
OK
MISSING
EMPTY
EXISTS_NON_EMPTY_NEEDS_REPAIR
FREEZE
```

3. Do not rewrite `OK` files.
4. Generate full replacement code only for failed files.
5. Do not provide partial patches.
6. Do not provide diff-only output.
7. User manually pastes code.
8. Re-read the file after paste.
9. Run verification commands only when ready.
10. Do not claim success without logs.

---

## 29. Current High-Risk / Must Re-Audit Files

The following files are high-risk because they were recently generated or repaired and may not have been manually pasted yet:

```text
src/middleware.ts
src/lib/auth/route-policy.ts
src/lib/auth/session-cookie.ts
tests/root-security-auth-gate.ts
```

Also re-audit after manual paste:

```text
src/lib/utils/ids.ts
tests/root-deterministic-runtime-law.ts
tests/root-repository-wiring.ts
tests/root-ui-components.ts
src/app/page.tsx
src/app/view/page.tsx
src/app/front-door/page.tsx
src/app/api/agents/status/route.ts
src/app/api/queue/status/route.ts
src/app/api/telemetry/runs/route.ts
src/app/api/telemetry/system/route.ts
src/app/api/incidents/route.ts
src/app/api/incidents/[id]/route.ts
src/app/api/incidents/[id]/resolve/route.ts
src/app/api/outputs/[id]/export/route.ts
src/app/api/artifacts/[id]/lock/route.ts
src/lib/repositories/incident-repository.ts
src/lib/repositories/artifact-repository.ts
src/lib/repositories/telemetry-repository.ts
```

---

## 30. File Write / Repair Policy

Allowed repair statuses:

```text
OK
MISSING
EMPTY
EXISTS_NON_EMPTY_NEEDS_REPAIR
FREEZE
```

Do not use vague statuses:

```text
probably
maybe
looks okay
seems fine
should work
likely
close enough
```

Rules:

- `OK` means the file was read and matches the current contract.
- `MISSING` means the path was read and returned not found.
- `EMPTY` means the file exists but contains no useful code/content.
- `EXISTS_NON_EMPTY_NEEDS_REPAIR` means the file exists but violates the current contract.
- `FREEZE` means real file state cannot be verified or the operation would break a lock.

---

## 31. Forbidden Changes Without Explicit Approval

Do not change:

```text
canonical root src/...
OutputClassSchema = RAW | CLEAN | FINAL | REJECT
Mode schema = VIEW | RUN | FORGE
route envelope shape
route error helper flow
repository deterministic/no-DB contract
auth mode label deterministic_fixture_not_production
test command without explicit reason
package dependencies
```

Do not touch:

```text
apps/web/**
node_modules/**
.next/**
dist/**
coverage/**
package-lock.json
```

unless explicitly requested and audited.

---

## 32. Final Blueprint Position

```text
NEXY-STAGING is a deterministic root rebuild.
src/... is the only canonical root.
apps/web/** is forbidden for root build.
Repository layer owns deterministic static data.
Routes must call repository/helper layer instead of owning duplicate static data.
Pages must use deterministic repository data and root components.
Auth is deterministic_fixture_not_production.
Middleware gate is deterministic policy + cookie presence only.
Runtime entropy is forbidden.
Global deployability is NOT VERIFIED until real logs exist.
```

When inserting real code, use the exact paths in this blueprint unless a conflict is explicitly audited first.
