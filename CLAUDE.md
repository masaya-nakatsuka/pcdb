# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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