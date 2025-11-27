# Journal System - Implementation Tasks

## Phase 1: Database and Type Definitions

- [x] 1. Verify Database Schema
  - Review `supabase/migrations/20251119045332_remote_schema.sql` to confirm daily_entries and projects table structure
  - Verify daily_entries table has columns: id (UUID PK), user_id (UUID FK), project_id (UUID FK nullable), title (VARCHAR(255) NOT NULL), content (TEXT NOT NULL), entry_date (DATE DEFAULT CURRENT_DATE), mood (SMALLINT CHECK 1-5), energy_level (SMALLINT CHECK 1-5), tags (TEXT[]), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
  - Verify projects table has columns: id (UUID PK), user_id (UUID FK), name (VARCHAR(255) NOT NULL), description (TEXT), color (VARCHAR(7) DEFAULT '#10B981'), archived (BOOLEAN DEFAULT false), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
  - Confirm RLS policies exist for SELECT, INSERT, UPDATE, DELETE operations (WHERE auth.uid() = user_id)
  - Verify foreign key constraints: daily_entries.user_id → auth.users.id, daily_entries.project_id → projects.id
  - Verify indexes exist: idx_daily_entries_user_id, idx_daily_entries_project, idx_daily_entries_created_at
  - Verify trigger exists: update_daily_entries_updated_at trigger calls update_updated_at_column() function
  - TypeScript types are auto-generated in `src/integrations/supabase/types.ts`
  - _Requirements: AC1, AC5_

- [x] 2. Create Type Definitions
  - Create `src/types/journal.ts` file
  - Define Journal interface with all fields and proper types
  - Define Project interface with all fields
  - Define JournalFormData interface for form submissions
  - Define ProjectFormData interface for project forms
  - Export all types for use across the application
  - _Requirements: AC1, AC5_

## Phase 2: Core Data Management Hooks

- [x] 3. Implement useJournalQuery Hook
  - Create `src/hooks/queries/useJournalQuery.ts` file
  - Set up useQuery with key ["journal-entries", userId] to fetch all user entries
  - Include project data with select query using join
  - Order entries by entry_date descending, then created_at descending
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Return data, isLoading, error states
  - _Requirements: AC2_

- [x] 4. Implement Journal Entry Creation Mutation
  - Create useCreateJournal mutation in useJournalQuery.ts
  - Validate entry data: title required, entry_date required, mood 1-5, energy_level 1-5
  - Insert entry with user_id, title, content, entry_date, project_id (nullable), mood, energy_level, tags
  - Implement optimistic update: insert entry in correct position based on entry_date and created_at
  - Show success toast on completion
  - Show error toast and rollback on failure
  - _Requirements: AC1_

- [x] 5. Implement Journal Entry Update Mutation
  - Create useUpdateJournal mutation in useJournalQuery.ts
  - Accept id and updates parameters
  - Validate updates if title or entry_date are being changed
  - Update entry with provided fields
  - Set updated_at to current timestamp
  - Implement optimistic update: update entry in cache immediately
  - Show success toast on completion
  - Show error toast on failure
  - _Requirements: AC3_

- [x] 6. Implement Journal Entry Delete Mutation
  - Create useDeleteJournal mutation in useJournalQuery.ts
  - Validate entry ID is provided
  - Delete entry by ID from database
  - Implement optimistic update: remove entry from cache immediately
  - Show success toast on completion
  - Show error toast on failure
  - _Requirements: AC3_

- [x] 7. Implement useProjectsQuery Hook
  - Create `src/hooks/queries/useProjectsQuery.ts` file
  - Set up useQuery with key ["projects", userId]
  - Fetch projects from Supabase ordered by created_at ascending
  - Filter by archived status (default: show non-archived)
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - Return data, isLoading, error states
  - _Requirements: AC5_

- [x] 8. Implement Project Mutations
  - Create useCreateProject mutation in useProjectsQuery.ts
  - Create useUpdateProject mutation with optimistic updates
  - Create useDeleteProject mutation with optimistic updates
  - Create useArchiveProject mutation to toggle archived status
  - Show success/error toasts for each operation
  - Invalidate queries on success
  - _Requirements: AC5_

