# RAG Search System - Design

## Overview

This design document outlines the RAG (Retrieval-Augmented Generation) Search System for Integral. The system provides semantic search capabilities across the user's personal knowledge base (notes, journal entries, tasks) using vector embeddings and AI-generated responses. The design leverages Google Gemini for both embedding generation and response synthesis, with Supabase pgvector for efficient similarity search. The architecture prioritizes graceful error handling, seamless integration with existing content flows, and a delightful themed experience.

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Actions                             │
│  Create Note │ Create Journal │ Create Task │ Search Query      │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Content Creation Hooks                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   useNotes   │  │ useJournal   │  │   useTasks   │         │
│  │              │  │              │  │              │         │
│  │ • createNote │  │ • createEntry│  │ • createTask │         │
│  │ • updateNote │  │ • updateEntry│  │ • updateTask │         │
│  │ • deleteNote │  │ • deleteEntry│  │ • deleteTask │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    useSpookyAI Hook                        │ │
│  │  • addToGrimoire(content, metadata) → boolean              │ │
│  │  • askTheGrimoire(query, isHalloweenMode) → string | null  │ │
│  │  • removeFromGrimoire(contentType, originalId) → boolean   │ │
│  │  • completion: string (streaming state)                    │ │
│  │  • isSearching: boolean (loading state)                    │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Embedding Generation Layer                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  generateEmbedding(text: string): Promise<number[] | null> │ │
│  │  • Validates API key exists                                │ │
│  │  • Calls Gemini gemini-embedding-001 model                 │ │
│  │  • Returns 3072-dimensional vector or null on error        │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────┬─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Google Gemini API                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Embedding Model: gemini-embedding-001                     │ │
│  │  • Input: text string (max 2048 tokens)                    │ │
│  │  • Output: 3072-dimensional float vector                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Generation Model: gemini-2.0-flash                        │ │
│  │  • Input: system prompt + context + user query             │ │
│  │  • Output: streaming text response                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────┬─────────────────────────────────────────────────────────┘
        │
        ▼
```

┌─────────────────────────────────────────────────────────────────┐
│ Supabase Database │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ search_index table (with pgvector extension) │ │
│ │ • id (UUID, PK) │ │
│ │ • user_id (UUID, FK to auth.users) │ │
│ │ • content (TEXT) - original text for display │ │
│ │ • metadata (JSONB) - type, original_id, title, etc. │ │
│ │ • embedding (VECTOR(3072)) - Gemini embedding │ │
│ │ • created_at (TIMESTAMPTZ) │ │
│ │ • RLS: WHERE user_id = auth.uid() │ │
│ └────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ match_documents RPC Function │ │
│ │ • Input: query_embedding, match_threshold, match_count │ │
│ │ • Uses cosine similarity: 1 - (embedding <=> query) │ │
│ │ • Returns: id, content, metadata, similarity │ │
│ │ • Ordered by similarity DESC │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

```

**Design Rationale**: This layered architecture separates concerns cleanly. Content creation hooks handle their domain logic and delegate indexing to useSpookyAI. The embedding layer abstracts Gemini API interactions. Supabase handles storage and similarity search with RLS security. This separation allows each layer to fail independently without cascading errors.

### Component Hierarchy

```

App
├── FloatingWidgetContext (provides search modal state)
│ └── Keyboard Event Listener (Ctrl+K / Cmd+K)
├── Layout
│ └── GrimoireSearch Modal (conditional)
│ ├── Search Input (auto-focus)
│ ├── Loading Indicator (conditional)
│ └── Response Display (streaming markdown)
├── Notes Page
│ └── CreateNoteModal
│ └── onSubmit → addToGrimoire()
├── Journal Page
│ └── JournalEntryCreationModal
│ └── onSubmit → addToGrimoire()
└── Tasks Page
└── TaskCreationModal
└── onSubmit → addToGrimoire()

````

**Design Rationale**: The search modal is rendered at the Layout level to be accessible from any page. The FloatingWidgetContext manages global state for the modal, enabling the keyboard shortcut to work universally. Content creation modals integrate indexing as a side effect of successful creation.

## Components and Interfaces

### 1. Embedding Generation (`src/lib/gemini.ts`)

The core utility function for generating vector embeddings from text content.

**Function Signature**:

```typescript
export const generateEmbedding = async (
  text: string
): Promise<number[] | null>;
````

