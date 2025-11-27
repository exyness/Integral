# Project Structure

## Directory Organization

```
src/
├── components/          # UI components organized by feature
│   ├── ui/              # Reusable UI primitives (Button, Modal, Input, etc.)
│   ├── tasks/           # Task management components
│   ├── notes/           # Note-taking components (includes Lexical editor)
│   ├── journal/         # Journal and reflection components
│   ├── pomodoro/        # Pomodoro timer components
│   ├── budget/          # Budget and finance components
│   ├── accounts/        # Account management components
│   ├── theme/           # Theme switching components
│   ├── halloween/       # Halloween decorations
│   ├── landing/         # Landing page components
│   ├── skeletons/       # Loading skeleton components
│   └── folders/         # Folder organization components
├── contexts/            # React Context providers for global state
├── hooks/               # Custom React hooks
│   ├── queries/         # TanStack Query hooks
│   ├── tasks/           # Task-specific hooks
│   └── budget/          # Budget-specific hooks
├── pages/               # Route components (Dashboard, Tasks, Notes, etc.)
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── lib/                 # Utility functions (dateUtils, timeUtils, etc.)
├── types/               # TypeScript type definitions
├── constants/           # Application constants
├── assets/              # Static assets (SVGs, images, audio)
│   ├── backgrounds/     # Background images
│   ├── bat/             # Bat SVG assets
│   ├── cat/             # Cat SVG assets
│   ├── ghosts/          # Ghost SVG assets
│   ├── pumpkin/         # Pumpkin SVG assets
│   └── [other themes]/  # Other Halloween assets
└── main.tsx             # Application entry point
```

## Key Conventions

### Component Structure

- Feature-based organization (components grouped by domain)
- Shared UI components in `components/ui/`
- Page components in `pages/` directory
- Use `GlassCard` component for consistent glass morphism styling

### Routing

- Lazy loading for all routes using `React.lazy()`
- Protected routes require authentication
- Public routes (landing, privacy, terms) accessible without auth
- Auth routes redirect to dashboard if already logged in

### State Management

- TanStack Query for server state (queries, mutations, caching)
- React Context for global UI state (theme, auth, currency, network)
- Local state with `useState` for component-specific state
- Query keys follow pattern: `[entity, userId]` (e.g., `["tasks", user?.id]`)

### Styling

- Tailwind CSS utility classes
- Glass morphism design system via `GlassCard` component
- Dark/light theme support via `ThemeContext`
- Halloween mode with teal accent color (#60c9b6)
- Responsive design with mobile-first approach

### Data Fetching

- Use TanStack Query hooks for all Supabase operations
- Optimistic updates for better UX
- Error handling with toast notifications (Sonner)
- Stale time: 5 minutes, GC time: 10 minutes (typical)

### File Naming

- Components: PascalCase (e.g., `TaskList.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTasks.ts`)
- Utils: camelCase (e.g., `dateUtils.ts`)
- Types: camelCase (e.g., `task.ts`)

### Import Aliases

- Use `@/` for all imports from `src/` directory
- Example: `import { Button } from "@/components/ui/Button"`

### TypeScript

- Relaxed configuration (allows implicit any, no strict null checks)
- Explicit types for function parameters and return values
- Interface for component props
- Type definitions in `types/` directory

### Halloween Theme

- Check `isHalloweenMode` from `useTheme()` hook
- Apply teal color (#60c9b6) for accents
- Use Creepster font for titles
- Add drop shadow glows for spooky effects
- Assets located in `src/assets/` subdirectories
