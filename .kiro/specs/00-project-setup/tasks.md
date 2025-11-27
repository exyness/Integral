# Project Setup - Tasks

## Phase 1: Initialize Project

### T1.1: Create Project Structure

- [x] Initialize Git repository
- [x] Create package.json with Bun
- [x] Set up .gitignore
- [x] Create basic folder structure
- _Requirements: AC1_

### T1.2: Install Core Dependencies

- [x] Install React 19.2 and React DOM
- [x] Install TypeScript 5.9
- [x] Install Vite 7.2 and plugins
- [x] Install @vitejs/plugin-react-swc
- _Requirements: AC2, AC6_

### T1.3: Configure Build System

- [x] Create vite.config.ts with path aliases
- [x] Configure manual chunk splitting
- [x] Set dev server port to 8080
- [x] Test dev server starts
- _Requirements: AC2_

## Phase 2: TypeScript Configuration

### T2.1: Configure TypeScript

- [x] Create tsconfig.json
- [x] Create tsconfig.app.json
- [x] Create tsconfig.node.json
- [x] Configure path aliases (@/ → src/)
- [x] Set relaxed type checking (noImplicitAny: false, strictNullChecks: false)
- _Requirements: AC2_

### T2.2: Verify TypeScript

- [x] Create basic App.tsx
- [x] Create main.tsx entry point
- [x] Test imports with @ alias
- [x] Verify compilation works
- _Requirements: AC2_

## Phase 3: Styling System

### T3.1: Install Tailwind CSS

- [x] Install Tailwind CSS 4.1
- [x] Install PostCSS
- [x] Create postcss.config.js
- [x] Create index.css with Tailwind directives
- _Requirements: AC3_

### T3.2: Configure Tailwind

- [x] Set up dark mode (class strategy)
- [x] Add custom colors (purple, teal for Halloween)
- [x] Configure theme variables
- [x] Test utility classes work
- _Requirements: AC3_

### T3.3: Install Animation Library

- [x] Install Framer Motion 12.23
- [x] Test basic animation works
- _Requirements: AC6_

## Phase 4: Code Quality

### T4.1: Install Biome

- [x] Install Biome 2.3.5
- [x] Create biome.json configuration
- [x] Configure double quotes
- [x] Configure 2-space indentation
- [x] Enable organize imports
- _Requirements: AC4_

### T4.2: Add Scripts

- [x] Add lint script
- [x] Add lint:fix script
- [x] Add format script
- [x] Test all scripts work
- _Requirements: AC4_

## Phase 5: Supabase Integration

### T5.1: Create Supabase Project

- [x] Sign up for Supabase
- [x] Create new project
- [x] Copy project URL and anon key
- [x] Create .env file with environment variables
- _Requirements: AC5_

### T5.2: Install Supabase Client

- [x] Install @supabase/supabase-js
- [x] Create supabase client file (src/integrations/supabase/client.ts)
- [x] Test connection works
- _Requirements: AC5_

### T5.3: Set Up Database

- [x] Create migrations folder
- [x] Apply initial schema migration
- [x] Generate TypeScript types from schema
- [x] Verify types are correct
- _Requirements: AC5_

## Phase 6: Core Dependencies

### T6.1: Install Routing

- [x] Install React Router DOM v7.9
- [x] Set up BrowserRouter
- [x] Create basic routes (protected, auth, public)
- [x] Test navigation works with lazy loading
- _Requirements: AC6_

### T6.2: Install State Management

- [x] Install TanStack Query v5
- [x] Set up QueryClientProvider
- [x] Configure default options (retry: false, refetchOnWindowFocus: false)
- [x] Test basic query works
- _Requirements: AC6_

### T6.3: Install UI Libraries

- [x] Install Radix UI primitives (dropdown, select, tooltip, avatar, etc.)
- [x] Install Sonner for toasts
- [x] Install Lucide React for icons
- [x] Test components render
- _Requirements: AC6_

## Phase 7: Project Structure

### T7.1: Create Folder Structure

- [x] Create components/ subdirectories (ui, tasks, notes, journal, pomodoro, budget, accounts, theme, halloween, landing, skeletons, folders)
- [x] Create pages/ directory
- [x] Create hooks/ directory (with queries/, tasks/, budget/ subdirectories)
- [x] Create contexts/ directory
- [x] Create lib/ directory
- [x] Create types/ directory
- [x] Create assets/ directory (with backgrounds, bat, cat, ghosts, pumpkin, skulls, spider, tree, webs, witch subdirectories)
- _Requirements: AC7_

### T7.2: Create Base Components

- [x] Create Layout component
- [x] Create Navbar component
- [x] Create basic UI components (Button, Modal, Input, etc.)
- [x] Create theme context (ThemeContext with dark/light/Halloween modes)
- [x] Create auth context (AuthContext)
- [x] Create currency context (CurrencyContext)
- [x] Create network context (NetworkContext)
- [x] Create floating widget context (FloatingWidgetContext)
- _Requirements: AC7_

## Phase 8: Verification

### T8.1: Test Development Environment

- [x] Run dev server on port 8080
- [x] Test hot reload
- [x] Test TypeScript compilation
- [x] Test Tailwind classes
- _Requirements: NFR1, NFR2_

### T8.2: Test Build

- [x] Run production build
- [x] Verify bundle sizes (chunk size warning limit: 600KB)
- [x] Test preview server
- [x] Check for errors
- _Requirements: NFR1_

### T8.3: Documentation

- [x] Create README.md with comprehensive documentation
- [x] Document environment setup
- [x] Document available scripts
- [x] Document project structure
- [x] Document Halloween Edition features
- _Requirements: NFR3_
