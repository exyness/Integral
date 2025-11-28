# RAG Search System - Implementation Tasks

## Phase 1: Database Schema and RPC Functions

- [x] 1. Create pgvector Extension Migration
  - Created `supabase/migrations/20251128103000_add_vector_search.sql` file
  - Added `CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;`
  - Extension enabled in Supabase project
  - _Requirements: 1.1, 1.9_

- [x] 2. Create search_index Table
  - Created search_index table in migration file
  - Defined columns: id (UUID PK), user_id (UUID NOT NULL), content (TEXT), metadata (JSONB), embedding (VECTOR), created_at (TIMESTAMPTZ)
  - Initially used VECTOR(768), updated to VECTOR(3072) for gemini-embedding-001 in second migration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9_

- [x] 3. Add Row Level Security Policies
  - Enabled RLS: ALTER TABLE search_index ENABLE ROW LEVEL SECURITY
  - Created INSERT policy: "Users can insert their own documents" WITH CHECK auth.uid() = user_id
  - Created SELECT policy: "Users can view their own documents" USING auth.uid() = user_id
  - Created UPDATE policy: "Users can update their own documents" USING auth.uid() = user_id
  - Created DELETE policy: "Users can delete their own documents" USING auth.uid() = user_id
  - _Requirements: 2.7, 5.4_

- [x] 4. Create match_documents RPC Function
  - Created function with parameters: query_embedding VECTOR(3072), match_threshold FLOAT, match_count INT
  - Returns TABLE with columns: id UUID, content TEXT, metadata JSONB, similarity FLOAT
  - Implemented cosine similarity: 1 - (embedding <=> query_embedding) AS similarity
  - Added auth.uid() = user_id filter for RLS
  - Filters by similarity > match_threshold
  - Orders by embedding <=> query_embedding (ascending = closest first)
  - Limits by match_count
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.7_

- [x] 5. Apply Database Migration
  - Applied initial migration `20251128103000_add_vector_search.sql`
  - Applied dimension fix migration `20251128110700_update_vector_dimensions.sql`
  - Verified search_index table exists
  - Verified match_documents function exists
  - _Requirements: 1.1, 2.2_

## Phase 2: Embedding Generation Utility

- [x] 6. Implement generateEmbedding Function
  - Implemented in `src/lib/gemini.ts`
  - Function signature: async (text: string): Promise<number[] | null>
  - Gets API key from import.meta.env.VITE_GEMINI_API_KEY
  - Checks if API key exists, logs error and returns null if missing
  - Uses GoogleGenAI with gemini-embedding-001 model
  - Calls ai.models.embedContent({ model: "gemini-embedding-001", contents: text })
  - Checks if response.embeddings exists and has length > 0
  - Returns response.embeddings[0].values or null
  - Wrapped in try/catch, logs errors and returns null on exception
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 7. Test generateEmbedding Function
  - Tested with valid text input
  - Tested error handling for missing API key
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

## Phase 3: RAG Hook Implementation

- [x] 8. Add RAG State to useSpookyAI Hook
  - Updated `src/hooks/useSpookyAI.ts`
  - Uses existing isGhostWriting state for loading
  - Uses existing completion state for streaming responses
  - Imported generateEmbedding from "@/lib/gemini"
  - Imported supabase client from "@/integrations/supabase/client"
  - Imported Json type from supabase types
  - _Requirements: 3.6, 3.7_

