# Requirements Document

## Introduction

This document specifies the requirements for setting up the foundational infrastructure for Integral, a comprehensive productivity suite. The setup establishes a modern development environment with React, TypeScript, Vite, and Supabase, prioritizing developer experience, fast build times, and maintainable code organization.

## Glossary

- **Build System**: The tooling and configuration that compiles source code into executable bundles (Vite, TypeScript, SWC)
- **Development Environment**: The local setup including Node.js/Bun, package manager, and environment variables
- **HMR (Hot Module Replacement)**: Technology that updates modules in the browser without full page reload during development
- **Path Alias**: Import shortcut that maps a symbol (e.g., @/) to a directory path (e.g., src/)
- **RLS (Row-Level Security)**: Database security policies that restrict data access at the row level based on user identity
- **Styling System**: The CSS framework and design system (Tailwind CSS, glass morphism components)
- **Type Generation**: Process of creating TypeScript type definitions from database schema
- **Integral**: The productivity suite application being developed

## Requirements

### Requirement 1

**User Story:** As a developer, I want a properly configured development environment, so that I can begin building features immediately without setup issues.

#### Acceptance Criteria

1. THE **Development Environment** SHALL include Node.js version 18 or higher
2. THE **Development Environment** SHALL include a configured package manager (Bun or npm)
3. WHEN the project is initialized, THE **Development Environment** SHALL create a Git repository
4. THE **Development Environment** SHALL load environment variables from a .env file containing VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_GEMINI_API_KEY

### Requirement 2

**User Story:** As a developer, I want a fast and reliable build system, so that I can iterate quickly on features without waiting for slow builds.

#### Acceptance Criteria

1. THE **Build System** SHALL use Vite version 7.2 with the React SWC plugin
2. THE **Build System** SHALL compile TypeScript version 5.9 with relaxed type checking configuration
3. THE **Build System** SHALL resolve **Path Alias** @/ to the src/ directory
4. THE **Build System** SHALL serve the development application on port 8080
5. WHEN a source file changes during development, THE **Build System** SHALL apply **HMR** within 1 second
6. WHEN building for production, THE **Build System** SHALL complete within 2 minutes
7. WHEN the development server starts, THE **Build System** SHALL become ready within 3 seconds

### Requirement 3

**User Story:** As a developer, I want a modern styling system, so that I can build beautiful UIs quickly with utility classes and consistent design patterns.

#### Acceptance Criteria

1. THE **Styling System** SHALL use Tailwind CSS version 4.1
2. THE **Styling System** SHALL process CSS through PostCSS
3. THE **Styling System** SHALL provide glass morphism design components
4. THE **Styling System** SHALL support dark mode and light mode themes
5. THE **Styling System** SHALL support Halloween theme mode with teal accent color
6. WHEN a theme mode is changed, THE **Styling System** SHALL update all components without page refresh

### Requirement 4

**User Story:** As a developer, I want automated code quality tools, so that the codebase remains clean and readable across all files.

#### Acceptance Criteria

1. THE **Build System** SHALL use Biome version 2.3.5 for linting and formatting
2. THE **Build System** SHALL enforce double quotes in all code files
3. THE **Build System** SHALL enforce 2-space indentation in all code files
4. THE **Build System** SHALL organize imports automatically
5. WHEN Biome detects code quality violations, THE **Build System** SHALL provide actionable error messages with file location and line number

### Requirement 5

**User Story:** As a developer, I want seamless backend integration, so that I can build features that persist data securely without managing infrastructure.

#### Acceptance Criteria

1. THE **Integral** application SHALL connect to a Supabase project
2. WHEN database schema changes are made, THE **Integral** application SHALL apply migrations to the database
3. WHEN database schema changes are applied, THE **Build System** SHALL regenerate TypeScript types that accurately reflect the current schema
4. THE **Integral** application SHALL enforce **RLS** policies that restrict each user to accessing only their own data
5. THE **Integral** application SHALL authenticate users through Supabase authentication

### Requirement 6

**User Story:** As a developer, I want essential dependencies installed and configured, so that I can build features using modern React patterns and UI components.

#### Acceptance Criteria

1. THE **Build System** SHALL include React version 19.2 and React DOM
2. THE **Integral** application SHALL use React Router DOM version 7.9 for routing with lazy loading
3. THE **Integral** application SHALL use TanStack Query version 5 for server state management
4. THE **Integral** application SHALL use Framer Motion version 12.23 for animations
5. THE **Integral** application SHALL use Radix UI primitives for accessible components
6. THE **Integral** application SHALL use Sonner version 2.0 for toast notifications

### Requirement 7

**User Story:** As a developer, I want a well-organized project structure, so that I can quickly locate and modify code without confusion.

#### Acceptance Criteria

1. THE **Integral** application SHALL organize source code in a src/ directory
2. THE **Integral** application SHALL separate UI components into subdirectories by feature (ui, tasks, notes, journal, pomodoro, budget, accounts, theme, halloween, landing, skeletons, folders)
3. THE **Integral** application SHALL organize pages, hooks, contexts, lib, types, and assets in dedicated directories
4. THE **Integral** application SHALL store Supabase integration code in integrations/supabase/
5. THE **Integral** application SHALL store static public assets in a public/ folder