**Implementation Details**:

```typescript
export const generateEmbedding = async (
  text: string
): Promise<number[] | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Requirement 6.1, 6.2: Handle missing API key
  if (!apiKey) {
    console.error("Gemini API key is not configured");
    return null;
  }

  try {
    const ai = new GoogleGenAI(apiKey);

    const result = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    // Requirement 6.5, 6.6: Handle empty/missing embeddings
    if (!result.embeddings || result.embeddings.length === 0) {
      console.error("No embedding values in response");
      return null;
    }

    // Requirement 6.4: Extract embedding values
    return result.embeddings[0].values;
  } catch (error) {
    // Requirement 6.3: Log error and return null
    console.error("Error generating embedding:", error);
    return null;
  }
};
```

**Design Rationale**: The function returns `null` on any error rather than throwing, allowing callers to handle failures gracefully. The API key check prevents unnecessary network requests when misconfigured. Using gemini-embedding-001 provides 3072-dimensional vectors optimized for semantic similarity.

### 2. RAG Hook (`src/hooks/useSpookyAI.ts`)

The main hook providing RAG functionality with themed naming for Halloween mode.

**Interface**:

```typescript
interface UseSpookyAIReturn {
  // Existing AI features (budget insights, etc.)
  consultSpirits: (
    text: string,
    isHalloweenMode?: boolean
  ) => Promise<string | null>;
  isGhostWriting: boolean;
  completion: string;

  // RAG Search features
  addToGrimoire: (
    content: string,
    metadata: GrimoireMetadata
  ) => Promise<boolean>;
  askTheGrimoire: (
    query: string,
    isHalloweenMode?: boolean
  ) => Promise<string | null>;
  removeFromGrimoire: (
    contentType: string,
    originalId: string
  ) => Promise<boolean>;
  isSearching: boolean;
}

interface GrimoireMetadata {
  type: "note" | "journal" | "task";
  original_id: string;
  title?: string;
  category?: string;
  tags?: string[];
  date?: string;
  priority?: "low" | "medium" | "high";
  status?: string;
  due_date?: string;
  project?: string;
}
```

#### addToGrimoire Implementation

```typescript
const addToGrimoire = async (
  content: string,
  metadata: GrimoireMetadata
): Promise<boolean> => {
  if (!user) {
    console.error("User not authenticated for indexing");
    return false;
  }

  try {
    // Generate embedding for content
    const embedding = await generateEmbedding(content);

    // Requirement 1.7, 1.8: Silent failure if embedding fails
    if (!embedding) {
      console.warn("Failed to generate embedding, skipping indexing");
      return false;
    }

    // Insert into search_index
    const { error } = await supabase.from("search_index").insert({
      user_id: user.id,
      content: content,
      metadata: metadata as Json,
      embedding: JSON.stringify(embedding),
    });

    if (error) {
      console.error("Failed to index content:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in addToGrimoire:", error);
    return false;
  }
};
```

**Design Rationale**: The function returns a boolean for success/failure rather than throwing, enabling callers to ignore failures without try/catch. The embedding is stored as a JSON string and converted to vector type by PostgreSQL. Metadata is stored as JSONB for flexible querying.

#### askTheGrimoire Implementation

