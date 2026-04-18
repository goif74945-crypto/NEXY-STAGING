# NEXY-STAGING

Clean rebuild workspace for NEXY.

## Current status
- Purpose: Pack 1 foundation only
- Stack baseline: Next.js App Router + TypeScript + Prisma + PostgreSQL
- Rule: no legacy prototype files from the old `NEXY` demo branch are reused here

## Pack 1 scope
- project boot files
- environment loader
- Prisma client bootstrap
- id utilities
- base application errors
- envelope helpers
- route error mapping helper
- auth session type skeleton
- root layout and home page

## Runtime requirements
- Node.js 20.9+ for Next.js 16.x
- PostgreSQL connection via `DATABASE_URL`

## Commands
```bash
npm install
npm run prisma:generate
npm run dev
```
