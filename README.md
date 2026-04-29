# NEXY-STAGING

NEXY-STAGING is the clean deterministic staging root for the NEXY.AI rebuild.

This repository is the active root rebuild lane for NEXY.AI. The canonical build target is the `src/...` tree. The legacy `apps/web/**` tree must not be used by the root build, must not be imported by root files, and must not be treated as an authority for current root implementation.

This README records the latest project state, source locks, repair history, execution rules, deployability status, and pending verification requirements.

---

## 1. Project Identity

**Project name:** `NEXY-STAGING`

**Purpose:** clean deterministic staging root for the NEXY.AI rebuild.

**Canonical root:** `src/...`

**Repository:** `goif74945-crypto/NEXY-STAGING`

**Branch:** `main`

**Current architecture lane:** root App Router + deterministic repository layer + strict TypeScript foundation.

The root build is designed to avoid legacy path drift, hidden runtime side effects, unsafe mock auth assumptions, and uncontrolled nondeterminism.

---

## 2. Canonical Root Lock

The canonical root is:

```text
src/...

The following tree is not part of the root build:

apps/web/**

Rules:

Root files must not import from apps/web/**.
Root routes must not depend on legacy prototype files.
Root components must not depend on legacy UI state.
Root tests must import from ../src/** only.
Root build state must be evaluated from src/..., tests/..., root config files, and explicit project contracts.
3. Global Deployability Status
GLOBAL DEPLOYABILITY = NOT VERIFIED

This repository must not be described as production ready or deployable without real command logs.

Deployability requires real logs from the target environment for:

npm install
npm run typecheck
npm run build
npm test

Until those logs exist and are reviewed, the correct status is:

DEPLOYABILITY: NOT VERIFIED

Do not claim:

production ready
deployable
build passed
typecheck passed
tests passed
secure production auth
real email delivery
real session persistence
real database persistence

unless real logs and implementation evidence exist.

4. Hard Locks

The following locks are active:

Keep canonical root as src/....
Do not import from apps/web/**.
Do not rename locked modules, functions, types, or paths without explicit instruction.
Do not refactor architecture without explicit instruction.
Do not add runtime dependencies without explicit instruction.
Do not create package-lock.json unless explicitly required.
Do not use real database calls in deterministic foundation code.
Do not instantiate PrismaClient at runtime in foundation code.
Do not use fetch or network calls.
Do not use filesystem calls.
Do not use Date.now.
Do not use Math.random.
Do not use crypto.randomUUID.
Do not use runtime entropy.
Do not use window, document, or localStorage in root server/foundation code.
Do not use any.
Do not leave TODO.
Do not leave placeholder implementation.
Do not use pseudo-code.
Do not silently fallback.
Do not silently downgrade.
Do not claim verification without real evidence.
5. Root Set Status

Current known status from project continuation work:

SET ROOT-01 = VERIFIED by prior audit context
SET ROOT-02 = VERIFIED by prior audit context
SET ROOT-03 = VERIFIED by prior audit context
SET ROOT-04 = FOUNDATION LOCK REPAIRED BY GENERATED CODE, deployability not verified
SET ROOT-05 = VERIFIED by current project status context
SET ROOT-06 = VERIFIED by current project status context
SET ROOT-07 = API ROUTE INTEGRATION / REPOSITORY WIRING repaired in generated code batches
SET ROOT-08 = UI/PAGE INTEGRATION repaired in generated code batch
SET ROOT-09 = TEST / STUB COMPLETION repaired in generated code batch
SET ROOT-10 = DETERMINISTIC / RUNTIME LAW AUDIT repaired in generated code batch
CRITICAL REPAIR C1 = ROOT AUTH / OTAC FOUNDATION repaired in generated code and observed applied in several auth files
CRITICAL REPAIR C2 = ABSOLUTE MIDDLEWARE + AUTH GATE LOCK generated, pending manual paste unless already applied after this README update
GLOBAL DEPLOYABILITY = NOT VERIFIED

Important:

Some repairs were generated as full replacement code for manual paste.
A file is not considered changed in the repository unless the code was actually pasted and committed by the user.
This README does not claim build, typecheck, test, or deployment success.
Any future audit must inspect GitHub file contents directly before declaring a file valid.
6. Latest Observed README State Before This Update

The previous README described:

NEXY-STAGING
canonical root src/...
apps/web/** exclusion
SET ROOT-01/02/03 verified
SET ROOT-04 foundation lock
required verification commands

This update expands the README to include the later repair waves:

ROOT-07 API route wiring
ROOT-08 UI/page integration
ROOT-09 tests/stubs
ROOT-10 deterministic runtime law
CRITICAL REPAIR C1 auth/OTAC foundation
CRITICAL REPAIR C2 middleware/auth gate lock
7. Architecture Overview

Current root architecture:

Next.js App Router
→ src/app/**
→ src/app/api/**
→ src/components/**
→ src/lib/**
→ src/lib/repositories/**
→ src/lib/http/**
→ src/lib/auth/**
→ tests/**

Core flow:

Request
→ route policy / route handler
→ zod validation
→ deterministic repository/helper layer
→ makeEnvelope()
→ NextResponse.json()

Error flow:

unknown error
→ toRouteError()
→ toRouteErrorEnvelope()
→ getHttpStatusFromRouteError()
→ NextResponse.json()

Repository flow:

static deterministic source
→ zod schema validation
→ cloned object/array return
→ no mutation
→ no DB
→ no network
→ no filesystem

UI flow:

server component
→ deterministic repository function
→ existing root component
→ static render
→ no fetch
→ no apps/web import

Auth foundation flow:

deterministic fixture contract
→ explicit now_epoch_ms
→ requireSession / role guard
→ no production claim
→ no persistent store claim
→ no random OTAC generation

Middleware/auth gate flow:

request.nextUrl.pathname
→ evaluateRoutePolicy(pathname)
→ bypass / public / requires_session
→ cookie parse via getSessionCookieValue()
→ deterministic 401 envelope if missing session cookie
→ NextResponse.next() with auth headers if cookie exists
8. Root HTTP Envelope Contract

Routes should use:

makeEnvelope({
  status: 'OK',
  requestId: REQUEST_ID,
  data,
})

Error routes should use:

const routeError = toRouteError(error);

return NextResponse.json(toRouteErrorEnvelope(routeError, REQUEST_ID), {
  status: getHttpStatusFromRouteError(routeError),
});

Middleware 401 envelope contract from C2:

makeEnvelope({
  status: 'ERROR',
  requestId: 'middleware_auth_required',
  traceId: 'middleware_auth_required',
  data: null,
  error: {
    code: 'AUTH_REQUIRED',
    message: 'Authentication is required for this route.',
  },
})
9. Repository Layer Contract

Repository files must be deterministic static repository layers.

Rules:

No DB call.
No PrismaClient runtime.
No fetch.
No filesystem.
No runtime clock.
No random.
No hidden mutable state.
Return cloned objects/arrays.
Use zod schemas.
Use .strict() for object schemas.
Do not let route files duplicate static data that repository files already own.

Repository files currently used by root repairs include:

src/lib/repositories/dashboard-repository.ts
src/lib/repositories/run-repository.ts
src/lib/repositories/incident-repository.ts
src/lib/repositories/artifact-repository.ts
src/lib/repositories/telemetry-repository.ts
src/lib/repositories/audit-repository.ts

Expected repository functions include:

getDashboardSummary
getDashboardRecentRuns
getDashboardIncidents
getDashboardAgents

listRuns
getRunById
listRecentRuns

listIncidents
getIncidentById
createIncidentRecord
resolveIncident

listArtifacts
getArtifactById
buildOutputExportDescriptor
lockArtifact

getQueueStatus
getRunTelemetry
getSystemTelemetry

listAuditRecords
getAuditRecordById
10. SET ROOT-07 — API Route Integration + Repository Wiring

Purpose:

Move static route-owned data and schemas into deterministic repository functions where repository support exists.

Routes repaired or targeted:

src/app/api/dashboard/summary/route.ts
src/app/api/dashboard/recent-runs/route.ts
src/app/api/dashboard/incidents/route.ts
src/app/api/dashboard/agents/route.ts
src/app/api/runs/route.ts
src/app/api/runs/[id]/route.ts
src/app/api/runs/recent/route.ts
src/app/api/agents/status/route.ts
src/app/api/queue/status/route.ts
src/app/api/telemetry/runs/route.ts
src/app/api/telemetry/system/route.ts
src/app/api/incidents/route.ts
src/app/api/incidents/[id]/route.ts
src/app/api/incidents/[id]/resolve/route.ts
src/app/api/outputs/[id]/export/route.ts
src/app/api/artifacts/[id]/lock/route.ts

Required wiring:

dashboard/summary       → getDashboardSummary()
dashboard/recent-runs   → getDashboardRecentRuns()
dashboard/incidents     → getDashboardIncidents()
dashboard/agents        → getDashboardAgents()

runs                    → listRuns()
runs/[id]               → getRunById()
runs/recent             → listRecentRuns()

agents/status           → getDashboardAgents()
queue/status            → getQueueStatus()
telemetry/runs          → getRunTelemetry()
telemetry/system        → getSystemTelemetry()

incidents               → listIncidents(), createIncidentRecord()
incidents/[id]          → getIncidentById()
incidents/[id]/resolve  → resolveIncident()

outputs/[id]/export     → buildOutputExportDescriptor()
artifacts/[id]/lock     → lockArtifact()

Rules:

Preserve NextResponse.
Preserve makeEnvelope.
Preserve route error helpers.
Preserve request ID constants.
Preserve envelope shape.
Preserve dynamic route context typing:
context: { params: Promise<{ id: string }> }
Use createRouteError('not_found', ...) only where needed.
Do not keep inline route data if repository owns that data.
11. SET ROOT-08 — UI/Page Integration

Purpose:

Move root pages from old static/foundation display into deterministic repository-backed root UI.

Target files:

src/app/layout.tsx
src/app/page.tsx
src/app/view/page.tsx
src/app/front-door/page.tsx
src/components/front-door/pulse-preview.tsx
src/components/dashboard/agent-status-panel.tsx
src/components/dashboard/session-tools.tsx
src/lib/repositories/dashboard-repository.ts
src/lib/repositories/run-repository.ts
src/lib/ui/http-client.ts

Root page contract:

src/app/page.tsx

must show current root status:

SET ROOT-05 = VERIFIED
SET ROOT-06 = VERIFIED
SET ROOT-07 = VERIFIED
SET ROOT-08 = active
GLOBAL DEPLOYABILITY = NOT VERIFIED

Rules:

Do not show obsolete foundation file lists that imply outdated state.
Use root components when available.
Use deterministic repository functions in server components.
Do not fetch.
Do not import from apps/web/**.

Expected root components:

PulsePreview
AgentStatusPanel
SessionTools

Expected repository calls:

getDashboardSummary
getDashboardAgents
getDashboardRecentRuns
getDashboardIncidents
listRecentRuns
12. SET ROOT-09 — Test / Stub Completion

Purpose:

Add test coverage for repository wiring and root UI component integration without adding dependencies.

Existing test script:

"test": "tsx --test tests/**/*.ts"

Rules:

Do not change package.json if the test script is already correct.
Do not create .tsx test files for this phase.
Do not add testing-library.
Do not add DOM libraries.
Test function return shape and props-level behavior only.
Import from ../src/**.
Do not import from apps/web/**.

Generated test files:

tests/root-repository-wiring.ts
tests/root-ui-components.ts

Required coverage for repository wiring:

getDashboardSummary()
getDashboardRecentRuns()
getDashboardIncidents()
getDashboardAgents()
listRuns()
getRunById('run_001')
getRunById('missing') returns null
listRecentRuns() sorted deterministically

Required coverage for UI component integration:

PulsePreview accepts deterministic pulse props
AgentStatusPanel accepts deterministic agents props
SessionTools returns deterministic React element
13. SET ROOT-10 — Deterministic / Runtime Law Audit Repair

Purpose:

Remove runtime entropy from ID helpers and add deterministic runtime law tests.

Target files:

src/lib/utils/ids.ts
tests/root-deterministic-runtime-law.ts
tests/pack1-foundation.ts
package.json

Required exports:

createRequestId
createEntityId

Required behavior:

createRequestId(prefix, value)
createEntityId(prefix, value)

must:

require explicit input
validate prefix as non-empty string
validate value as non-empty string
trim whitespace
lowercase output
replace invalid characters with _
collapse repeated _
remove leading/trailing _
throw deterministic Error for invalid input
use no random suffix
use no UUID
use no runtime clock
use no environment fallback

Forbidden:

crypto.randomUUID
Date.now
Math.random
process.env
fetch
filesystem
runtime clock
runtime entropy
hidden fallback
crypto import
node:crypto import

Generated test file:

tests/root-deterministic-runtime-law.ts

Required test coverage:

createRequestId('req', 'Alpha 001') -> req_alpha_001
createEntityId('run', 'RUN 001') -> run_run_001
invalid empty prefix throws
invalid empty value throws
repeated calls with same input produce same output
output has no spaces
output has no uppercase
output does not match UUID/random shape
14. CRITICAL REPAIR C1 — Root Auth / OTAC Foundation

Purpose:

Replace unsafe OTAC/auth mock behavior with deterministic, honest, server-owned fixture contracts without claiming production auth.

Target files:

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

Core auth rule:

auth_mode = deterministic_fixture_not_production

C1 intent:

Do not use client-provided OTAC server record as source of truth.
Do not return secret OTAC code or server record as public response.
Do not accept full server record from client in verify route.
Separate public OTAC response from server-side descriptor.
Add TTL fields to OTAC record contract:
issued_at_epoch_ms
expires_at_epoch_ms
consumed_at_epoch_ms
Add attempt/rate-limit fields:
attempt_count
max_attempts
Add hash/salt fields:
code_hash
salt
Do not generate real random code in root deterministic phase.
Do not claim email delivery.
Do not claim production persistence.
Do not claim production auth.
Use deterministic fixture records only.
Move inline session fixtures into helper layer.
Keep explicit now_epoch_ms.

Auth/session helper exports introduced or used:

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

OTAC route behavior:

request-otac
→ accepts identity input
→ returns public_response + server_descriptor
→ does not return code_hash or salt in public_response
→ marks auth_mode as deterministic_fixture_not_production

verify-otac
→ accepts otac_id + submitted_code_hash
→ validates against server-owned deterministic fixture
→ does not accept client-provided server record
15. CRITICAL REPAIR C2 — Absolute Middleware + Auth Gate Lock

Purpose:

Replace pass-through middleware with deterministic auth gate policy while avoiding production-security claims.

Target files:

src/middleware.ts
src/lib/auth/route-policy.ts
src/lib/auth/session-cookie.ts
tests/root-security-auth-gate.ts

Batch rule:

Only these four files are allowed to be repaired in C2:

src/middleware.ts
src/lib/auth/route-policy.ts
src/lib/auth/session-cookie.ts
tests/root-security-auth-gate.ts

Latest observed state before C2 generated code:

src/middleware.ts = pass-through only
src/lib/auth/route-policy.ts = missing
src/lib/auth/session-cookie.ts = missing
tests/root-security-auth-gate.ts = missing

C2 middleware contract:

middleware must not be pass-through only

Required middleware behavior:

Import NextRequest and NextResponse from next/server.
Import evaluateRoutePolicy from @/lib/auth/route-policy.
Import getSessionCookieValue from @/lib/auth/session-cookie.
Import makeEnvelope from @/lib/http/envelope.
Evaluate request.nextUrl.pathname.
Bypass only static/internal paths specified by route policy.
Allow public paths specified by route policy.
For protected paths:
if session cookie is missing, return 401 JSON envelope
if session cookie exists, return NextResponse.next()
set header x-nexy-auth-mode = deterministic_fixture_not_production
set header x-nexy-route-access = requires_session
Do not check real session in middleware until persistent store exists.
Do not claim production security.

Required deterministic 401 envelope:

status = ERROR
requestId = middleware_auth_required
traceId = middleware_auth_required
data = null
error.code = AUTH_REQUIRED
error.message = Authentication is required for this route.

Route policy access levels:

bypass
public
requires_session

Bypass paths:

/_next/static
/_next/image
/favicon.ico

Public paths:

/
/front-door
/view
/run
/forge
/sessions
/api/auth/request-otac
/api/auth/verify-otac

Protected prefixes:

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

Unknown /api/* path:

requires_session

Unknown non-api app path:

public unless dangerous path

Dangerous non-api path prefixes:

/admin
/internal
/private
/security
/vault

Cookie parser contract:

parseCookieHeader(header: string | null): Readonly<Record<string, string>>
getSessionCookieValue(header: string | null): string | null

Cookie parser rules:

null header returns empty object.
empty string returns empty object.
split by ;.
trim key/value.
ignore malformed empty key.
safe decodeURIComponent.
decode failure uses raw value.
duplicate cookie behavior: last duplicate wins.
no uncontrolled throw.
no dependency.

C2 test file:

tests/root-security-auth-gate.ts

Required coverage:

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
16. Auth Boundary Status

Current auth is a deterministic foundation fixture.

Correct wording:

deterministic_fixture_not_production

Do not describe it as:

production auth
secure production login
real session persistence
real OTAC persistence
real email delivery
real one-time code delivery
real cookie-backed session store

Allowed claims:

deterministic fixture auth contract exists
explicit time input exists
OTAC public/server descriptor separation exists
server-owned deterministic fixture record exists
middleware auth gate policy can require a cookie for protected paths
production auth requires persistent store, delivery layer, secret management, and real verification logs
17. Middleware Boundary Status

Middleware gate from C2 is intended as deterministic foundation auth gate, not production security.

It may check for a session cookie value and route policy classification.

It must not:

validate real session persistence
call database
call network
read filesystem
use clock
use random
claim production security

Protected route access is deterministic and policy-based.

18. Test System

Test command:

npm test

Expected package script:

"test": "tsx --test tests/**/*.ts"

Test rules:

Use node:test.
Use node:assert/strict.
Do not add testing-library.
Do not add DOM dependency.
Do not create .tsx tests under current script.
Do not import from apps/web/**.
Do not call DB.
Do not call network.
Do not call filesystem.
Do not use runtime clock.
Do not use random.
Do not claim test pass without real command logs.

Known generated root test files include:

tests/root-repository-wiring.ts
tests/root-ui-components.ts
tests/root-deterministic-runtime-law.ts
tests/root-security-auth-gate.ts

Existing test files include:

tests/pack1-foundation.ts
tests/pack1-validation.ts
tests/auth-session-routes.ts
tests/mode-and-output-enforcement.ts

Existing stub files include:

tests/stubs/next-server.ts
tests/stubs/next-navigation.ts
tests/stubs/prisma-client.ts
19. Environment Contract

.env.example must contain deterministic placeholder values only:

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexy_staging?schema=public
NEXY_ENV=development
NEXY_AUTH_SECRET=replace-with-local-development-secret

Forbidden in .env.example for the current root foundation lock:

NODE_ENV
APP_BASE_URL
SESSION_COOKIE_NAME
SESSION_TTL_MINUTES
OTAC_TTL_MINUTES
real secrets
20. Prisma Contract

prisma/schema.prisma must stay minimal for the foundation lock unless explicitly expanded.

Required generator:

generator client {
  provider = "prisma-client-js"
}

Required datasource:

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

Required models:

AuditEvent
SessionRecord
RunRecord

Forbidden in foundation schema:

@default(now())
DateTime automatic clock fields
extra model
enum
relation complexity
runtime clock assumption

Important:

The schema may exist for future persistence, but root deterministic repository code must not call real database or instantiate runtime PrismaClient unless explicitly unlocked.

21. Runtime Law

Root deterministic foundation code must not use:

Date.now
Math.random
crypto.randomUUID
runtime entropy
process.env hidden fallback
fetch
filesystem
real DB call
PrismaClient runtime
global mutable runtime client

ID helpers must use explicit input only.

Expected deterministic ID behavior:

createRequestId('req', 'Alpha 001') -> req_alpha_001
createEntityId('run', 'RUN 001') -> run_run_001
22. Manual Apply Rule

Many repairs were produced as full code for manual paste.

Correct workflow:

Fetch/read real file state.
Classify file as:
OK
MISSING
EMPTY
EXISTS_NON_EMPTY_NEEDS_REPAIR
FREEZE
Do not rewrite OK files.
Generate full replacement code only for failed files.
User manually pastes code.
Re-audit real GitHub state.
Run typecheck/build/test only when ready.
Do not claim success without logs.
23. Current High-Risk Areas

Areas that require strict follow-up audit:

src/middleware.ts
src/lib/auth/route-policy.ts
src/lib/auth/session-cookie.ts
tests/root-security-auth-gate.ts

Reason:

C2 generated a middleware/auth gate repair, but unless the user pasted it after generation, the repository may still contain:

src/middleware.ts = pass-through only
src/lib/auth/route-policy.ts = missing
src/lib/auth/session-cookie.ts = missing
tests/root-security-auth-gate.ts = missing

Other areas requiring verification after manual paste:

tests/root-repository-wiring.ts
tests/root-ui-components.ts
tests/root-deterministic-runtime-law.ts
src/lib/utils/ids.ts
src/app/page.tsx
src/app/view/page.tsx
src/app/front-door/page.tsx
API route repository wiring files
repository helper expansions
24. Required Verification Commands

Run only when ready to audit the full root after manual paste:

npm install
npm run typecheck
npm run build
npm test

Do not report these as passed unless command logs exist.

25. Status Language

Use these words only when evidence supports them.

Allowed:

OK
MISSING
EMPTY
EXISTS_NON_EMPTY_NEEDS_REPAIR
FREEZE
NOT VERIFIED
deterministic_fixture_not_production

Do not use unsupported confidence words such as:

probably
maybe
looks fine
seems okay
should work
likely
close enough
production ready
deployable
verified

unless the required evidence exists.

26. Current Final Project Position
Project: NEXY-STAGING
Canonical root: src/...
Legacy apps/web usage in root: forbidden
Runtime law: deterministic only
Repository layer: static deterministic repository functions
Auth mode: deterministic_fixture_not_production
Middleware gate: generated C2 repair pending manual confirmation
Global deployability: NOT VERIFIED
Required next audit: fetch real files after manual paste, then run typecheck/build/test with logs

This README is a project state and contract document. It does not replace real repository inspection, typecheck logs, build logs, or test logs.
