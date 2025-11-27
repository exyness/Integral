# Project Setup - Design

## Overview

This design document outlines the foundational infrastructure for Integral, a comprehensive productivity suite. The setup prioritizes developer experience with fast build times, modern tooling, and a well-organized codebase that supports rapid feature development.

## Architecture

### Build System

The build system is designed for speed and optimal bundle sizes:

- **Vite 7.2**: Lightning-fast dev server with HMR, configured to run on port 8080
- **SWC**: Fast React compilation replacing Babel for improved build performance
- **Manual chunk splitting**: Optimized bundle sizes to keep initial load fast
  - react-vendor: React core (~150KB)
  - router-vendor: React Router (~50KB)
  - ui-vendor: Radix UI components (~200KB)
  - query-vendor: TanStack Query (~50KB)
  - supabase-vendor: Supabase client (~100KB)
- **Chunk size limit**: 600KB warning threshold to maintain performance

**Design Rationale**: Vite provides near-instant HMR and fast cold starts, critical for developer productivity. Manual chunk splitting ensures users only download what they need, with common dependencies cached separately.

### TypeScript Configuration

TypeScript is configured with a relaxed approach to balance type safety with development speed:

```json
{
  "noImplicitAny": false,
  "strictNullChecks": false,
  "skipLibCheck": true,
  "esModuleInterop": true
}
```

**Design Rationale**: While strict TypeScript catches more errors, the relaxed configuration allows for faster prototyping and reduces friction when integrating third-party libraries. Type safety is still maintained through explicit typing of function signatures and component props.

### Path Aliases

- `@/` → `src/`
- Example: `import { Button } from "@/components/ui/Button"`

**Design Rationale**: Path aliases eliminate relative import hell (`../../../components`) and make refactoring easier since imports don't break when files move.

## Components and Interfaces

### Development Environment

**Package Manager**: Bun (recommended) or npm

- Bun provides faster install times and native TypeScript support
- Fallback to npm for compatibility

**Node.js**: v18+ required for modern JavaScript features

