# Notes System - Implementation Tasks

## Phase 1: Database and Type Definitions

- [x] 1. Verify Database Schema
  - Review `supabase/migrations/20251119045332_remote_schema.sql` to confirm notes and folders table structure
  - Verify notes table has columns: id, user_id, folder_id, title, content, rich_content (JSONB), content_type, category, tags (TEXT[]), is_pinned, is_favorite, usage_count, created_at, updated_at
  - Verify folders table has columns: id, user_id, name, type (CHECK IN 'note'/'account'), parent_id, color, created_at, updated_at
  - Confirm RLS policies exist for both tables (WHERE auth.uid() = user_id)
  - Verify foreign key constraints: notes.folder_id → folders.id, notes.user_id → auth.users.id
  - TypeScript types are auto-generated in `src/integrations/supabase/types.ts`
  - _Requirements: 11.1, 11.7_

## Phase 2: Lexical Editor Setup

- [x] 2. Install Lexical Dependencies
  - Verify lexical core package is installed
  - Verify @lexical/react is installed
  - Verify @lexical/rich-text is installed
  - Verify @lexical/list is installed
  - Verify @lexical/code is installed
  - Verify @lexical/link is installed
  - Verify @lexical/markdown is installed
  - Verify @lexical/hashtag is installed
  - Verify @lexical/table is installed
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Create Lexical Editor Component
  - Create `src/components/notes/lexical/LexicalRichTextEditor.tsx` file
  - Set up LexicalComposer with initial config
  - Configure editor theme with CSS class mappings
  - Register node types: HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, CodeHighlightNode, LinkNode, AutoLinkNode, HashtagNode, TableNode, TableCellNode, TableRowNode
  - Add RichTextPlugin for core functionality
  - Add HistoryPlugin for undo/redo
  - Add ListPlugin for bullet and numbered lists
  - Add LinkPlugin for hyperlinks
  - Add CheckListPlugin for checkbox lists
  - Add HashtagPlugin for hashtag detection
  - Add TablePlugin for table support
  - Add MarkdownShortcutPlugin with TRANSFORMERS
  - Add TabIndentationPlugin for tab key handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

- [x] 4. Implement OnChange Handler
  - Create OnChangeHandler component that uses OnChangePlugin
  - Extract plain text from editor state using $getRoot().getTextContent()
  - Clean up zero-width spaces ([\u200B-\u200D\uFEFF]) and non-breaking spaces (\u00A0)
  - Serialize editor state to JSON string
  - Call onChange callback with both JSON and plain text
  - _Requirements: 3.2, 11.8_

- [x] 5. Create Editor Toolbar
  - Create `src/components/notes/lexical/EditorToolbar.tsx` file
  - Add bold button (FORMAT_TEXT_COMMAND with "bold")
  - Add italic button (FORMAT_TEXT_COMMAND with "italic")
  - Add underline button (FORMAT_TEXT_COMMAND with "underline")
  - Add heading buttons (H1, H2, H3) using FORMAT_ELEMENT_COMMAND
  - Add bullet list button (INSERT_UNORDERED_LIST_COMMAND)
  - Add numbered list button (INSERT_ORDERED_LIST_COMMAND)
  - Add code block button (INSERT_CODE_COMMAND)
  - Add undo button (UNDO_COMMAND)
  - Add redo button (REDO_COMMAND)
  - Apply folder color to active button states
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Create Rich Text Renderer
  - Create `src/components/notes/lexical/RichTextRenderer.tsx` file
  - Set up read-only LexicalComposer
  - Parse Lexical JSON or fall back to plain text
  - Use same node types as editor for consistency
  - Support maxLines prop for preview truncation (WebKit-line-clamp)
  - Apply theme-aware text colors
  - _Requirements: 9.2_

- [x] 7. Add Code Copy Button Plugin
  - Create CodeCopyButtonPlugin in RichTextRenderer
  - Use useEffect to find all code blocks (.lexical-code)
  - Add copy button to each code block (positioned absolute top-right)
  - Implement click handler that copies code to clipboard
  - Show "Copied!" feedback for 2 seconds
  - Style button with theme-aware colors
  - _Requirements: 9.2_

- [x] 8. Create Lexical CSS Styles
  - Create `src/components/notes/lexical/lexical-editor.css` file
  - Style editor container and wrapper
  - Style content editable area
  - Style headings (H1-H6) with appropriate sizes
  - Style lists (bullet, numbered, nested)
  - Style code blocks with background and padding
  - Style links with color and hover effects
  - Style hashtags with color
  - Style tables with borders
  - Add focus styles using CSS custom property (--editor-focus-color)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

## Phase 3: Core Data Management Hooks

