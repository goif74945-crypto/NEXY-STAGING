# NEXY-STAGING

NEXY-STAGING is a clean deterministic staging root for the NEXY.AI rebuild.

## Canonical Root

The canonical root is `src/...`.

`apps/web/**` must not be used by the root build.

The root build must not depend on legacy prototype files.

## Root Set Status

- SET ROOT-01 = VERIFIED
- SET ROOT-02 = VERIFIED
- SET ROOT-03 = VERIFIED
- SET ROOT-04 = FOUNDATION LOCK

## Foundation Lock

- Keep `src/...` as the canonical root.
- Do not import from `apps/web/**`.
- Do not depend on legacy prototype files.
- Do not rename locked modules, functions, types, or paths without an explicit instruction.
- Do not refactor architecture without an explicit instruction.
- Do not add dependencies without an explicit instruction.
- Do not use runtime clocks in deterministic foundation code.
- Do not use runtime random values in deterministic foundation code.
- Do not use database, filesystem, or network calls in deterministic foundation code.

## Verification Commands

- `npm install`
- `npm run typecheck`
- `npm run build`
- `npm test`

Global deployability requires real logs from the target environment.

Do not claim this repository is deployable without verification logs.

Do not claim this repository is production ready without verification logs.

Do not claim typecheck, build, or tests passed without command logs.