**Environment Variables**: Managed via `.env` file

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_GEMINI_API_KEY`: Google Gemini API key (for AI features)

### Technology Stack

**Core Framework**:

- React 19.2: Latest React with improved concurrent features
- TypeScript 5.9: Type safety with relaxed configuration
- Vite 7.2: Build tool and dev server

**Styling System**:

- Tailwind CSS 4.1: Utility-first CSS framework
- PostCSS: CSS processing pipeline
- Framer Motion 12.23: Animation library for smooth transitions
- Custom glass morphism components: Consistent visual design language

**Design Rationale**: Tailwind enables rapid UI development with utility classes while maintaining consistency. Glass morphism provides a modern, distinctive aesthetic that differentiates Integral from competitors.

**State Management**:

- TanStack Query v5: Server state management with caching, optimistic updates
- React Context: Global UI state (theme, auth, currency, network, floating widgets)

**Design Rationale**: TanStack Query handles all server state complexity (caching, refetching, mutations) while React Context manages lightweight global UI state. This separation keeps concerns clear.

**Backend Integration**:

- Supabase: PostgreSQL database, authentication, real-time subscriptions
- Row-level security (RLS): User data isolation at database level
- TypeScript types: Auto-generated from database schema

**Design Rationale**: Supabase provides a complete backend solution with minimal setup. RLS policies ensure security is enforced at the database level, not just in application code.

**Code Quality Tools**:

- Biome 2.3.5: Combined linting and formatting (replaces ESLint + Prettier)
- Configuration: Double quotes, 2-space indentation, organized imports

**Design Rationale**: Biome is significantly faster than ESLint + Prettier and provides a unified tooling experience with zero configuration conflicts.

### Core Dependencies

**Routing**: React Router DOM v7.9

- Lazy loading for code splitting
- Protected routes for authenticated pages
- Public routes for landing, privacy, terms

**UI Components**: Radix UI primitives

- Accessible, unstyled components (dropdown, select, tooltip, avatar, etc.)
- Full keyboard navigation support
- ARIA compliant

**Notifications**: Sonner 2.0

- Toast notifications for user feedback
- Non-blocking, dismissible messages

**Design Rationale**: Radix UI provides accessible primitives that can be styled with Tailwind, avoiding the bloat of full component libraries while maintaining accessibility standards.

## Data Models

### Project Structure

The project follows a feature-based organization pattern:

```
integral/
├── .kiro/                      # Kiro-specific files
│   ├── specs/                  # Feature specifications
│   └── steering/               # AI steering rules
├── src/
│   ├── components/             # UI components (feature-based)
│   │   ├── ui/                 # Reusable UI primitives
│   │   ├── tasks/              # Task management components
│   │   ├── notes/              # Note-taking components
│   │   ├── budget/             # Budget components
│   │   ├── journal/            # Journal components
│   │   ├── pomodoro/           # Pomodoro timer components
│   │   ├── accounts/           # Account management components
│   │   ├── theme/              # Theme switching components
│   │   ├── halloween/          # Halloween decorations
│   │   ├── landing/            # Landing page components
│   │   ├── skeletons/          # Loading skeletons
│   │   └── folders/            # Folder organization
│   ├── pages/                  # Route components
│   ├── hooks/                  # Custom React hooks
│   │   ├── queries/            # TanStack Query hooks
│   │   ├── tasks/              # Task-specific hooks
│   │   └── budget/             # Budget-specific hooks
│   ├── contexts/               # React Context providers
│   ├── lib/                    # Utility functions
│   ├── types/                  # TypeScript type definitions
│   ├── constants/              # Application constants
│   ├── assets/                 # Static assets (SVGs, images, audio)
│   │   ├── backgrounds/        # Background images
│   │   ├── bat/                # Bat SVG assets
│   │   ├── cat/                # Cat SVG assets
│   │   ├── ghosts/             # Ghost SVG assets
│   │   ├── pumpkin/            # Pumpkin SVG assets
│   │   └── [other themes]/     # Other Halloween assets
│   ├── integrations/
│   │   └── supabase/           # Supabase client and types
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Application entry point
├── public/                     # Static public assets
│   ├── favicon files
│   ├── manifest files
│   └── offline.html
├── supabase/
│   └── migrations/             # Database migrations
├── package.json
├── vite.config.ts
├── tsconfig.json
├── biome.json
└── .env
```

**Design Rationale**: Feature-based organization keeps related code together, making it easier to understand and modify features. Shared UI components are separated to encourage reuse.

### Configuration Files

**vite.config.ts**: Build configuration

- React SWC plugin
- Path aliases (@/ → src/)
- Manual chunk splitting
- Dev server port 8080

**tsconfig.json**: TypeScript configuration

- Relaxed type checking
- Path aliases
- Modern ES target

**biome.json**: Code quality configuration

- Double quotes
- 2-space indentation
- Organized imports

**.env**: Environment variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Build System Functionality

_For any_ valid React component file in the src/ directory, the Vite build system should successfully compile it and enable hot module replacement during development.

**Validates: Requirements AC2**

**Design Rationale**: This ensures the core development workflow functions correctly, enabling fast iteration cycles.

### Property 2: Path Alias Resolution

_For any_ import statement using the @/ alias, TypeScript and Vite should correctly resolve it to the src/ directory without errors.

**Validates: Requirements AC2**

**Design Rationale**: Path aliases must work consistently across all tooling (TypeScript, Vite, IDE) to prevent import errors.

### Property 3: Styling System Integration

_For any_ Tailwind utility class used in a component, the class should be processed and included in the final CSS output with correct styling applied.

**Validates: Requirements AC3**

**Design Rationale**: Ensures the styling system works end-to-end from utility class to rendered styles.

### Property 4: Theme Mode Consistency

_For any_ theme mode (light, dark, Halloween), switching themes should update all components consistently without requiring page refresh.

**Validates: Requirements AC3**

**Design Rationale**: Theme switching must be instantaneous and affect all components to provide a seamless user experience.

### Property 5: Code Quality Enforcement

_For any_ code file in the project, running Biome should either pass with no errors or provide actionable error messages that can be auto-fixed.

**Validates: Requirements AC4**

**Design Rationale**: Consistent code quality requires that all files conform to the same standards and that violations are easily correctable.

### Property 6: Supabase Connection Integrity

_For any_ authenticated user, database queries should execute successfully and return only data belonging to that user (enforced by RLS).

**Validates: Requirements AC5**

**Design Rationale**: Security and data isolation are critical; RLS policies must work correctly to prevent data leaks.

### Property 7: Type Generation Accuracy

_For any_ database schema change, regenerating TypeScript types should produce types that accurately reflect the current database structure.

**Validates: Requirements AC5**

**Design Rationale**: Type safety depends on accurate types; mismatches between database and TypeScript types lead to runtime errors.

### Property 8: Dependency Resolution

_For any_ core dependency (React, Router, Query, etc.), the package should be correctly installed and importable without version conflicts.

**Validates: Requirements AC6**

**Design Rationale**: Dependency conflicts break builds; all dependencies must coexist without version mismatches.

## Error Handling

### Build Errors

- **TypeScript compilation errors**: Display clear error messages with file location and line number
- **Missing dependencies**: Provide installation instructions
- **Configuration errors**: Validate config files on startup and show helpful error messages

### Runtime Errors

- **Supabase connection failures**: Graceful degradation with offline mode
- **Authentication errors**: Clear error messages and redirect to login
- **Network errors**: Retry logic with exponential backoff

### Development Errors

- **HMR failures**: Full page reload fallback
- **Import errors**: Clear stack traces with source maps
- **Environment variable missing**: Startup validation with helpful error messages

**Design Rationale**: Clear error messages reduce debugging time. Graceful degradation ensures the app remains usable even when services are unavailable.

## Testing Strategy

### Unit Testing

Unit tests will verify specific configuration and setup behaviors:

- Vite config correctly sets up plugins and aliases
- TypeScript config allows expected code patterns
- Biome config enforces style rules
- Environment variable validation works correctly

### Property-Based Testing

Property-based tests will verify universal properties across the setup:

- **Property Testing Library**: fast-check (JavaScript/TypeScript PBT library)
- **Minimum iterations**: 100 runs per property test
- **Test annotation format**: `**Feature: project-setup, Property {number}: {property_text}**`

Each correctness property will be implemented as a property-based test to verify it holds across various inputs and scenarios.

### Integration Testing

- Dev server starts successfully and serves pages
- Production build completes without errors
- All routes are accessible
- Supabase client connects and authenticates
- Theme switching works across all pages

**Design Rationale**: Unit tests catch specific bugs, property tests verify general correctness, and integration tests ensure all pieces work together. This multi-layered approach provides comprehensive coverage.

## Performance Considerations

### Development Performance (NFR1)

**Target Metrics**:

- Development server cold start: < 3 seconds
- Hot module replacement: < 1 second
- Production build time: < 2 minutes

**Optimization Strategies**:

- Vite's native ESM dev server eliminates bundling during development
- SWC compilation is 20x faster than Babel
- Lazy loading routes reduces initial bundle size
- Manual chunk splitting optimizes caching

**Design Rationale**: Fast feedback loops are critical for developer productivity. Vite and SWC provide the fastest possible development experience without sacrificing features.

### Bundle Size Optimization

**Strategies**:

- Code splitting by route (lazy loading)
- Manual vendor chunks for common dependencies
- Tree shaking to eliminate unused code
- Chunk size warnings at 600KB threshold

**Design Rationale**: Smaller bundles mean faster page loads. Splitting by route ensures users only download what they need for the current page.

### Runtime Performance

**Strategies**:

- React 19's concurrent features for smoother UI
- TanStack Query caching reduces unnecessary network requests
- Optimistic updates for instant UI feedback
- Virtualization for long lists (react-virtuoso)

**Design Rationale**: Perceived performance is as important as actual performance. Optimistic updates and caching make the app feel instant even on slow connections.

## Maintainability (NFR3)

### Code Organization

- Feature-based directory structure keeps related code together
- Consistent naming conventions (PascalCase for components, camelCase for utilities)
- Clear separation between UI components, business logic, and data fetching

### Documentation

- README.md with setup instructions and architecture overview
- Inline comments for complex logic
- Type definitions serve as documentation for data structures

### Patterns and Conventions

- TanStack Query for all server state
- React Context for global UI state
- Consistent error handling with toast notifications
- Standardized component structure (props interface, component, export)

**Design Rationale**: Consistency reduces cognitive load. When all code follows the same patterns, developers can quickly understand and modify any part of the codebase.
