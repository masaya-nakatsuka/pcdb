# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Knowledge Base Gate

This app lives under the shared knowledge workspace at `../../..`.

Before non-trivial planning, implementation, article/content work, investigation, or rule-sensitive work:

- Read `../../../wiki/index.md` first.
- Do not rely on the index alone. Search `../../../wiki/` with `rg` for the user's words, synonyms, target names, and failure/rule terms such as `失敗`, `教訓`, `禁止`, `一気`, `大量`, `一括`, `品質`, and `やらない`.
- If the user says they mentioned or recorded something before, also search `../../../wiki/log.md`.
- Before editing or executing, briefly state which knowledge pages were applied and what rule is being followed.
- If the user expresses clear dissatisfaction, rebukes the AI's work, or points out a repeated failure, do not stop at an apology. In the same response, immediately save the failed action, cause, prevention rule, scope, and verification method to the relevant parent wiki; update the parent `wiki/index.md` and `wiki/log.md`; and promote cross-session rules to the shared root entry files. Apply the prevention rule to the current work before continuing.
- Requests containing `全部`, `全パターン`, `一気`, `まとめて`, `大量`, or `横展開` must be split into a scope, quality gate, and current work unit before implementation.
- Before doing work, asking the next question, or proposing a next step, internally lock the user's current `objective`, `phase`, `in-scope work`, `out-of-scope work`, and `deliverable`. Treat `まず`, `だけ`, `実装せず`, `次は`, `レビューして`, `計画して`, and `1記事ずつ` as hard boundaries. Do not execute, ask about, or optimize for a later phase until the user explicitly moves the work there.

## Development Commands

- **Development server**: `npm run dev`
- **Build**: `npm run build`
- **Production server**: `npm start`
- **Linting**: `npm run lint`

## Architecture Overview

This is a PC database web application built with Next.js 13 App Router and TypeScript, following a simplified Clean Architecture pattern.

### Core Structure

The application displays PC specifications from a Supabase database with calculated performance scores and battery life estimates.

**Key Layers:**
- **Domain** (`src/server/domain/`): Core business entities and services
- **Infrastructure** (`src/server/infra/`): Data access and external services
- **Use Cases** (`src/server/usecase/`): Application business logic
- **Presentation** (`src/app/` and `src/components/`): UI components

### Data Flow

1. Server actions in `fetchPcList.ts` retrieve PC data via `pcRepository.ts`
2. CPU specifications are enriched from `cpuSpecMap.ts`
3. Performance scores calculated using `pcScore.ts` service
4. Battery life estimated using power consumption calculations
5. Results sorted by score and displayed via responsive UI components

### Key Features

- **PC Performance Scoring**: Combines CPU Passmark, RAM, storage, and battery life into unified scores
- **Battery Life Estimation**: Calculates runtime based on CPU TDP and display power consumption
- **Responsive Design**: Desktop table view and mobile card layout
- **CPU Specification Mapping**: Maps CPU names to detailed specifications (TDP, cores, Passmark scores)

### Data Models

- **Pc**: Base PC entity with hardware specifications
- **PcWithCpuSpec**: Extended PC with calculated fields (cores, battery life, scores)

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## File Organization Patterns

- Use server actions (`'use server'`) for data fetching
- Separate desktop/mobile components for responsive design
- Keep domain logic in services, not in React components
- Store CPU specifications as static data maps
