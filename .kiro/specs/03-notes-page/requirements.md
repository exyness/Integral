# Requirements Document

## Introduction

This document specifies the requirements for implementing a rich note-taking system for Integral using the Lexical editor framework. The system provides rich text editing with markdown shortcuts, folder-based organization, pinning and favorites functionality, instant search, and multiple view modes. The design prioritizes a smooth editing experience with auto-save, optimistic updates for instant feedback, and seamless integration with the existing application architecture.

## Glossary

- **Note**: A document with title, content (plain or rich text), category, tags, and metadata
- **Lexical Editor**: Facebook's extensible text editor framework for rich text editing
- **Rich Content**: Formatted text stored as Lexical JSON with styling, headings, lists, code blocks, etc.
- **Plain Content**: Unformatted text stored as simple string
- **Folder**: A named container for organizing notes with a color identifier
- **Pinned Note**: Note that appears at the top of the list regardless of other sorting
- **Favorite Note**: Note marked as important, appearing after pinned notes
- **Auto-save**: Automatic saving of note content after a debounce period (1 second)
- **Optimistic Update**: UI update that occurs immediately before server confirmation
- **Markdown Shortcut**: Keyboard pattern that triggers formatting (e.g., `#` for heading)
- **Virtualization**: Rendering technique that only displays visible items for performance
- **Grid View**: Display mode showing notes as cards in a responsive grid
- **List View**: Display mode showing notes as compact rows
- **Integral**: The productivity suite application

## Requirements

### Requirement 1

**User Story:** As a user, I want to create notes with rich text formatting, so that I can organize information with proper structure and styling.

#### Acceptance Criteria

1. WHEN a user clicks "New Note", THE **Integral** application SHALL display a note creation modal
2. THE note creation modal SHALL require a title field (non-empty)
3. THE note creation modal SHALL provide a **Lexical Editor** for content input
4. THE note creation modal SHALL provide optional fields for category and tags
5. THE note creation modal SHALL provide a folder selector to assign the note to a **Folder**
6. WHEN a user submits the form, THE **Integral** application SHALL create the **Note** and add it to the list immediately using **Optimistic Update**
7. WHEN note creation succeeds, THE **Integral** application SHALL display a success toast notification
8. WHEN note creation fails, THE **Integral** application SHALL rollback the optimistic update and display an error toast

### Requirement 2

**User Story:** As a user, I want to format text while typing using toolbar buttons and markdown shortcuts, so that I can quickly create well-structured notes without interrupting my flow.

#### Acceptance Criteria

