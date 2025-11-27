# Notes System - Design

## Overview

This design document outlines the rich note-taking system for Integral, built on Facebook's Lexical editor framework. The system provides rich text editing with markdown shortcuts, folder-based organization, pinning and favorites functionality, instant search with debouncing, and multiple view modes (grid/list). The design prioritizes a smooth editing experience with auto-save, optimistic updates for instant feedback, URL state synchronization for deep linking, and seamless integration with the existing application architecture.

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Actions                             │
│  Type in Editor │ Create Note │ Update Note │ Delete Note       │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Lexical Editor Layer                          │
│  • Captures user input                                           │
│  • Applies formatting (bold, italic, headings, lists, code)     │
│  • Processes markdown shortcuts (# → H1, - → bullet, etc.)      │
│  • Generates Lexical JSON (EditorState)                         │
│  • Extracts plain text for search                               │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Debounce Layer (1 second)                     │
│  • Prevents excessive saves during typing                        │
│  • Triggers auto-save after 1s of inactivity                    │
│  • Shows "Saving..." indicator during save                       │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Custom Hooks Layer                          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │   useNotes   │  │  useFolders  │                            │
│  │              │  │              │                            │
│  │ • createNote │  │ • createFold │                            │
│  │ • updateNote │  │ • updateFold │                            │
│  │ • deleteNote │  │ • deleteFold │                            │
│  │ • increment  │  │              │                            │
│  └──────┬───────┘  └──────┬───────┘                            │
└─────────┼──────────────────┼─────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TanStack Query Layer                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Query Keys: ["notes", userId], ["folders", userId, type] │ │
│  │  • Fetches notes and folders from Supabase                 │ │
│  │  • Caches results (staleTime: 5min, gcTime: 10min)        │ │
│  │  • Provides loading, error, refetch states                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Mutations: createNote, updateNote, deleteNote             │ │
│  │  • Optimistic updates to cache before server response      │ │
│  │  • Rollback on error                                       │ │
│  │  • Toast notifications for success/failure                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Client                             │
│  • supabase.from("notes").select()                              │
│  • supabase.from("notes").insert()                              │
│  • supabase.from("notes").update()                              │
│  • supabase.from("notes").delete()                              │
│  • supabase.from("folders").select()                            │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  notes table                                               │ │
│  │  • id (UUID, PK)                                           │ │
│  │  • user_id (UUID, FK to auth.users)                       │ │
│  │  • folder_id (UUID, FK to folders, nullable)              │ │
│  │  • title (TEXT, NOT NULL)                                 │ │
│  │  • content (TEXT, NOT NULL) - plain text                  │ │
│  │  • rich_content (JSONB) - Lexical JSON                    │ │
│  │  • content_type (VARCHAR(10), DEFAULT 'plain')            │ │
│  │  • category (TEXT)                                         │ │
│  │  • tags (TEXT[])                                           │ │
│  │  • is_pinned (BOOLEAN, DEFAULT false)                     │ │
│  │  • is_favorite (BOOLEAN, DEFAULT false)                   │ │
│  │  • usage_count (INTEGER, DEFAULT 0)                       │ │
│  │  • created_at, updated_at (TIMESTAMPTZ)                   │ │
│  │  • RLS: WHERE user_id = auth.uid()                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  folders table                                             │ │
│  │  • id (UUID, PK)                                           │ │
│  │  • user_id (UUID, FK to auth.users)                       │ │
│  │  • name (TEXT, NOT NULL)                                   │ │
│  │  • type (TEXT, CHECK IN 'note'/'account')                 │ │
│  │  • parent_id (UUID, FK to folders, nullable)              │ │
│  │  • color (TEXT, DEFAULT '#8B5CF6')                        │ │
│  │  • created_at, updated_at (TIMESTAMPTZ)                   │ │
│  │  • RLS: WHERE user_id = auth.uid()                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Design Rationale**: This layered architecture separates concerns cleanly. Lexical handles rich text editing, debouncing prevents excessive saves, custom hooks encapsulate business logic, TanStack Query manages server state and caching, and Supabase handles database operations with RLS security. Optimistic updates provide instant feedback while maintaining data integrity through rollback on errors.

### Component Hierarchy

```
Notes Page
├── Mobile Sidebar Overlay (conditional)
├── FolderSidebar (collapsible on mobile)
│   ├── All Notes (with count)
│   ├── Folder List
│   │   └── Folder Items (with color, name, count)
│   └── Create Folder Button
├── Main Content Area
│   ├── Header (mobile only)
│   │   ├── Title
│   │   ├── Description
│   │   └── Action Buttons
│   ├── Search and Filters Bar
│   │   ├── Search Input (with Ctrl+K shortcut)
│   │   ├── View Mode Toggle (Grid/List)
│   │   └── New Dropdown (Note/Folder)
│   ├── Filter Buttons Row
│   │   ├── All Button
│   │   ├── Pinned Button
│   │   ├── Favorites Button
│   │   └── Results Count
│   └── Notes Display
│       ├── Grid View (Virtuoso Grid)
│       │   └── Note Cards (repeated)
│       └── List View (Virtuoso List)
│           └── Note Rows (repeated)

Modals (Global)
├── CreateNoteModal
│   ├── Title Input
│   ├── LexicalRichTextEditor
│   ├── Category Input
│   ├── Tags Input
│   └── Folder Selector
├── ViewNoteModal
│   ├── Note Header (title, timestamps)
│   ├── RichTextRenderer
│   ├── Category & Tags Display
│   └── Action Buttons (Edit, Delete, Pin, Favorite)
├── EditNoteModal
│   ├── Title Input
│   ├── LexicalRichTextEditor (with auto-save)
│   ├── Category Input
│   ├── Tags Input
│   └── Folder Selector
└── CreateFolderModal
    ├── Name Input
    └── Color Picker
```

**Design Rationale**: The component hierarchy follows a clear parent-child relationship with conditional rendering based on user selections and device size. Modals are rendered at the root level to avoid z-index issues. The sidebar is collapsible on mobile for better space utilization.

## Components and Interfaces

### Lexical Rich Text Editor

The core editing component built on Facebook's Lexical framework.

**Props Interface**:

```typescript
interface LexicalRichTextEditorProps {
  initialContent?: string; // Lexical JSON or plain text
  onChange: (content: string, plainText: string) => void;
  placeholder?: string;
  folderColor?: string; // For focus color and caret
  readOnly?: boolean;
  autoFocus?: boolean;
}
```

**Lexical Configuration**:

```typescript
{
  namespace: "RichTextEditor",
  theme: createEditorTheme(),         // Custom theme with CSS classes
  editorState: getInitialEditorState(), // Parse JSON or create from plain text
  editable: !readOnly,
  nodes: [
    HeadingNode,                      // H1-H6 support
    ListNode, ListItemNode,           // Bullet and numbered lists
    QuoteNode,                        // Block quotes
    CodeNode, CodeHighlightNode,      // Code blocks with syntax highlighting
    LinkNode, AutoLinkNode,           // Hyperlinks
    HashtagNode,                      // #hashtag support
    TableNode, TableCellNode, TableRowNode  // Tables
  ]
}
```

**Plugins Used**:

- **RichTextPlugin**: Core rich text functionality
- **HistoryPlugin**: Undo/redo support
- **ListPlugin**: Bullet and numbered lists
- **LinkPlugin**: Hyperlink support
- **CheckListPlugin**: Checkbox lists
- **HashtagPlugin**: Hashtag detection
- **TablePlugin**: Table support
- **MarkdownShortcutPlugin**: Markdown shortcuts (# → H1, - → bullet, etc.)
- **TabIndentationPlugin**: Tab key for indentation
- **OnChangePlugin**: Captures editor state changes

**OnChange Handler**:

```typescript
const handleChange = (editorState: EditorState) => {
  editorState.read(() => {
    const root = $getRoot();
    const rawPlainText = root.getTextContent();

    // Clean up zero-width spaces and non-breaking spaces
    const plainText = rawPlainText
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\u00A0/g, " ")
      .trim();

    const serializedState = JSON.stringify(editorState.toJSON());
    onChange(serializedState, plainText);
  });
};
```

**Design Rationale**: Lexical provides a robust, extensible editor framework. The plugin architecture allows adding features incrementally. Storing both plain text and rich content enables fast search while preserving formatting. The onChange handler extracts clean plain text for search indexing.

### Rich Text Renderer

Read-only component for displaying formatted content.

**Props Interface**:

```typescript
interface RichTextRendererProps {
  content: string; // Lexical JSON or plain text
  theme?: "light" | "dark";
  maxLines?: number; // For preview truncation
  className?: string;
}
```

**Features**:

- Parses Lexical JSON and renders formatted content
- Falls back to plain text if JSON parsing fails
- Supports line clamping for previews (WebKit-line-clamp)
- Adds copy buttons to code blocks automatically
- Uses same node types as editor for consistency

**Code Copy Button Plugin**:

```typescript
useEffect(() => {
  const addCopyButtons = () => {
    const codeBlocks = document.querySelectorAll(
      ".lexical-renderer .lexical-code"
    );

    codeBlocks.forEach((block) => {
      if (block.querySelector(".code-copy-button")) return;

      const button = document.createElement("button");
      // Style and position button
      button.addEventListener("click", async () => {
        const code = block.textContent || "";
        await navigator.clipboard.writeText(code);
        // Show "Copied!" feedback
      });

      block.appendChild(button);
    });
  };

  setTimeout(addCopyButtons, 100);
}, [isDark]);
```

**Design Rationale**: Separating the renderer from the editor keeps concerns clear. The renderer is lightweight and optimized for display. Code copy buttons enhance usability without cluttering the UI.

### useNotes Hook

Core hook for note CRUD operations with TanStack Query integration.

**Interface**:

```typescript
interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  createNote: (noteData: Partial<Note>) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  incrementUsage: (noteId: string) => void;
  refetch: () => Promise<void>;
}
```

**Query Configuration**:

```typescript
useQuery({
  queryKey: ["notes", user?.id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data.map((note) => ({
      ...note,
      category: note.category || undefined,
      folder_id: note.folder_id || undefined,
      tags: note.tags || [],
      usage_count: note.usage_count || 0,
      content_type: note.content_type || "plain",
      rich_content: note.rich_content || undefined,
      is_pinned: note.is_pinned || false,
      is_favorite: note.is_favorite || false,
    }));
  },
  enabled: !!user,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});
```

**Optimistic Updates**:

```typescript
createNoteMutation: useMutation({
  mutationFn: async (noteData) => {
    const { data, error } = await supabase
      .from("notes")
      .insert({ ...noteData, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  onMutate: async (noteData) => {
    await queryClient.cancelQueries({ queryKey: ["notes", user?.id] });

    const previousNotes = queryClient.getQueryData(["notes", user?.id]);

    const optimisticNote: Note = {
      id: `temp-${Date.now()}`,
      ...noteData,
      user_id: user!.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    queryClient.setQueryData(
      ["notes", user?.id],
      [optimisticNote, ...previousNotes]
    );

    return { previousNotes };
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    toast.success("Note created successfully");
  },
  onError: (error, variables, context) => {
    queryClient.setQueryData(["notes", user?.id], context.previousNotes);
    toast.error("Failed to create note");
  },
});
```

**Design Rationale**: The hook encapsulates all note operations, providing a clean API to components. Optimistic updates make the UI feel instant, while error handling ensures data integrity. Normalizing data on fetch prevents null/undefined issues.

### useFolders Hook

Manages folder operations with type filtering.

**Interface**:

```typescript
interface UseFoldersReturn {
  folders: Folder[];
  loading: boolean;
  createFolder: (name: string, color: string) => Promise<Folder>;
  updateFolder: (folderId: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  refetch: () => Promise<void>;
}
```

**Type Filtering**:

```typescript
useQuery({
  queryKey: ["folders", user?.id, type], // type: "note" | "account"
  queryFn: () => fetchFolders(user!.id, type),
  enabled: !!user,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});
```

**Design Rationale**: Folders are shared between notes and accounts features, so type filtering ensures each feature only sees its own folders. The hook provides async methods that return promises for better error handling.

## Data Models

### Note Interface

```typescript
interface Note {
  id: string; // UUID primary key
  user_id: string; // FK to auth.users
  folder_id?: string | null; // FK to folders (optional)
  title: string; // Required, non-empty
  content: string; // Plain text for search
  rich_content?: Json | null; // Lexical JSON
  content_type: "plain" | "rich"; // Content format
  category?: string | null; // Optional category
  tags: string[]; // Array of tag strings
  is_pinned: boolean; // Pin to top
  is_favorite: boolean; // Mark as favorite
  usage_count: number; // Track opens
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

### Folder Interface

```typescript
interface Folder {
  id: string; // UUID primary key
  user_id: string; // FK to auth.users
  name: string; // Required, non-empty
  type: "note" | "account"; // Folder type
  parent_id?: string; // FK to folders (for nesting)
  color: string; // Hex color code
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Note Creation Persistence

_For any_ valid note data with a non-empty title, creating a note should result in the note appearing in the note list and being stored in the database.

**Validates: Requirements 1.1, 1.6**

### Property 2: Auto-save Consistency

_For any_ content change in the Lexical editor, after 1 second of inactivity, the note should be saved with both plain text and rich content.

**Validates: Requirements 3.1, 3.2**

### Property 3: Markdown Shortcut Correctness

_For any_ markdown shortcut pattern (# , ## , ### , - , 1. , ``` ), typing the pattern should trigger the corresponding formatting.

**Validates: Requirements 2.6, 2.7, 2.8, 2.9, 2.10, 2.11**

### Property 4: Pin and Favorite Sorting

_For any_ note list, pinned notes should appear first, then favorite notes, then remaining notes sorted by updated date descending.

**Validates: Requirements 6.6**

### Property 5: Search Accuracy

_For any_ search query, the filtered notes should include only notes where the query matches title, content, category, or tags (case-insensitive).

**Validates: Requirements 7.2, 7.3**

### Property 6: Folder Filtering Correctness

_For any_ selected folder, the displayed notes should include only notes with folder_id matching the selected folder.

**Validates: Requirements 5.4**

### Property 7: URL State Synchronization

_For any_ folder or note selection, the URL should update with the corresponding short ID, and loading the URL should restore that selection.

**Validates: Requirements 12.1, 12.2, 12.3**

### Property 8: Optimistic Update Rollback

_For any_ failed mutation (create, update, delete), the optimistic UI update should rollback to the previous state.

**Validates: Requirements 11.5**

## Error Handling

### Error Categories

**Editor Errors**:

- Lexical initialization failure
- JSON parsing errors
- Invalid editor state

**Network Errors**:

- Connection timeout
- Server unavailable
- Rate limiting

**Validation Errors**:

- Empty note title
- Invalid folder ID
- Invalid content type

### Error Display Strategy

**Toast Notifications**: Used for operation feedback

```typescript
toast.success("Note created successfully");
toast.error("Failed to create note");
toast.success("Note pinned");
```

**Inline Errors**: Used in forms (if validation fails before submission)

**Graceful Degradation**: If Lexical JSON parsing fails, fall back to plain text display

**Design Rationale**: Toast notifications provide non-blocking feedback. Graceful degradation ensures content is never lost even if formatting is.

## Testing Strategy

### Unit Testing

- useNotes hook creates/updates/deletes notes correctly
- useFolders hook manages folders correctly
- Lexical editor initializes with content
- RichTextRenderer displays formatted content
- Search filtering matches correctly
- Pin/favorite sorting works correctly

### Property-Based Testing

- **Property Testing Library**: fast-check (JavaScript/TypeScript PBT library)
- **Minimum iterations**: 100 runs per property test
- **Test annotation format**: `**Feature: notes-page, Property {number}: {property_text}**`

### Integration Testing

- Complete note creation flow
- Auto-save triggers after typing
- Markdown shortcuts work
- Pin/favorite toggle updates list
- Folder filtering works
- Search returns correct results
- URL state synchronization works

**Design Rationale**: Unit tests catch specific bugs, property tests verify general correctness, integration tests ensure all pieces work together.

## Performance Considerations

### Virtualization

**Problem**: Rendering 100+ notes causes performance issues

**Solution**: React Virtuoso for virtualized scrolling

```typescript
<VirtuosoGrid
  data={filteredNotes}
  itemContent={(index, note) => (
    <NoteCard key={note.id} note={note} />
  )}
/>
```

### Debouncing

**Problem**: Saving on every keystroke is expensive

**Solution**: 300ms debounce for search, 1000ms for auto-save

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```

### Optimistic Updates

**Problem**: Network latency makes UI feel slow

**Solution**: Update UI immediately, sync with server in background

### Query Caching

**Problem**: Repeated fetches waste bandwidth

**Solution**: TanStack Query caching with 5-minute stale time

**Design Rationale**: These optimizations ensure smooth performance even with large note collections.

## Accessibility

- Keyboard shortcuts (Ctrl+K for search, Escape to clear)
- All buttons have descriptive labels
- Form inputs have associated labels
- Focus management in modals
- Screen reader support for editor toolbar

## Theme Integration

### Dark/Light Mode

- Theme-aware colors for editor, cards, and UI elements
- Folder colors respected in light/dark mode

### Halloween Mode

- Teal accent color (#60c9b6) replaces all folder colors
- Animated decorations (witch, pumpkin, skull)
- Halloween-themed empty states

**Design Rationale**: Theme support provides personalization. Halloween mode adds delight while maintaining usability.