- [x] 9. Implement addToGrimoire Function
  - Implemented in useSpookyAI hook
  - Function signature: async (content: string, metadata: Json = {}): Promise<boolean>
  - Gets current user via supabase.auth.getUser()
  - Calls generateEmbedding(content) to get embedding vector
  - If embedding is null, throws error (caught by try/catch)
  - Inserts into search_index table with: content, metadata, embedding, user_id
  - Returns true on success
  - Catches errors, logs them, returns false (silent failure)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 10. Implement askTheGrimoire Function
  - Implemented in useSpookyAI hook
  - Function signature: async (query: string, isHalloweenMode: boolean = false): Promise<string | null>
  - Sets isGhostWriting to true and completion to empty string
  - Calls generateEmbedding(query) to get query embedding
  - If embedding is null, shows themed toast error and returns null
  - Calls supabase.rpc("match_documents", { query_embedding, match_threshold: 0.5, match_count: 5 })
  - Builds context by joining matched document contents with "\n\n"
  - Builds themed prompt based on isHalloweenMode (Grimoire keeper vs AI assistant)
  - Uses GoogleGenAI with gemini-flash-lite-latest model
  - Streams response via ai.models.generateContentStream
  - Accumulates chunks and updates completion state
  - Returns full response string
  - Sets isGhostWriting to false in finally block
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 11. Implement removeFromGrimoire Function
  - Implemented in useSpookyAI hook
  - Function signature: async (contentType: string, originalId: string): Promise<boolean>
  - Gets current user via supabase.auth.getUser()
  - If no user, returns false
  - Calls supabase.from("search_index").delete().eq("user_id", user.id).contains("metadata", { type: contentType, original_id: originalId })
  - Returns true on success
  - Catches errors, logs them, returns false
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 12. Export RAG Functions from Hook
  - Added addToGrimoire, askTheGrimoire, removeFromGrimoire to return object
  - Exports isGhostWriting and completion for UI state
  - _Requirements: 1.1, 2.1, 5.1_

## Phase 4: Search Modal Context

- [x] 13. Extend FloatingWidgetContext with Search Modal State
  - Updated `src/contexts/FloatingWidgetContext.tsx`
  - Added isSearchModalOpen state: const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  - Added setSearchModalOpen function
  - Added toggleSearchModal function
  - Updated FloatingWidgetContextType interface with new properties
  - Added to context value object
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 14. Implement Keyboard Shortcut Handler
  - Added useEffect with keyboard event listener in FloatingWidgetContext
  - Created handleKeyDown function that checks for (e.metaKey || e.ctrlKey) && e.key === "k"
  - Calls e.preventDefault() to prevent browser default
  - Calls setIsSearchModalOpen(prev => !prev) to toggle
  - Added window.addEventListener("keydown", handleKeyDown)
  - Returns cleanup function: window.removeEventListener("keydown", handleKeyDown)
  - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7_

## Phase 5: Search Component

- [x] 15. Create GrimoireSearch Component
  - Created `src/components/GrimoireSearch.tsx`
  - Imported React, useState from "react"
  - Imported AnimatePresence, motion from "framer-motion"
  - Imported GlassCard, Button, Input, ScrollArea components
  - Imported useSpookyAI hook
  - Imported useTheme from ThemeContext
  - Imported icons: Brain, Ghost, RefreshCw, Search, Sparkles
  - _Requirements: 7.1, 7.6, 7.7, 7.8_

- [x] 16. Implement GrimoireSearch Component Structure
  - Component is a standalone GlassCard (not modal-based)
  - Gets isDark, isHalloweenMode from useTheme()
  - Gets askTheGrimoire, addToGrimoire, isGhostWriting, completion from useSpookyAI()
  - Added query state for search input
  - Added hasSearched state to track if search was performed
  - Added isBackfilling state for bulk indexing
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 17. Implement Search Form and Submit Handler
  - Created handleSearch async function
  - Calls e.preventDefault()
  - Returns early if query.trim() is empty
  - Sets hasSearched to true
  - Calls await askTheGrimoire(query, isHalloweenMode)
  - Renders form with onSubmit={handleSearch}
  - Renders Input with value={query}, onChange handler
  - Themed placeholder: "Ask the spirits about your past..." or "Search your journal entries..."
  - Styled with theme-aware colors (purple for Halloween, blue for normal)
  - _Requirements: 2.1, 7.2, 7.4_

- [x] 18. Implement Backfill Feature
  - Created handleBackfill async function
  - Fetches all daily_entries from Supabase
  - Loops through entries and calls addToGrimoire for each
  - Shows progress toasts with themed messages
  - Includes RefreshCw button with spin animation during backfill
  - _Requirements: (bonus feature for existing content)_