```typescript
const askTheGrimoire = async (
  query: string,
  isHalloweenMode: boolean = false
): Promise<string | null> => {
  if (!user) {
    toast.error("Please sign in to search");
    return null;
  }

  setIsSearching(true);
  setCompletion("");

  try {
    // Requirement 2.1: Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    if (!queryEmbedding) {
      toast.error("Failed to process your query");
      return null;
    }

    // Requirement 2.2, 2.3, 2.4: Call match_documents RPC
    const { data: matches, error } = await supabase.rpc("match_documents", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.5,
      match_count: 5,
    });

    if (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
      return null;
    }

    // Requirement 3.1: Build context from matches
    const context =
      matches && matches.length > 0
        ? matches.map((doc: MatchedDocument) => doc.content).join("\n\n")
        : "";

    // Requirement 3.4, 3.5: Build themed prompt
    const systemPrompt = isHalloweenMode
      ? `You are a mystical keeper of the Grimoire, an ancient repository of knowledge. 
         Answer questions based ONLY on the following context from the user's personal archives.
         If the context doesn't contain relevant information, say the spirits have no knowledge of this matter.
         Speak with an air of mystery and ancient wisdom.`
      : `You are a helpful assistant that answers questions based on the user's personal knowledge base.
         Answer questions based ONLY on the following context from the user's notes, journal, and tasks.
         If the context doesn't contain relevant information, politely indicate that you couldn't find relevant information.`;

    const userPrompt = context
      ? `Context from ${isHalloweenMode ? "the Grimoire" : "your knowledge base"}:\n\n${context}\n\nQuestion: ${query}`
      : `No relevant context found. Question: ${query}`;

    // Requirement 3.6, 3.7: Stream response
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContentStream([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      setCompletion(fullResponse); // Requirement 3.7: Update state incrementally
    }

    return fullResponse;
  } catch (error) {
    console.error("Error in askTheGrimoire:", error);
    toast.error("Failed to get response. Please try again.");
    return null;
  } finally {
    setIsSearching(false);
  }
};
```

**Design Rationale**: The function uses streaming to provide immediate feedback as the AI generates its response. The themed prompts create a delightful Halloween experience while maintaining functionality. Context is built by joining matched documents with double newlines for clear separation.

#### removeFromGrimoire Implementation

```typescript
const removeFromGrimoire = async (
  contentType: string,
  originalId: string
): Promise<boolean> => {
  if (!user) {
    console.warn("User not authenticated for removal");
    return false;
  }

  try {
    // Requirement 5.4: Match by user_id, type, and original_id
    const { error } = await supabase
      .from("search_index")
      .delete()
      .eq("user_id", user.id)
      .contains("metadata", { type: contentType, original_id: originalId });

    if (error) {
      // Requirement 5.5: Log error and return false
      console.error("Failed to remove from index:", error);
      return false;
    }

    return true;
  } catch (error) {
    // Requirement 5.5: Don't throw, just return false
    console.error("Error in removeFromGrimoire:", error);
    return false;
  }
};
```

**Design Rationale**: The function uses JSONB containment query (`contains`) to match metadata fields. This allows flexible matching without requiring exact metadata structure. Silent failure ensures parent delete operations aren't blocked by indexing issues.

### 3. Search Modal Context (`src/contexts/FloatingWidgetContext.tsx`)

Extended context to manage search modal state alongside existing floating widget state.

**Interface Extension**:

```typescript
interface FloatingWidgetContextType {
  // Existing floating timer widget state
  isWidgetVisible: boolean;
  setWidgetVisible: (visible: boolean) => void;
  toggleWidget: () => void;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;

  // Search modal state (new)
  isSearchModalOpen: boolean;
  setSearchModalOpen: (visible: boolean) => void;
  toggleSearchModal: () => void;
}
```

**Keyboard Shortcut Implementation**:

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Requirement 4.1, 4.2: Ctrl+K (Windows/Linux) or Cmd+K (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      // Requirement 4.7: Prevent browser default
      event.preventDefault();
      // Requirement 4.3: Toggle modal state
      setSearchModalOpen((prev) => !prev);
    }

    // Requirement 4.5: Escape to close
    if (event.key === "Escape" && isSearchModalOpen) {
      setSearchModalOpen(false);
    }
  };

  // Requirement 4.6: Global listener
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isSearchModalOpen]);
```

**Design Rationale**: Extending the existing FloatingWidgetContext keeps related global UI state together. The keyboard listener is attached to `window` to work from any page. Using `metaKey` handles Mac's Cmd key while `ctrlKey` handles Windows/Linux.

### 4. Search Modal Component (`src/components/GrimoireSearch.tsx`)

The search interface component with themed styling and streaming response display.

**Props Interface**:

```typescript
interface GrimoireSearchProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Component Structure**:

