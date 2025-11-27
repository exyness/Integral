# Technology Stack

## Core Technologies

- **Frontend Framework**: React 19.2 with TypeScript 5.9
- **Build Tool**: Vite 7.2 (dev server on port 8080)
- **Package Manager**: Bun (recommended) or npm
- **Styling**: Tailwind CSS 4.1 with custom glass morphism design
- **Animation**: Framer Motion 12.23
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions)

## Key Libraries

- **State Management**: TanStack Query v5 (server state), React Context (global state)
- **Routing**: React Router DOM v7.9 with lazy loading
- **UI Components**: Radix UI primitives (dropdown, select, tooltip, avatar, etc.)
- **Rich Text Editor**: Lexical 0.38 with plugins (markdown, code, lists, tables)
- **Forms**: React Hook Form 7.66 with Zod 4 validation
- **Charts**: Recharts 3.4
- **Notifications**: Sonner 2.0
- **Date Handling**: date-fns 4.1
- **Virtualization**: react-virtuoso 4.14

## Code Quality Tools

- **Linter/Formatter**: Biome 2.3.5 (replaces ESLint + Prettier)
- **Style**: Double quotes, 2-space indentation, organized imports
- **TypeScript**: Relaxed config (noImplicitAny: false, strictNullChecks: false)

## Common Commands

```bash
# Development
bun dev              # Start dev server (http://localhost:8080)
bun build            # Production build
bun build:dev        # Development build
bun preview          # Preview production build

# Code Quality
bun lint             # Check code with Biome
bun lint:fix         # Fix issues automatically
bun format           # Format code

# Supabase
bunx supabase db push                                    # Push migrations
bunx supabase gen types typescript --project-id <ID>     # Generate types
```

## Environment Setup

Required environment variables in `.env`:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_GEMINI_API_KEY`: Google Gemini API key (for AI features)

## Build Configuration

- Path alias: `@/` maps to `src/`
- Manual chunk splitting for optimal bundle sizes (react-vendor, router-vendor, ui-vendor, etc.)
- Chunk size warning limit: 600KB
- SWC for fast React compilation