- [x] 9. Implement useJournalFiltering Hook
  - Create `src/hooks/useJournalFiltering.ts` file
  - Accept entries, filter, sortBy, searchTerm, selectedProjectId as parameters
  - Use useMemo for filtered entries: apply time filter, project filter, and search filter
  - Search should check title, content, tags, project name (case-insensitive)
  - Time filters: "all" (no filter), "today" (entry_date = today), "this-week" (entry_date >= start of week), "this-month" (entry_date >= start of month), "project" (filter by selectedProjectId)
  - Use useMemo for sorted entries: sort by newest, oldest, title, mood, energy
  - For mood/energy sort: sort by value descending (entries without values appear last)
  - Return filteredEntries and sortedEntries
  - _Requirements: AC2, AC6_

## Phase 3: Main Journal Page

- [x] 10. Create Journal Page Structure
  - Create `src/pages/Journal.tsx` file
  - Import all necessary hooks, components, and assets
  - Set up state for activeTab, selectedProject, selectedEntry
  - Set up state for modals: showEntryForm, showProjectForm, showEntriesModal, entryToDelete, projectToDelete
  - Set up state for filters: filter, sortBy, searchTerm, selectedProjectId
  - Initialize all hooks: useJournalQuery, useProjectsQuery, useJournalFiltering
  - _Requirements: AC2, AC4, AC5_

- [x] 11. Implement URL State Synchronization
  - Use useSearchParams to read tab and project from URL
  - Initialize activeTab from URL tab parameter (default: "entries")
  - Initialize selectedProject from URL project parameter
  - Implement handleTabChange to update activeTab and URL
  - Implement handleProjectSelect to set project and update URL
  - Use useEffect to sync URL parameters with state on mount
  - _Requirements: AC2, AC5_

- [x] 12. Create Tab Navigation with Animated Indicator
  - Create refs for each tab button (entries, projects, calendar) and tabs container
  - Calculate tab position (left, width, top, height) based on active tab
  - Use useEffect to update position when activeTab changes
  - Use useEffect to recalculate position when Halloween mode changes
  - Create motion.div for sliding background indicator
  - Animate indicator position with smooth transitions
  - Apply theme-aware colors to indicator (teal for Halloween, purple otherwise)
  - Add glowing shadow animation for Halloween mode
  - Handle window resize with debounced position recalculation
  - _Requirements: AC2, AC4, AC5_

- [x] 13. Create Header Section with Decorations
  - Display "Journal" title with theme-aware color
  - Show view-specific description text (changes based on activeTab)
  - Add "New Entry" button with Plus icon
  - Apply theme-aware styling to button
  - Add Halloween decorations: witch background, bat, pumpkin, spider, ghost, web
  - Animate decorations (flying bat, peeking pumpkin, hanging spider, appearing ghost)
  - Position decorations with absolute positioning and z-index layering
  - _Requirements: AC1_

- [x] 14. Implement Loading State
  - Check if loading is true and entries array is empty
  - Display skeleton loaders for header, tabs, and content
  - Use tab-specific skeletons: EntriesTabSkeleton, ProjectsTabSkeleton, CalendarTabSkeleton
  - Wrap in motion.div with fade-in animation
  - _Requirements: (loading states)_

- [x] 15. Implement Tab Content Rendering
  - Use conditional rendering based on activeTab
  - For "entries" view: render JournalEntryFilters, JournalEntryList
  - For "projects" view: render ProjectsList or ProjectDetailsModal based on selectedProject
  - For "calendar" view: render JournalCalendar
  - Pass appropriate props and callbacks to each component
  - _Requirements: AC2, AC4, AC5_

## Phase 4: Entry List View Components

- [x] 16. Create JournalEntryFilters Component
  - Create `src/components/journal/JournalEntryFilters.tsx` file
  - Add search input with Search icon
  - Add filter buttons: All, Today, This Week, This Month
  - Add project filter dropdown (shows all projects)
  - Add sort dropdown (Newest, Oldest, Title, Mood, Energy)
  - Call appropriate onChange handlers when filters change
  - Apply theme-aware styling to all inputs and dropdowns
  - Make responsive for mobile devices
  - _Requirements: AC2, AC6_