- [x] 9. Implement useNotes Hook
  - Create `src/hooks/useNotes.ts` file
  - Set up useQuery with key ["notes", userId]
  - Fetch notes from Supabase ordered by updated_at descending
  - Normalize data: set defaults for optional fields (category, folder_id, tags, usage_count, is_pinned, is_favorite)
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - _Requirements: 11.1, 11.6, 11.7_

- [x] 10. Implement Create Note Mutation
  - Create useMutation for note creation
  - Insert note with user_id, title, content, rich_content, content_type, category, tags, folder_id
  - Set defaults: usage_count: 0, is_pinned: false, is_favorite: false
  - Implement optimistic update: create temp note with id `temp-${Date.now()}`
  - Add temp note to beginning of cache array
  - On success: invalidate queries and show success toast
  - On error: rollback to previousNotes and show error toast
  - _Requirements: 1.1, 1.6, 1.7, 1.8, 11.2, 11.5_

- [x] 11. Implement Update Note Mutation
  - Create useMutation for note updates
  - Update note with provided fields
  - Implement optimistic update: update note in cache immediately
  - On error: rollback to previousNotes
  - On settled: invalidate queries
  - _Requirements: 3.1, 3.2, 9.8, 11.3, 11.5_

- [x] 12. Implement Delete Note Mutation
  - Create useMutation for note deletion
  - Delete note by ID from database
  - On success: invalidate queries and show success toast
  - On error: show error toast
  - _Requirements: 9.4, 11.4_

- [x] 13. Implement Increment Usage Method
  - Find note by ID in notes array
  - Call updateNote mutation with incremented usage_count
  - Use when note is opened/viewed
  - _Requirements: (tracking feature)_

- [x] 14. Implement useFolders Hook
  - Create `src/hooks/useFolders.ts` file
  - Set up useQuery with key ["folders", userId, type]
  - Fetch folders filtered by type ("note" or "account")
  - Order by created_at ascending
  - Configure staleTime: 5 minutes, gcTime: 10 minutes
  - _Requirements: 5.1, 5.2_

- [x] 15. Implement Folder Mutations
  - Create useMutation for folder creation (name, color, type, user_id)
  - Create useMutation for folder updates with optimistic update
  - Create useMutation for folder deletion
  - Show success/error toasts for each operation
  - Invalidate queries on success
  - _Requirements: 5.7, 5.8_

## Phase 4: Notes Page Layout

- [x] 16. Create Notes Page Structure
  - Create `src/pages/Notes.tsx` file
  - Set up flex layout with sidebar and main content area
  - Add mobile sidebar overlay (fixed, z-50, with backdrop)
  - Make sidebar collapsible on mobile (translate-x transform)
  - Add state for: viewMode, searchQuery, debouncedSearchQuery, filterMode, selectedFolder, selectedNote, modals
  - Initialize hooks: useNotes, useFolders, useTheme
  - _Requirements: 4.1, 5.1_

- [x] 17. Implement URL State Synchronization
  - Use useSearchParams to read/write URL parameters
  - Create getShortId function (first 8 characters of UUID)
  - Create findByShortId function (find entity by short ID prefix)
  - On folder/note selection: update URL with short IDs
  - On page load: restore folder/note from URL parameters
  - Use replace mode to avoid cluttering browser history
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [x] 18. Implement Search with Debouncing
  - Add search input field in top bar
  - Use useState for searchQuery (immediate) and debouncedSearchQuery (delayed)
  - Use useEffect with 300ms timeout to update debouncedSearchQuery
  - Clear timeout on cleanup to prevent memory leaks
  - Add clear button (X icon) that resets search and blurs input
  - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [x] 19. Implement Keyboard Shortcuts
  - Use useEffect to add keydown event listener
  - On Ctrl+K (or Cmd+K): prevent default, focus search input
  - On Escape: if search input is focused, clear search and blur
  - Remove event listener on cleanup
  - _Requirements: 7.6, 7.7_

- [x] 20. Implement Folder Sidebar
  - Use FolderSidebar component from `src/components/folders/FolderSidebar.tsx`
  - Pass folders with counts (calculate from notes array)
  - Display "All Notes" option with total count
  - Display each folder with name, color, and note count
  - Handle folder selection (update selectedFolder state)
  - Provide onCreateFolder, onEditFolder, onDeleteFolder callbacks
  - Add close button for mobile
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 21. Create Search and Filters Bar
  - Add search input with Search icon (left) and clear button (right)
  - Apply folder color to search icon when query is active
  - Add view mode toggle (Grid/List buttons)
  - Style active view button with folder color background
  - Add "New" dropdown menu (desktop) with Note and Folder options
  - Add separate buttons for mobile (Show Folders, New dropdown)
  - _Requirements: 4.1, 7.1, 7.4, 7.5_