- [x] 19. Implement Response Display
  - Uses AnimatePresence for smooth transitions
  - Shows response area when hasSearched && (completion || isGhostWriting)
  - Uses motion.div with opacity and height animations
  - Displays completion text with whitespace-pre-wrap
  - Shows themed loading text while isGhostWriting
  - Uses ScrollArea for long responses (h-[200px])
  - Applies theme-aware styling (purple/blue based on mode)
  - _Requirements: 3.6, 3.7, 7.7, 7.8_

## Phase 6: Content Creation Integration

- [x] 20. Integrate RAG Indexing into Notes Creation
  - Updated `src/pages/Notes.tsx`
  - Imported useSpookyAI hook
  - Gets addToGrimoire from useSpookyAI()
  - In handleCreateNote, after successful note creation:
  - Calls addToGrimoire with content: `${noteData.title}\n\n${noteData.content}`
  - Metadata includes: type: "note", category, tags
  - Uses await (not fire-and-forget)
  - _Requirements: 1.1, 1.2, 1.7, 1.8_

- [x] 21. Integrate RAG Indexing into Journal Entry Creation
  - Updated `src/pages/Journal.tsx`
  - Imported useSpookyAI hook
  - Gets addToGrimoire from useSpookyAI()
  - In handleCreateEntry, after successful entry creation:
  - Calls addToGrimoire with content: `${entryData.title}\n\n${entryData.content}`
  - Metadata includes: type: "journal", date: new Date().toISOString(), title
  - Uses await
  - Added addToGrimoire to useCallback dependency array
  - _Requirements: 1.3, 1.4, 1.7, 1.8_

- [x] 22. Integrate RAG Indexing into Task Creation
  - Updated `src/pages/Tasks.tsx`
  - Imported useSpookyAI hook
  - Gets addToGrimoire from useSpookyAI()
  - In handleCreateTask, after successful task creation:
  - Combines title and description: taskData.description ? `${taskData.title}\n\n${taskData.description}` : taskData.title
  - Metadata includes: type: "task", priority, status: "pending", due_date, project
  - Uses await
  - Added addToGrimoire to useCallback dependency array
  - _Requirements: 1.5, 1.6, 1.7, 1.8_

## Phase 7: Update Supabase Types

- [x] 23. Regenerate TypeScript Types
  - Types regenerated in `src/integrations/supabase/types.ts`
  - search_index table types included with: id, content, metadata, embedding, user_id, created_at
  - match_documents RPC function types included with Args and Returns
  - _Requirements: 1.1, 2.2_

## Phase 8: Testing and Verification

- [x] 24. Test Database Schema
  - Verified search_index table exists
  - Verified pgvector extension is enabled
  - Verified RLS policies are active
  - Tested match_documents RPC
  - _Requirements: 1.1, 2.2, 2.3, 2.4, 2.5_

- [x] 25. Test Embedding Generation
  - Tested generateEmbedding with valid text
  - Tested error handling for missing API key
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 26. Test Content Indexing
  - Tested note creation indexing
  - Tested journal entry creation indexing
  - Tested task creation indexing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9_

- [x] 27. Test Search Functionality
  - Tested search with matching content
  - Tested themed responses in Halloween mode
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3_

- [x] 28. Test Keyboard Shortcuts
  - Tested Ctrl+K toggles isSearchModalOpen state
  - Tested from multiple pages
  - Note: Modal not yet integrated into Layout
  - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7_

- [x] 29. Test Halloween Mode Theming
  - Tested themed title "The Grimoire" vs "Second Brain"
  - Tested themed placeholder text
  - Tested themed loading text
  - Tested themed AI responses
  - _Requirements: 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 30. Test Streaming Response
  - Tested response appearing incrementally
  - Tested loading indicator during generation
  - _Requirements: 3.6, 3.7, 3.8, 7.7, 7.8_

- [x] 31. Test Error Handling
  - Tested silent failure on indexing errors
  - Tested user-friendly error messages on search failure
  - _Requirements: 1.7, 1.8, 6.1, 6.2, 6.3_

- [x] 32. Test RLS Security
  - Verified users can only access their own indexed content
  - _Requirements: 2.7_

## Phase 9: Final Code Review

- [x] 33. Code Review and Cleanup
  - Reviewed all RAG-related code
  - Ensured consistent error handling
  - Code formatted with Biome
  - _Requirements: All_