1. THE **Lexical Editor** SHALL provide toolbar buttons for bold, italic, and underline formatting
2. THE **Lexical Editor** SHALL provide toolbar buttons for headings (H1, H2, H3)
3. THE **Lexical Editor** SHALL provide toolbar buttons for bullet lists and numbered lists
4. THE **Lexical Editor** SHALL provide a toolbar button for code blocks
5. THE **Lexical Editor** SHALL provide toolbar buttons for undo and redo
6. WHEN a user types `# ` at the start of a line, THE **Lexical Editor** SHALL convert it to an H1 heading
7. WHEN a user types `## ` at the start of a line, THE **Lexical Editor** SHALL convert it to an H2 heading
8. WHEN a user types `### ` at the start of a line, THE **Lexical Editor** SHALL convert it to an H3 heading
9. WHEN a user types `- ` at the start of a line, THE **Lexical Editor** SHALL convert it to a bullet list
10. WHEN a user types `1. ` at the start of a line, THE **Lexical Editor** SHALL convert it to a numbered list
11. WHEN a user types three backticks (` ``` `), THE **Lexical Editor** SHALL create a code block

### Requirement 3

**User Story:** As a user, I want my notes to save automatically while I type, so that I never lose my work even if I forget to save manually.

#### Acceptance Criteria

1. WHEN a user edits note content in the **Lexical Editor**, THE **Integral** application SHALL trigger **Auto-save** after 1 second of inactivity
2. WHEN **Auto-save** is triggered, THE **Integral** application SHALL save both plain content and **Rich Content** (Lexical JSON)
3. WHEN **Auto-save** is in progress, THE **Integral** application SHALL display a "Saving..." indicator
4. WHEN **Auto-save** completes successfully, THE **Integral** application SHALL display a "Saved" indicator briefly
5. WHEN **Auto-save** fails, THE **Integral** application SHALL display an error message and retain unsaved changes
6. THE **Integral** application SHALL use **Optimistic Update** to reflect changes immediately in the UI

### Requirement 4

**User Story:** As a user, I want to view my notes in different layouts, so that I can choose the view that works best for my current task.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a **Grid View** option showing notes as cards
2. THE **Integral** application SHALL provide a **List View** option showing notes as compact rows
3. THE **Grid View** SHALL display note title, content preview (2 lines), category badge, tags (max 3 visible), pin icon, favorite icon, and folder color indicator
4. THE **List View** SHALL display note title, category, tags, updated date, pin icon, and favorite icon
5. THE **Integral** application SHALL provide a view toggle button to switch between grid and list views
6. WHEN the note list exceeds 100 items, THE **Integral** application SHALL use **Virtualization** to maintain smooth scrolling
7. THE **Integral** application SHALL persist the selected view mode across sessions

### Requirement 5

**User Story:** As a user, I want to organize notes into folders, so that I can keep different topics separated and easily navigate between them.

#### Acceptance Criteria

1. THE **Integral** application SHALL display a sidebar with all folders
2. THE sidebar SHALL show an "All Notes" option with total note count
3. THE sidebar SHALL display each **Folder** with its name, color, and note count
4. WHEN a user clicks a folder, THE **Integral** application SHALL filter notes to show only notes in that **Folder**
5. WHEN a user clicks "All Notes", THE **Integral** application SHALL display all notes regardless of folder
6. THE **Integral** application SHALL provide a "New Folder" button in the sidebar
7. WHEN a user creates a folder, THE **Integral** application SHALL allow specifying name and color
8. WHEN a user deletes a folder, THE **Integral** application SHALL move all notes in that folder to the root (no folder)

### Requirement 6

**User Story:** As a user, I want to pin important notes and mark favorites, so that I can quickly access frequently used information.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a pin toggle button on each note card
2. WHEN a user pins a note, THE **Integral** application SHALL update is_pinned to true and move the note to the top of the list
3. WHEN a user unpins a note, THE **Integral** application SHALL update is_pinned to false and resort the note by its normal criteria
4. THE **Integral** application SHALL provide a favorite toggle button on each note card
5. WHEN a user marks a note as favorite, THE **Integral** application SHALL update is_favorite to true
6. THE **Integral** application SHALL sort notes with **Pinned Note** items first, then **Favorite Note** items, then remaining notes by updated date
7. THE **Integral** application SHALL display visual indicators (pin icon, star icon) for pinned and favorite notes
8. WHEN pin or favorite status changes, THE **Integral** application SHALL display a toast notification

### Requirement 7

**User Story:** As a user, I want to search notes instantly as I type, so that I can find information quickly without scrolling through all my notes.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide a search input field in the top bar
2. WHEN a user types in the search field, THE **Integral** application SHALL filter notes after a 300ms debounce
3. THE search SHALL match note title, content, category, and tags (case-insensitive)
4. THE **Integral** application SHALL display search results as the user types
5. THE **Integral** application SHALL provide a clear button (X icon) to reset the search
6. WHEN a user presses Ctrl+K (or Cmd+K on Mac), THE **Integral** application SHALL focus the search input
7. WHEN a user presses Escape while the search input is focused, THE **Integral** application SHALL clear the search and blur the input
8. THE **Integral** application SHALL display a message when no notes match the search query

### Requirement 8

**User Story:** As a user, I want to filter notes by status (all, pinned, favorites), so that I can focus on specific subsets of my notes.

#### Acceptance Criteria

1. THE **Integral** application SHALL provide filter buttons for "All", "Pinned", and "Favorites"
2. WHEN a user clicks "All", THE **Integral** application SHALL display all notes (default)
3. WHEN a user clicks "Pinned", THE **Integral** application SHALL display only **Pinned Note** items
4. WHEN a user clicks "Favorites", THE **Integral** application SHALL display only **Favorite Note** items
5. THE **Integral** application SHALL highlight the active filter button
6. THE **Integral** application SHALL display the count of filtered notes
7. THE **Integral** application SHALL combine filter with folder selection and search query using AND logic

### Requirement 9

**User Story:** As a user, I want to view and edit note details in modals, so that I can manage all note properties without leaving my current view.

#### Acceptance Criteria

1. WHEN a user clicks a note card, THE **Integral** application SHALL display a view note modal
2. THE view note modal SHALL display the note title, rendered **Rich Content**, category, tags, and timestamps
3. THE view note modal SHALL provide an "Edit" button to switch to edit mode
4. THE view note modal SHALL provide a "Delete" button with confirmation
5. THE view note modal SHALL provide pin and favorite toggle buttons
6. WHEN a user clicks "Edit", THE **Integral** application SHALL display an edit note modal with the **Lexical Editor**
7. THE edit note modal SHALL load the note's **Rich Content** into the **Lexical Editor**
8. THE edit note modal SHALL enable editing of title, content, category, tags, and folder
9. THE edit note modal SHALL implement **Auto-save** for content changes
10. WHEN a user closes the edit modal, THE **Integral** application SHALL return to the view modal

### Requirement 10

**User Story:** As a user, I want the notes interface to support Halloween theme mode, so that I can enjoy seasonal decorations while taking notes.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Integral** application SHALL display teal accent color (#60c9b6) instead of default colors
2. WHEN Halloween mode is enabled, THE notes page SHALL display animated decorations (witch, pumpkin, skull)
3. WHEN Halloween mode is enabled, THE folder colors SHALL be overridden with teal
4. WHEN Halloween mode is enabled, THE empty states SHALL display Halloween-themed illustrations
5. THE **Integral** application SHALL apply Halloween styling consistently across all note views and modals
6. WHEN Halloween mode is disabled, THE **Integral** application SHALL revert to standard theme colors and folder-specific colors

### Requirement 11

**User Story:** As a developer, I want centralized note state management with optimistic updates, so that the UI feels instant and data stays synchronized with the database.

#### Acceptance Criteria

1. THE **Integral** application SHALL use TanStack Query with query key ["notes", userId] for all note data
2. WHEN a note is created, THE **Integral** application SHALL add it to the local cache immediately before server confirmation
3. WHEN a note is updated, THE **Integral** application SHALL update the local cache immediately before server confirmation
4. WHEN a note is deleted, THE **Integral** application SHALL remove it from the local cache immediately before server confirmation
5. WHEN a server operation fails, THE **Integral** application SHALL rollback the **Optimistic Update** and display an error toast
6. THE **Integral** application SHALL configure query staleTime to 5 minutes and gcTime to 10 minutes
7. THE **Integral** application SHALL fetch notes ordered by updated_at descending
8. THE **Integral** application SHALL store rich content as Lexical JSON in the rich_content field

### Requirement 12

**User Story:** As a user, I want smooth navigation with URL state synchronization, so that I can bookmark specific folders or notes and use browser navigation.

#### Acceptance Criteria

1. WHEN a user selects a folder, THE **Integral** application SHALL update the URL with a folder query parameter (short ID)
2. WHEN a user opens a note, THE **Integral** application SHALL update the URL with a note query parameter (short ID)
3. WHEN a user loads the page with URL parameters, THE **Integral** application SHALL restore the selected folder and open note
4. WHEN a user uses browser back/forward buttons, THE **Integral** application SHALL navigate between folder and note states
5. THE **Integral** application SHALL use short IDs (first 8 characters) in URLs for cleaner appearance
6. THE **Integral** application SHALL find full entities by matching short ID prefix
7. WHEN URL parameters change, THE **Integral** application SHALL update the UI without full page reload
8. THE **Integral** application SHALL use replace mode for URL updates to avoid cluttering browser history