- [x] 17. Create JournalEntryList Component
  - Create `src/components/journal/JournalEntryList.tsx` file
  - Use Virtuoso component for virtualized scrolling
  - Pass sortedEntries as data prop
  - Render entry cards for each entry in itemContent
  - Pass onEntryClick callback
  - Display empty state when no entries match filters
  - Show appropriate empty state message and illustration
  - _Requirements: AC2_

- [x] 18. Create Entry Card
  - Display entry title (bold, truncated)
  - Display entry date with calendar icon
  - Display mood emoji if present
  - Display energy level indicator if present
  - Display content preview (2 lines, truncated)
  - Display tags as small badges (max 3 visible)
  - Display project badge with project color if associated
  - Add click handler to open entry detail modal
  - Apply theme-aware styling with glass card effect
  - Add hover effects
  - _Requirements: AC2_

## Phase 5: Entry Modals

- [x] 19. Create JournalEntryCreationModal Component
  - Create `src/components/journal/JournalEntryCreationModal.tsx` file
  - Use Modal component as base
  - Add title input field (required, validated)
  - Add content textarea (rich text or plain text)
  - Add entry date picker (default: today)
  - Add mood selector (1-5 scale with emojis)
  - Add energy level selector (1-5 scale with indicators)
  - Add tags input with comma-separated values
  - Add project selector dropdown (optional)
  - Use React Hook Form for form management
  - Add validation: title required, entry_date required, mood 1-5, energy_level 1-5
  - Display inline error messages below fields
  - On submit: call onSubmit with JournalFormData
  - Show success toast on submit
  - Close modal on success
  - _Requirements: AC1, AC7, AC8_

- [x] 20. Create JournalEntryModal Component
  - Create `src/components/journal/JournalEntryModal.tsx` file
  - Use Modal component as base
  - Display entry title in header
  - Display entry date
  - Display mood emoji and label if present
  - Display energy level indicator and label if present
  - Display content (formatted text)
  - Display tags as badges
  - Display project badge if associated
  - Add "Edit" button that enables inline editing
  - Add "Delete" button with confirmation
  - Add "Close" button
  - Handle updates: call onUpdate with changes
  - Handle delete: call onDelete with entry ID
  - Apply theme-aware styling
  - _Requirements: AC3_

- [x] 21. Implement Mood Selector Component
  - Create mood selector with 5 options
  - Display emoji for each mood level:
    - 1: 😢 (Very Bad, red)
    - 2: 😕 (Bad, orange)
    - 3: 😐 (Okay, purple)
    - 4: 🙂 (Good, green)
    - 5: 😄 (Great, green)
  - Add click handler to select mood
  - Highlight selected mood
  - Apply color coding based on mood value
  - Make interactive and accessible
  - _Requirements: AC7_

- [x] 22. Implement Energy Level Selector Component
  - Create energy level selector with 5 options
  - Display indicators for each level:
    - 1: Exhausted (red)
    - 2: Tired (orange)
    - 3: Moderate (purple)
    - 4: Energized (green)
    - 5: Highly Energized (green)
  - Add click handler to select energy level
  - Highlight selected level
  - Apply color coding based on energy value
  - Make interactive and accessible
  - _Requirements: AC7_

- [x] 23. Implement Tags Input Component
  - Create tags input field
  - Accept comma-separated values
  - Convert to array on submit
  - Display selected tags as removable badges
  - Allow adding new tags
  - Fetch existing tags from entries for auto-suggest (optional)
  - Style with theme-aware colors
  - _Requirements: AC8_

## Phase 6: Calendar View