- [x] 22. Create Filter Buttons
  - Add three filter buttons: All, Pinned, Favorites
  - Track active filter in filterMode state
  - Style active button with folder color
  - Display count of filtered notes
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 23. Implement Note Filtering Logic
  - Filter by search query: match title, content, category, tags (case-insensitive, trimmed)
  - Filter by folder: match folder_id with selectedFolder
  - Filter by mode: all (no filter), pinned (is_pinned), favorites (is_favorite)
  - Combine filters with AND logic
  - Sort results: pinned first, then favorites, then by updated_at descending
  - _Requirements: 7.2, 7.3, 8.7, 6.6_

- [x] 24. Calculate Active Folder Color
  - If Halloween mode: return teal (#60c9b6)
  - If no folder selected: return default purple (#8B5CF6)
  - If folder selected: return folder's color
  - Use for accents, buttons, focus states throughout UI
  - _Requirements: 10.1, 10.3_

## Phase 5: Note Display Views

- [x] 25. Create Grid View
  - Use VirtuosoGrid from react-virtuoso
  - Pass filteredNotes as data
  - Render note cards in responsive grid (1-4 columns based on screen size)
  - Display: title (bold), content preview (2 lines, truncated), category badge, tags (max 3), pin icon, favorite icon
  - Add folder color indicator (left border or dot)
  - Apply theme-aware styling (glass card effect)
  - Add click handler to open ViewNoteModal
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 26. Create List View
  - Use Virtuoso from react-virtuoso
  - Pass filteredNotes as data
  - Render note rows in compact format
  - Display: title, category, tags, updated date, pin icon, favorite icon
  - Apply theme-aware styling
  - Add click handler to open ViewNoteModal
  - _Requirements: 4.1, 4.4_

- [x] 27. Implement Pin Toggle
  - Add pin button to note cards/rows
  - On click: stop propagation, call updateNote with toggled is_pinned
  - Show toast: "Note pinned" or "Note unpinned"
  - Update triggers re-sort (pinned notes move to top)
  - _Requirements: 6.1, 6.2, 6.3, 6.7, 6.8_

- [x] 28. Implement Favorite Toggle
  - Add favorite button to note cards/rows
  - On click: stop propagation, call updateNote with toggled is_favorite
  - Show toast: "Added to favorites" or "Removed from favorites"
  - Update triggers re-sort (favorites after pinned)
  - _Requirements: 6.4, 6.5, 6.7, 6.8_

- [x] 29. Add Empty States
  - Check if filteredNotes.length === 0
  - Display appropriate message based on context:
    - No notes at all: "Create your first note"
    - No search results: "No notes match your search"
    - No notes in folder: "This folder is empty"
  - Add Halloween-themed illustrations when isHalloweenMode is true
  - _Requirements: 10.4_

## Phase 6: Note Modals

- [x] 30. Create Note Creation Modal
  - Create `src/components/notes/CreateNoteModal.tsx` file
  - Use Modal component as base
  - Add title input field (required, validated)
  - Add LexicalRichTextEditor component
  - Add category input field (optional)
  - Add tags input field (comma-separated, converted to array)
  - Add folder selector dropdown (shows all folders)
  - Handle onChange from editor: store both rich_content and plain content
  - On submit: call createNote with all fields, set content_type to "rich"
  - Close modal on success
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 31. Create View Note Modal
  - Create `src/components/notes/ViewNoteModal.tsx` file
  - Use Modal component as base
  - Display note title in header
  - Use RichTextRenderer to display formatted content
  - Display category badge and tags
  - Display created_at and updated_at timestamps
  - Add "Edit" button that switches to EditNoteModal
  - Add "Delete" button with confirmation
  - Add pin toggle button
  - Add favorite toggle button
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 32. Create Edit Note Modal
  - Create `src/components/notes/EditNoteModal.tsx` file
  - Use Modal component as base
  - Load note data into form fields
  - Add title input field (editable)
  - Add LexicalRichTextEditor with initialContent set to note.rich_content
  - Add category input field (editable)
  - Add tags input field (editable)
  - Add folder selector dropdown (editable)
  - Implement auto-save with 1 second debounce
  - Show "Saving..." indicator during save
  - Show "Saved" indicator briefly after save
  - On close: return to ViewNoteModal
  - _Requirements: 9.6, 9.7, 9.8, 9.9, 9.10, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 33. Implement Auto-save in Edit Modal
  - Use useMemo to create debounced save function (1000ms delay)
  - On editor onChange: call debounced save with content and rich_content
  - Set saving state to true when save starts
  - Set saving state to false when save completes
  - Display "Saving..." or "Saved" indicator based on state
  - Handle errors: display error message, keep unsaved changes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 34. Create Folder Modal
  - Create `src/components/folders/CreateFolderModal.tsx` file
  - Use Modal component as base
  - Add name input field (required)
  - Add color picker (default: #8B5CF6)
  - Support edit mode: pre-fill fields with existing folder data
  - On submit: call createFolder or updateFolder based on mode
  - Close modal on success
  - _Requirements: 5.7_

## Phase 7: Testing and Polish

- [x] 35. Test Note CRUD Operations
  - Test creating note with all fields
  - Test creating note with only title (minimal)
  - Test updating note content with auto-save
  - Test deleting note with confirmation
  - Verify optimistic updates work correctly
  - Verify rollback on error
  - Verify toast notifications appear
  - _Requirements: 1.1, 1.6, 1.7, 1.8, 3.1, 9.4, 11.2, 11.3, 11.4, 11.5_

- [x] 36. Test Rich Text Editing
  - Test bold, italic, underline formatting
  - Test headings (H1, H2, H3)
  - Test bullet and numbered lists
  - Test code blocks
  - Test markdown shortcuts (# , ## , ### , - , 1. , ``` )
  - Test undo/redo
  - Verify content saves as Lexical JSON
  - Verify content renders correctly in view mode
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

- [x] 37. Test Auto-save Functionality
  - Type in editor and wait 1 second
  - Verify "Saving..." indicator appears
  - Verify "Saved" indicator appears after save
  - Verify content is saved to database
  - Test rapid typing (debounce should prevent excessive saves)
  - Test error handling (network failure)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 38. Test View Modes
  - Toggle between grid and list views
  - Verify grid shows cards with previews
  - Verify list shows compact rows
  - Test with 100+ notes (virtualization should work smoothly)
  - Verify view mode persists across sessions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 39. Test Folder Organization
  - Create folders with different colors
  - Assign notes to folders
  - Click folder to filter notes
  - Verify note counts are accurate
  - Edit folder name and color
  - Delete folder (verify notes move to root)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 5.8_

- [x] 40. Test Pin and Favorite Features
  - Pin a note (verify it moves to top)
  - Unpin a note (verify it resorts)
  - Mark note as favorite
  - Verify sorting: pinned first, favorites second, rest by date
  - Test filter buttons (All, Pinned, Favorites)
  - Verify visual indicators display correctly
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 8.1, 8.2, 8.3, 8.4_

- [x] 41. Test Search Functionality
  - Type in search field
  - Verify results update after 300ms debounce
  - Test search matches: title, content, category, tags
  - Test case-insensitive matching
  - Test clear button (X icon)
  - Test Ctrl+K shortcut (focus search)
  - Test Escape shortcut (clear search)
  - Verify "No results" message when appropriate
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 42. Test URL State Synchronization
  - Select a folder (verify URL updates with short ID)
  - Open a note (verify URL updates with short ID)
  - Copy URL and open in new tab (verify state restores)
  - Use browser back/forward buttons (verify navigation works)
  - Test with invalid short IDs (should handle gracefully)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [x] 43. Test Halloween Mode Integration
  - Enable Halloween mode
  - Verify teal accent color applies throughout
  - Verify folder colors are overridden with teal
  - Verify decorations appear (witch, pumpkin, skull)
  - Verify empty states show Halloween illustrations
  - Disable Halloween mode (verify revert to normal)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 44. Test Responsive Design
  - Test on mobile devices (320px - 480px)
  - Verify sidebar collapses and shows overlay
  - Verify "Show Folders" button appears on mobile
  - Verify search and filters work on mobile
  - Test on tablets (768px - 1024px)
  - Test on desktop (1280px+)
  - Verify grid columns adjust based on screen size
  - _Requirements: All UI requirements_

- [x] 45. Test Accessibility
  - Test keyboard navigation through all elements
  - Test screen reader announces note titles and actions
  - Verify focus indicators are visible
  - Test color contrast meets WCAG AA standards
  - Test form labels are associated with inputs
  - Test modal focus trapping
  - _Requirements: All UI requirements_

- [x] 46. Test Performance with Large Datasets
  - Create 100+ notes
  - Verify virtualization works (smooth scrolling)
  - Verify search results appear quickly (< 200ms)
  - Verify auto-save doesn't cause lag
  - Test switching between views (should be instant)
  - _Requirements: 4.6_

- [x] 47. Final Code Review and Cleanup
  - Remove console.log statements
  - Ensure consistent code formatting with Biome
  - Check for unused imports and variables
  - Verify all error messages are user-friendly
  - Add comments for complex logic (Lexical setup, debouncing)
  - Verify all components have proper TypeScript types
  - _Requirements: All_