```typescript
const GrimoireSearch: React.FC<GrimoireSearchProps> = ({ isOpen, onClose }) => {
  const { isHalloweenMode } = useTheme();
  const { askTheGrimoire, completion, isSearching } = useSpookyAI();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Requirement 4.4: Auto-focus on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await askTheGrimoire(query, isHalloweenMode);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Requirement 7.3, 7.5: Themed title */}
      <h2 className={cn(
        "text-xl font-semibold",
        isHalloweenMode ? "text-[#60c9b6]" : "text-white"
      )}>
        {isHalloweenMode ? "Grimoire Search" : "Knowledge Search"}
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Requirement 7.2, 7.4: Themed placeholder
          placeholder={
            isHalloweenMode
              ? "Ask the Grimoire..."
              : "Search your knowledge base..."
          }
          className={cn(
            "w-full bg-white/5 border rounded-lg px-4 py-3",
            isHalloweenMode
              ? "border-[#60c9b6]/30 focus:border-[#60c9b6]"
              : "border-white/10 focus:border-purple-500"
          )}
        />
      </form>

      {/* Requirement 7.7: Loading indicator */}
      {isSearching && (
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{isHalloweenMode ? "Consulting the spirits..." : "Searching..."}</span>
        </div>
      )}

      {/* Requirement 7.8: Streaming response with markdown */}
      {completion && (
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{completion}</ReactMarkdown>
        </div>
      )}
    </Modal>
  );
};
```

**Design Rationale**: The component uses the existing Modal primitive for consistent styling. ReactMarkdown renders the AI response with proper formatting. The themed colors and text create a cohesive Halloween experience while remaining functional in normal mode.

## Data Models

### Database Schema

#### search_index Table

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create search_index table
CREATE TABLE search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  embedding VECTOR(3072),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user queries (RLS performance)
CREATE INDEX idx_search_index_user_id ON search_index(user_id);

-- Index for vector similarity search
CREATE INDEX idx_search_index_embedding ON search_index
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Row Level Security
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search index entries"
  ON search_index FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search index entries"
  ON search_index FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own search index entries"
  ON search_index FOR DELETE
  USING (auth.uid() = user_id);
```

#### match_documents RPC Function

```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(3072),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    search_index.id,
    search_index.content,
    search_index.metadata,
    1 - (search_index.embedding <=> query_embedding) AS similarity
  FROM search_index
  WHERE
    search_index.user_id = auth.uid()
    AND 1 - (search_index.embedding <=> query_embedding) > match_threshold
  ORDER BY search_index.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Design Rationale**: The `<=>` operator computes cosine distance (0 = identical, 2 = opposite). We convert to similarity (1 - distance) for intuitive ordering. The IVFFlat index enables fast approximate nearest neighbor search. SECURITY DEFINER ensures RLS is enforced within the function.

### TypeScript Interfaces

