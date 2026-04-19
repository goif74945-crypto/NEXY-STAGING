# NEXY V1 Repository Blueprint

This file is the authoritative path map for the clean rebuild in `NEXY-STAGING`.
It defines where real implementation files belong.
It is not a replacement for source code.

## Root
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `eslint.config.mjs`
- `.gitignore`
- `.env.example`
- `README.md`
- `REPO_BLUEPRINT_NEXY_V1.md`
- `next-env.d.ts`

## Prisma
- `prisma/schema.prisma`

## App Router
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/front-door/page.tsx`
- `src/app/view/page.tsx`
- `src/app/run/page.tsx`
- `src/app/forge/page.tsx`
- `src/app/sessions/page.tsx`
- `src/app/runs/[id]/page.tsx`
- `src/app/runs/[id]/compare/page.tsx`

## API Routes
### Auth
- `src/app/api/auth/request-otac/route.ts`
- `src/app/api/auth/verify-otac/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/sessions/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/revoke-session/route.ts`
- `src/app/api/auth/revoke-all-other-sessions/route.ts`

### Directives and runs
- `src/app/api/directives/route.ts`
- `src/app/api/runs/route.ts`
- `src/app/api/runs/recent/route.ts`
- `src/app/api/runs/[id]/route.ts`
- `src/app/api/runs/[id]/history/route.ts`
- `src/app/api/runs/[id]/compare/route.ts`
- `src/app/api/runs/[id]/freeze/route.ts`
- `src/app/api/runs/[id]/unfreeze/route.ts`
- `src/app/api/runs/[id]/kill/route.ts`

### Outputs and artifacts
- `src/app/api/outputs/[id]/export/route.ts`
- `src/app/api/artifacts/[id]/lock/route.ts`

### Incidents
- `src/app/api/incidents/route.ts`
- `src/app/api/incidents/[id]/route.ts`
- `src/app/api/incidents/[id]/resolve/route.ts`

### Dashboard, telemetry, queue, agents
- `src/app/api/dashboard/summary/route.ts`
- `src/app/api/dashboard/recent-runs/route.ts`
- `src/app/api/dashboard/incidents/route.ts`
- `src/app/api/dashboard/agents/route.ts`
- `src/app/api/agents/status/route.ts`
- `src/app/api/queue/status/route.ts`
- `src/app/api/telemetry/runs/route.ts`
- `src/app/api/telemetry/system/route.ts`
- `src/app/api/front-door/pulse/route.ts`

## Components
### Dashboard
- `src/components/dashboard/mode-switcher.tsx`
- `src/components/dashboard/agent-status-panel.tsx`
- `src/components/dashboard/session-list-panel.tsx`
- `src/components/dashboard/session-tools.tsx`
- `src/components/dashboard/run-summary-panel.tsx`
- `src/components/dashboard/incident-list-panel.tsx`

### Front door
- `src/components/front-door/pulse-preview.tsx`

### Runs
- `src/components/runs/run-detail-client.tsx`
- `src/components/runs/run-compare-client.tsx`
- `src/components/runs/run-list.tsx`

## Shared libraries
### Config and db
- `src/lib/config/env.ts`
- `src/lib/db/prisma.ts`

### Auth
- `src/lib/auth/session-types.ts`
- `src/lib/auth/require-session.ts`
- `src/lib/auth/require-owner.ts`
- `src/lib/auth/require-operator-or-owner.ts`
- `src/lib/auth/mode-access.ts`
- `src/lib/auth/session.ts`

### Errors, validation, verification
- `src/lib/errors/app-errors.ts`
- `src/lib/errors/failure-map.ts`
- `src/lib/validation.ts`
- `src/lib/verify/checklist.ts`

### HTTP and schemas
- `src/lib/http/envelope.ts`
- `src/lib/http/route-error.ts`
- `src/lib/schemas/pack6-responses.ts`

### Types
- `src/lib/types/modes.ts`
- `src/lib/types/output-class.ts`

### Repositories
- `src/lib/repositories/session-repository.ts`
- `src/lib/repositories/run-repository.ts`
- `src/lib/repositories/incident-repository.ts`
- `src/lib/repositories/artifact-repository.ts`
- `src/lib/repositories/dashboard-repository.ts`
- `src/lib/repositories/telemetry-repository.ts`
- `src/lib/repositories/audit-repository.ts`

### Runtime helpers
- `src/lib/utils/ids.ts`
- `src/lib/utils/text-diff.ts`
- `src/lib/front-door/pulse.ts`
- `src/lib/ui/format.ts`
- `src/lib/ui/http-client.ts`

## Middleware
- `src/middleware.ts`

## Tests
- `tests/pack1-foundation.ts`
- `tests/pack1-validation.ts`
- `tests/auth-session-routes.ts`
- `tests/mode-and-output-enforcement.ts`
- `tests/stubs/next-server.ts`
- `tests/stubs/next-navigation.ts`
- `tests/stubs/prisma-client.ts`
- `tests/stubs/zod.ts`
- `tests/stubs/ulid.ts`

## Rule
When inserting real code, use these exact paths unless a conflict is explicitly audited first.
