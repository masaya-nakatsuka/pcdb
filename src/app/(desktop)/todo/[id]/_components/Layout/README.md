# Layout

## Public API
- `default` (RSC) — renders the todo detail experience by delegating to client-side parts.

## Dependencies
- `@/components/LoadingOverlay`
- `@/lib/supabaseTodoClient`
- Local parts under `parts/`
- Local shared utilities under `_shared/`

## Elevation History
- 2024-XX-XX: Extracted from `app/todo/[id]/page.tsx` into feature-based module following colocation guidelines.