```typescript
// Search index entry from database
interface SearchIndexEntry {
  id: string;
  user_id: string;
  content: string;
  metadata: GrimoireMetadata;
  embedding: string | null; // Stored as JSON string, converted to vector
  created_at: string;
}

// Metadata stored with each indexed item
interface GrimoireMetadata {
  type: "note" | "journal" | "task";
  original_id: string;
  title?: string;
  // Note-specific
  category?: string;
  tags?: string[];
  // Journal-specific
  date?: string;
  // Task-specific
  priority?: "low" | "medium" | "high";
  status?: string;
  due_date?: string;
  project?: string;
}

// Document returned from match_documents RPC
interface MatchedDocument {
  id: string;
  content: string;
  metadata: GrimoireMetadata;
  similarity: number;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Content Indexing Completeness

_For any_ content type (note, journal, task) and valid content string, calling `addToGrimoire` with that content should result in a search index entry containing the content and metadata with the correct type field.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9**

**Design Rationale**: This ensures all content types are indexed consistently with proper metadata for later retrieval and filtering.

### Property 2: Embedding Failure Graceful Degradation

_For any_ content creation operation, if embedding generation fails, the `addToGrimoire` function should return false without throwing an exception, allowing the parent operation to complete successfully.

**Validates: Requirements 1.7, 1.8**

**Design Rationale**: Content creation should never fail due to search indexing issues. Users should be able to create notes even if the AI service is unavailable.

### Property 3: Query Embedding Generation

_For any_ non-empty search query string, calling `askTheGrimoire` should invoke `generateEmbedding` with that exact query string before performing the similarity search.

**Validates: Requirements 2.1**

**Design Rationale**: The query must be embedded using the same model as the indexed content for meaningful similarity comparison.

### Property 4: Results Ordering by Similarity

_For any_ set of matched documents returned by `match_documents`, the documents should be ordered by similarity score in descending order (highest similarity first).

**Validates: Requirements 2.5**

**Design Rationale**: Users expect the most relevant results first. Consistent ordering enables predictable behavior.

### Property 5: Context Concatenation

_For any_ non-empty array of matched documents, the context string passed to the AI prompt should contain the content of each document, joined with double newlines.

**Validates: Requirements 3.1**

**Design Rationale**: Double newlines provide clear visual separation between documents in the context, helping the AI distinguish between different sources.

### Property 6: Halloween Mode Theming

_For any_ search query when `isHalloweenMode` is true, the AI prompt should contain the themed terms "Grimoire" and "spirits".

**Validates: Requirements 3.4**

**Design Rationale**: Themed prompts create a delightful, immersive experience during Halloween mode.

### Property 7: Response Streaming Updates

_For any_ successful AI response generation, the `completion` state should be updated incrementally as chunks arrive, with each update containing all previously received text plus the new chunk.

**Validates: Requirements 3.6, 3.7**

**Design Rationale**: Streaming provides immediate feedback and perceived performance improvement. Accumulating chunks ensures the full response is always visible.

### Property 8: Keyboard Shortcut Toggle

_For any_ initial state of `isSearchModalOpen`, pressing Ctrl+K (or Cmd+K) should toggle the state to its opposite value.

**Validates: Requirements 4.1, 4.2, 4.3**

**Design Rationale**: Toggle behavior is intuitive—the same shortcut opens and closes the modal.

### Property 9: Content Removal Matching

_For any_ valid content type and original_id, calling `removeFromGrimoire` should delete all search index entries where the metadata contains both the matching type and original_id.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

**Design Rationale**: Precise matching ensures only the intended entry is removed, preventing accidental deletion of other indexed content.

### Property 10: Removal Error Handling

_For any_ removal operation that encounters a database error, `removeFromGrimoire` should catch the exception, log the error, and return false without re-throwing.

**Validates: Requirements 5.5, 5.6**

**Design Rationale**: Parent delete operations should succeed even if index cleanup fails. The orphaned index entry will be harmless.

### Property 11: API Error Handling

_For any_ Gemini API call that throws an exception, `generateEmbedding` should catch the error, log it, and return null.

**Validates: Requirements 6.3**

**Design Rationale**: Network errors, rate limits, and API issues should not crash the application.

### Property 12: Embedding Extraction

_For any_ valid Gemini API response containing embeddings, `generateEmbedding` should return the values array from the first embedding.

**Validates: Requirements 6.4**

**Design Rationale**: The API returns embeddings in an array; we need the first (and typically only) embedding's values.

### Property 13: Missing API Key Handling

_For any_ call to `generateEmbedding` when the Gemini API key environment variable is missing or empty, the function should log an error and return null without attempting an API call.

**Validates: Requirements 6.1, 6.2**

**Design Rationale**: Early return prevents unnecessary network requests and provides clear error logging for debugging.

### Property 14: Empty Embedding Response Handling

_For any_ Gemini API response that contains no embeddings (empty array or missing embeddings field), `generateEmbedding` should return null.

**Validates: Requirements 6.5, 6.6**

**Design Rationale**: Malformed responses should be handled gracefully rather than causing runtime errors.

### Property 15: Search Input Auto-Focus

_For any_ transition of `isSearchModalOpen` from false to true, the search input field should receive focus.

**Validates: Requirements 4.4**

**Design Rationale**: Auto-focus enables immediate typing without requiring a click, improving keyboard-driven workflows.

## Error Handling

### Error Categories and Strategies

| Error Scenario                         | Handling Strategy                             | User Impact                                 |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------- |
| Missing Gemini API key                 | Log error, return null from generateEmbedding | Content creation succeeds, indexing skipped |
| Gemini API error (network, rate limit) | Catch exception, log error, return null       | Content creation succeeds, indexing skipped |
| Empty embedding response               | Return null                                   | Content creation succeeds, indexing skipped |
| Supabase insert error                  | Log error, return false from addToGrimoire    | Content creation succeeds, indexing skipped |
| Supabase RPC error                     | Log error, show toast, return null            | Search fails with user-friendly message     |
| User not authenticated                 | Log warning, return false/null                | Operation skipped silently                  |
| No matching documents                  | Return empty context, AI indicates no info    | User sees "no relevant information" message |
| Streaming error                        | Catch exception, show toast                   | Partial response may be visible             |

**Design Rationale**: The error handling strategy prioritizes user experience. Content creation should never fail due to search indexing issues. Search failures show user-friendly messages. All errors are logged for debugging.

## Testing Strategy

### Unit Testing

Unit tests will verify specific behaviors:

- `generateEmbedding` returns null when API key is missing
- `generateEmbedding` returns null when API throws error
- `generateEmbedding` returns null when response has no embeddings
- `generateEmbedding` returns values array on success
- `addToGrimoire` returns false when user not authenticated
- `addToGrimoire` returns false when embedding generation fails
- `addToGrimoire` returns true on successful indexing
- `askTheGrimoire` generates embedding for query
- `askTheGrimoire` builds correct themed prompts
- `askTheGrimoire` concatenates context correctly
- `removeFromGrimoire` returns false on database error
- Keyboard shortcut toggles modal state
- Search input receives focus on modal open

### Property-Based Testing

Property-based tests will verify universal properties:

- **Property Testing Library**: fast-check (JavaScript/TypeScript PBT library)
- **Minimum iterations**: 100 runs per property test
- **Test annotation format**: `**Feature: 10-rag-search-system, Property {number}: {property_text}**`

Each correctness property will be implemented as a property-based test:

1. **Content Indexing**: Generate random content strings and metadata types, verify index entries contain correct data
2. **Graceful Degradation**: Mock embedding failures, verify no exceptions thrown and false returned
3. **Query Embedding**: Generate random queries, verify generateEmbedding called with exact string
4. **Results Ordering**: Generate random similarity scores, verify descending order
5. **Context Concatenation**: Generate random document arrays, verify joined with double newlines
6. **Halloween Theming**: Test with isHalloweenMode true/false, verify prompt contains themed terms
7. **Streaming Updates**: Mock streaming responses, verify completion state accumulates chunks
8. **Keyboard Toggle**: Generate random initial states, verify toggle behavior
9. **Content Removal**: Generate random type/id combinations, verify deletion criteria
10. **Removal Error Handling**: Mock database errors, verify false return without throw
11. **API Error Handling**: Mock API exceptions, verify null return
12. **Embedding Extraction**: Generate mock API responses, verify values extraction
13. **Missing API Key**: Test with undefined/empty API key, verify null return without API call
14. **Empty Embedding Response**: Generate mock responses with empty/missing embeddings, verify null return
15. **Search Input Focus**: Test modal open transition, verify input receives focus

### Integration Testing

- End-to-end flow: Create note → Verify indexed → Search → Retrieve
- End-to-end flow: Create journal entry → Verify indexed → Search → Retrieve
- End-to-end flow: Create task → Verify indexed → Search → Retrieve
- Delete content → Verify removed from index
- Update content → Verify index updated
- Verify RLS policies enforce user isolation (user A cannot search user B's content)
- Test real Gemini API integration (with test API key in CI)
- Test keyboard shortcut from different pages
- Test streaming response display

**Design Rationale**: Unit tests catch specific bugs, property tests verify general correctness across many inputs, integration tests ensure all pieces work together. The combination provides comprehensive coverage.

## Performance Considerations

### Embedding Generation

**Problem**: Embedding generation adds latency to content creation

**Solution**: Fire-and-forget pattern with silent failure

```typescript
// In content creation flow
const note = await createNote(noteData);
// Don't await - let indexing happen in background
addToGrimoire(note.content, { type: "note", original_id: note.id });
```

**Design Rationale**: Users shouldn't wait for indexing to complete. The async operation runs in the background, and failures are logged but don't block the user.

### Vector Search Performance

**Problem**: Similarity search on large datasets can be slow

**Solution**: IVFFlat index with appropriate list count

```sql
CREATE INDEX idx_search_index_embedding ON search_index
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Design Rationale**: IVFFlat provides approximate nearest neighbor search with configurable accuracy/speed tradeoff. 100 lists is appropriate for datasets up to ~100k vectors.