- [x] 24. Create JournalCalendar Component
  - Create `src/components/journal/JournalCalendar.tsx` file
  - Use react-day-picker library for monthly calendar view
  - Group entries by entry_date
  - Display entry indicators on each date
  - Show mood emoji on dates with entries
  - Calculate and display entry count for each day
  - Highlight current date with distinct styling
  - Add navigation buttons for previous/next month
  - Add click handler for dates to show JournalEntriesModal
  - Apply theme-aware styling to calendar
  - _Requirements: AC4_

- [x] 25. Create JournalEntriesModal Component
  - Create `src/components/journal/JournalEntriesModal.tsx` file
  - Use Modal component as base
  - Display selected date in header
  - List all entries for that date
  - Show entry title, mood, energy, content preview
  - Add click handler to open full entry detail modal
  - Allow editing entries from this modal
  - Allow deleting entries from this modal
  - Show "No entries" message if date has no entries
  - Apply theme-aware styling
  - _Requirements: AC4_

## Phase 7: Projects View

- [x] 26. Create ProjectsList Component
  - Create `src/components/journal/ProjectsList.tsx` file
  - Display projects in responsive grid layout (1-3 columns based on screen size)
  - Show project name, description preview, entry count for each project
  - Display project color as left border or background accent
  - Add click handler to call onProjectClick with project
  - Add "Create Project" button
  - Apply theme-aware styling to project cards
  - Use glass card styling for each project
  - Sort projects by created_at ascending
  - _Requirements: AC5_

- [x] 27. Create ProjectCreationModal Component
  - Create `src/components/journal/ProjectCreationModal.tsx` file
  - Use Modal component as base
  - Add name input field (required, validated)
  - Add description textarea (optional)
  - Add color picker (default: #10B981)
  - Use React Hook Form for form management
  - Add validation: name required
  - Display inline error messages below fields
  - Handle create mode: call onSubmit with new project data
  - Handle edit mode: pre-fill fields with project data, call onSubmit with updates
  - Show success toast on submit
  - Close modal on success
  - _Requirements: AC5_

- [x] 28. Create ProjectDetailsModal Component
  - Create `src/components/journal/ProjectDetailsModal.tsx` file
  - Use Modal component as base
  - Display project header with name, description, color
  - Show project statistics: total entries, date range
  - List all entries associated with project (filter by project_id)
  - Reuse JournalEntryList component with filtered entries
  - Add "Add Entry" button that pre-selects the project
  - Add "Edit" button that opens ProjectCreationModal in edit mode
  - Add "Archive" button to toggle archived status
  - Add "Delete" button with confirmation
  - Add "Back" button to return to projects list
  - Apply theme-aware styling
  - _Requirements: AC5_

## Phase 8: Final Polish

- [x] 29. Implement Empty States
  - Add empty state for no entries (encouraging message, illustration)
  - Add empty state for no projects (call-to-action to create first project)
  - Add empty state for no entries on selected date
  - Add empty state for no search results
  - Add Halloween-themed empty states when isHalloweenMode is true
  - Use appropriate icons and messages for each state
  - _Requirements: (UX)_

- [x] 30. Implement Confirmation Modals
  - Use existing ConfirmationModal component from `src/components/ui/ConfirmationModal.tsx`
  - Configure for entry deletion with entry title
  - Configure for project deletion with project name and warning about entries
  - Set type to "danger" for red styling
  - Show appropriate confirmation message
  - Call delete handler on confirm
  - _Requirements: AC3, AC5_

- [x] 31. Add Loading Skeletons
  - Create `src/components/skeletons/JournalSkeletons.tsx` file
  - Create EntriesTabSkeleton with entry card skeletons
  - Create ProjectsTabSkeleton with project card skeletons
  - Create CalendarTabSkeleton with calendar skeleton
  - Use Skeleton component from UI library
  - Apply theme-aware styling
  - _Requirements: (UX)_

- [x] 32. Final Code Review and Cleanup
  - Remove console.log statements
  - Ensure consistent code formatting with Biome
  - Check for unused imports and variables
  - Verify all error messages are user-friendly
  - Add comments for complex logic (filtering, sorting, date calculations)
  - Verify all components have proper TypeScript types
  - Check for any hardcoded values that should be constants
  - Verify all requirements are met
  - _Requirements: All_