### Streaming Response

**Problem**: Waiting for full AI response feels slow

**Solution**: Stream response chunks to UI

```typescript
for await (const chunk of result.stream) {
  fullResponse += chunk.text();
  setCompletion(fullResponse);
}
```

**Design Rationale**: Streaming provides immediate feedback. Users see the response building in real-time, dramatically improving perceived performance.

### Query Caching

**Problem**: Repeated identical queries waste API calls

**Solution**: Consider implementing query result caching (future enhancement)

**Design Rationale**: For MVP, we skip caching to keep implementation simple. Future versions could cache recent query results with short TTL.

## Accessibility

### Keyboard Navigation

- Ctrl+K / Cmd+K opens search modal from anywhere
- Escape closes the modal
- Tab navigates through modal elements
- Enter submits the search query

### Screen Reader Support

- Modal has appropriate ARIA labels
- Loading state is announced
- Response content is in a live region for updates

### Visual Accessibility

- Sufficient color contrast in both themes
- Focus indicators on interactive elements
- Loading spinner has text alternative

**Design Rationale**: The search modal should be fully accessible via keyboard, which aligns with the power-user workflow of using Ctrl+K.

## Theme Integration

### Normal Mode

- Purple accent color (#8B5CF6)
- Standard placeholder: "Search your knowledge base..."
- Standard title: "Knowledge Search"
- Standard loading: "Searching..."

### Halloween Mode

- Teal accent color (#60c9b6)
- Themed placeholder: "Ask the Grimoire..."
- Themed title: "Grimoire Search"
- Themed loading: "Consulting the spirits..."
- Themed AI persona: mystical keeper of ancient knowledge

**Design Rationale**: Theme integration creates a cohesive experience. The Halloween theme adds delight while maintaining full functionality.

## Future Enhancements

1. **Incremental Indexing**: Index content updates rather than full re-index
2. **Batch Indexing**: Index multiple items in a single API call
3. **Query Suggestions**: Show recent/popular queries
4. **Result Highlighting**: Highlight matching terms in results
5. **Filter by Type**: Allow filtering search to specific content types
6. **Semantic Chunking**: Split long content into semantic chunks for better retrieval
7. **Hybrid Search**: Combine vector search with keyword search for better recall
8. **Index Status UI**: Show users what content is indexed

**Design Rationale**: These enhancements are deferred to keep the MVP focused. They can be added incrementally based on user feedback.
