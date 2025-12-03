# Design Document

## Overview

The Floating AI Chat Widget system provides persistent AI assistance through a conversational interface accessible across all authenticated pages in Integral. The system supports comprehensive productivity and financial management commands through natural language processing and structured command shortcuts (@task, @note, @transaction, etc.). The architecture implements multi-step conversational flows for complex actions, intelligent widget positioning coordination with the timer widget, and theme-aware styling across Halloween, dark, and light modes. The design prioritizes user experience through smooth animations, markdown-formatted responses, and contextual help documentation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Layout Component                      │
│  ┌────────────────┐  ┌──────────────────────────────────┐  │
│  │    Navbar      │  │   FloatingAIChatWidget           │  │
│  └────────────────┘  │   - Collapsed Button (z: 50)     │  │
│  ┌────────────────┐  │   - Expanded Chat (z: 9999)      │  │
│  │  Page Content  │  │   - Mobile: Full Screen          │  │
│  │                │  │   - Desktop: 350x414px           │  │
│  │                │  └──────────────────────────────────┘  │
│  │                │  ┌──────────────────────────────────┐  │
│  │                │  │   FloatingTimerWidget            │  │
│  │                │  │   - Shifts right when chat open  │  │
│  └────────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ FloatingWidgetContext │
                  │  - isWidgetVisible    │
                  │  - isSearchModalOpen  │
                  │  - isAIChatOpen       │
                  │  - setAIChatOpen      │
                  └───────────────────────┘
```

### Component Hierarchy

```
App
└── FloatingWidgetProvider
    └── Layout
        ├── Navbar
        ├── Page Content
        ├── FloatingAIChatWidget
        │   ├── Collapsed Button (z-index: 50)
        │   └── Expanded Chat (z-index: 9999)
        │       ├── Header (title, info, clear, close buttons)
        │       ├── Messages Area (scrollable, auto-scroll)
        │       │   ├── Empty State (typewriter animation)
        │       │   ├── User Messages (right-aligned)
        │       │   ├── AI Messages (left-aligned, markdown)
        │       │   ├── Success Messages (green)
        │       │   └── Loading State (shimmer)
        │       ├── Mentions Dropdown (keyboard nav)
        │       └── Input Area (dynamic placeholder)
        └── FloatingTimerWidget (position: dynamic based on isAIChatOpen)
```

### Data Flow

1. **Widget State Management**: FloatingWidgetContext maintains `isAIChatOpen` state, accessible via useFloatingWidget hook
2. **Position Coordination**: Timer widget reads `isAIChatOpen` and shifts right when chat opens (72px mobile, 84px desktop)
3. **Message Processing**: User input → useAIAssistant → Intent detection → Action execution → Response display
4. **Pending Actions**: Multi-step flows collect missing fields sequentially before executing actions
5. **Command Shortcuts**: "@" character triggers mentions dropdown with 12 available commands
6. **Content Creation**: All AI-created content tagged with "integral-assistant" and organized in "Integral Assistant" folders
7. **Theme Coordination**: useTheme hook provides isHalloweenMode and isDark for styling decisions

## Components and Interfaces

### FloatingAIChatWidget Component

**Location**: `src/components/ai/FloatingAIChatWidget.tsx`

**Purpose**: Provides persistent AI chat interface with comprehensive command support for productivity and financial management

**Props**: None (uses context for state management)

**State**:

```typescript
interface Message {
  id: string;
  role: "user" | "ai" | "success";
  content: string;
  timestamp: Date;
}

interface PendingAction {
  intent: string;
  params: Record<string, unknown>;
  missingFields: string[];
}

// Component State
const [inputValue, setInputValue] = useState("");
const [messages, setMessages] = useState<Message[]>([]);
const [typewriterText, setTypewriterText] = useState("");
const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
const [showMentions, setShowMentions] = useState(false);
const [mentionFilter, setMentionFilter] = useState("");
const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
const [showHelpModal, setShowHelpModal] = useState(false);

// Refs
const messagesEndRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);
const mentionRefs = useRef<(HTMLButtonElement | null)[]>([]);
```

**Key Methods**:

- `handleSendMessage()`: Processes user input, handles pending actions, executes AI commands, displays responses
- `handleInputChange()`: Manages input value and mentions dropdown visibility/filtering
- `handleMentionSelect()`: Inserts selected command into input and focuses input field
- `handleKeyDown()`: Handles keyboard navigation (Arrow Up/Down, Enter, Escape) for mentions and message sending
- `handleClearChat()`: Clears all messages and pending actions, returns to empty state
- `getPlaceholder()`: Returns dynamic placeholder based on current route using location.pathname

**Supported Commands** (12 total):

**Productivity (3)**:

- `@task`: Create tasks with 7-day default due date, "Integral Assistant" project, "integral-assistant" label
- `@note`: Create notes in "Integral Assistant" folder (purple #8B5CF6), first line as title (max 50 chars)
- `@journal`: Create journal entries with mood 3, current date, "integral-assistant" tag

**Finance (8)**:

- `@transaction`: Track expenses/income, use first budget or null, add "integral-assistant" tag
- `@budget`: Create budgets with calculated start/end dates (weekly: +7d, monthly: +1m, yearly: +1y)
- `@category`: Add expense/income categories, active by default, purple color
- `@recurring`: Set up recurring transactions (daily/weekly/monthly/yearly), active, start_date = today
- `@finance`: Create financial accounts with type-based icons (FaPiggyBank, FaCreditCard, etc.)
- `@transfer`: Transfer funds with normalized name matching, balance validation, atomic updates
- `@goal`: Create goals or contribute to existing goals, calculate progress percentage
- `@liability`: Track loans/debts with types (loan, credit_card, mortgage, other), red color, 30-day default due

**Account Manager (1)**:

- `@account`: Save credentials securely (password NOT sent to AI), "Integral Assistant" folder, usage_type: custom

**Action Execution Flow**:

1. User sends message (added to messages array as "user" role)
2. Check if pending action exists:
   - If yes: collect next missing field, update params, prompt for next field or execute when complete
   - If no: process query using `useAIAssistant` hook
3. AI returns intent and params
4. Check for missing required fields:
   - If missing: enter pending action state, prompt for first missing field
   - If complete: execute action immediately
5. Execute action based on intent (create task, note, transaction, etc.)
6. Display success message in chat (role: "success") and toast notification
7. Clear pending action state
8. Auto-scroll to bottom of messages

**Styling**:

**Collapsed Button**:

- Position: `bottom-3 right-3` (mobile) or `bottom-4 right-4` (desktop)
- Size: 48x48px (mobile) or 56x56px (desktop)
- Z-index: 50
- Border-radius: rounded-xl
- Theme colors: Halloween teal (#60c9b6), dark purple, light white
- assistant.svg icon with theme-aware color filtering
- Sparkles indicator in top-right corner

**Expanded Chat**:

- Position: Fixed
- Mobile: Full screen (inset-x-2 top-12 bottom-2) with backdrop blur overlay (z-index: 9998)
- Desktop: 350px width, 414px height at `bottom-20 right-4`
- Z-index: 9999
- Glass morphism with GlassCard component
- Border: 2px in Halloween mode (teal), standard in other modes
- Halloween decorations: witch brew (bottom-left), hanging spider (top-right) at 20% opacity
- Smooth animations: opacity, scale, and y-axis transitions

### AIHelpModal Component

**Location**: `src/components/ai/AIHelpModal.tsx`

**Purpose**: Displays comprehensive help documentation for AI assistant commands

**Props**:

```typescript
interface AIHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Content Sections**:

1. **Productivity Commands** (MessageSquare icon):
   - @task: Create tasks with smart due dates
   - @note: Save notes with auto-organization
   - @journal: Add journal entries with follow-ups

2. **Finance Commands** (Tag icon):
   - @transaction: Track expenses or income
   - @finance: Create bank/savings/credit accounts
   - @budget: Set spending budgets
   - @recurring: Set up recurring payments
   - @category: Add expense/income categories
   - @transfer: Transfer funds between accounts
   - @goal: Create or contribute to savings goals
   - @liability / @debt: Track loans and debts

3. **Account Manager** (Lock icon):
   - @account / @credential: Save login credentials securely

4. **Natural Language** (6 example phrases):
   - "Remind me to call mom tomorrow"
   - "I spent 25 on lunch today"
   - "Transfer 1000 from savings to checking"
   - "Add 5000 to vacation goal"
   - "Track car loan 500000 at 8% interest"
   - "Set 500 budget for groceries monthly"

5. **Features** (6 capabilities with icons):
   - MessageSquare: Conversational follow-ups for detailed entries
   - FolderOpen: Auto-organizes into "Integral Assistant" folders
   - Tag: Tags everything with "integral-assistant"
   - Lock: Secure password handling (never sent to AI)
   - Calendar: Smart date parsing (tomorrow, next week, etc.)
   - Sparkles: Default 7-day due dates for tasks

**Styling**:

- Uses Modal component with "lg" size
- Responsive spacing: space-y-3 (mobile), space-y-6 (desktop)
- Responsive text: text-xs/sm (mobile), text-sm/lg (desktop)
- Theme-aware colors: Halloween teal (#60c9b6), dark purple, light gray
- Command display: code-style with background, border, and example text
- Icon colors match theme (teal/purple/purple)

### FloatingTimerWidget Component (Updated)

**Location**: `src/components/FloatingTimerWidget.tsx`

**Changes**:

- Reads `isAIChatOpen` from FloatingWidgetContext using `useFloatingWidget()` hook
- Dynamically adjusts position based on AI chat state for both collapsed button and expanded widget
- Adds CSS transition for smooth position changes

**Position Logic**:

```typescript
const { isAIChatOpen } = useFloatingWidget();

// Applied to both collapsed button and expanded widget
className={`fixed bottom-3 z-50 ... ${
  isAIChatOpen ? "right-[72px] md:right-[84px]" : "right-3 md:right-4"
}`}

style={{
  transition: "right 0.3s ease-in-out",
}}
```

**Behavior**:

- When AI chat closed: Timer at right-3 (mobile) or right-4 (desktop)
- When AI chat open: Timer shifts to right-[72px] (mobile) or right-[84px] (desktop)
- Smooth 0.3s ease-in-out transition prevents jarring repositioning

### FloatingWidgetContext (Updated)

**Location**: `src/contexts/FloatingWidgetContext.tsx`

**Interface**:

```typescript
interface FloatingWidgetContextType {
  isWidgetVisible: boolean;
  setWidgetVisible: (visible: boolean) => void;
  isSearchModalOpen: boolean;
  setSearchModalOpen: (visible: boolean) => void;
  toggleSearchModal: () => void;
  isAIChatOpen: boolean;
  setAIChatOpen: (visible: boolean) => void;
}
```

**State Management**:

- `isWidgetVisible`: Timer widget visibility
- `isSearchModalOpen`: Search modal visibility
- `isAIChatOpen`: AI chat widget visibility

**Keyboard Shortcuts**:

- Cmd+K / Ctrl+K: Toggle search modal

### Modal Component (Updated)

**Location**: `src/components/ui/Modal.tsx`

**Changes**:

- Z-index increased to 10000 (from 50)
- Top padding increased to 48px (from 16px)

**Purpose**: Ensures modals appear above floating widgets

### parseNaturalDate Utility

**Location**: `src/lib/dateUtils.ts`

**Signature**:

```typescript
export const parseNaturalDate = (
  dateStr: string | null | undefined
): string | null
```

**Supported Formats**:

- ISO format: "2024-12-05" → "2024-12-05"
- Tomorrow: "tomorrow" → next day's date
- Next week: "next week" → 7 days from today
- Relative days: "in 3 days" → 3 days from today
- Relative weeks: "in 2 weeks" → 14 days from today
- Relative months: "in 1 month" → 1 month from today
- Month + day: "december 5", "dec 5" → appropriate year

**Algorithm**:

1. Return null for null/undefined/empty input
2. Check if already in ISO format (YYYY-MM-DD)
3. Match against "tomorrow" keyword
4. Match against "next week" keyword
5. Match against "in X days/weeks/months" pattern
6. Match against "month day" pattern (with year logic)
7. Fallback to native Date parsing
8. Return null if all parsing fails

**Year Logic for Month+Day**:

- If parsed date < today: use next year
- Otherwise: use current year

### useTaskFiltering Hook (Updated)

**Location**: `src/hooks/tasks/useTaskFiltering.ts`

**Changes**:

- Added date-based filter logic for "today", "tomorrow", "next7days"
- Normalizes dates to midnight for accurate comparison
- Excludes tasks without due_date for date-based filters

**Filter Logic**:

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

if (filter === "today") {
  const taskDate = new Date(task.due_date);
  taskDate.setHours(0, 0, 0, 0);
  matchesFilter = taskDate.getTime() === today.getTime();
}
```

### useBudgetsQuery Hook (Updated)

**Location**: `src/hooks/queries/useBudgetsQuery.ts`

**Optimizations**:

**Create Transaction**:

```typescript
if (newTransaction.account_id || newTransaction.to_account_id) {
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.ACCOUNTS, user?.id],
  });
}
```

**Update Transaction**:

```typescript
if (updates.account_id !== undefined || updates.to_account_id !== undefined) {
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.ACCOUNTS, user?.id],
  });
}
```

**Delete Transaction**:

```typescript
if (budgetId || amount) {
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.ACCOUNTS, user?.id],
  });
}
```

### useTasks Hook (Updated)

**Location**: `src/hooks/tasks/useTasks.ts`

**Changes**:

- Added `isDeleting` state derived from `deleteTaskMutation.isPending`

**Return Value**:

```typescript
return {
  tasks,
  loading,
  isCreating,
  isDeleting: deleteTaskMutation.isPending,
  createTask,
  updateTask,
  deleteTask,
  // ... other methods
};
```

## Data Models

### FilterType (Updated)

**Location**: `src/constants/taskConstants.ts`

```typescript
export type FilterType =
  | "all"
  | "completed"
  | "pending"
  | "today"
  | "tomorrow"
  | "next7days";
```

### FloatingWidgetContext State

```typescript
{
  isWidgetVisible: boolean; // Timer widget
  isSearchModalOpen: boolean; // Search modal
  isAIChatOpen: boolean; // AI chat widget
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Widget Position Coordination

_For any_ state where the AI chat widget is open, the timer widget position should be shifted right by 72px (mobile) or 84px (desktop) to prevent overlap.

**Validates: Requirements 2.2, 2.3**

### Property 2: Natural Language Date Parsing Consistency

_For any_ valid natural language date string, parsing it twice should produce the same ISO date result (idempotent).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

### Property 3: Date Filter Exclusivity

_For any_ task without a due_date, applying a date-based filter ("today", "tomorrow", "next7days") should exclude that task from results.

**Validates: Requirements 4.7**

### Property 4: Account Query Invalidation Precision

_For any_ transaction operation, the accounts query should be invalidated if and only if the operation affects account_id or to_account_id fields.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

### Property 5: Modal Z-Index Hierarchy

_For any_ open modal, its z-index (10000) should be greater than all floating widget z-indexes (9999), ensuring modals always appear on top.

**Validates: Requirements 6.1, 6.4**

### Property 6: Date Normalization Consistency

_For any_ two dates representing the same calendar day, normalizing both to midnight should produce equal timestamps.

**Validates: Requirements 4.9**

### Property 7: Parse Natural Date Null Safety

_For any_ null, undefined, or empty string input, parseNaturalDate should return null without throwing an error.

**Validates: Requirements 11.1, 11.2, 11.3**

### Property 8: Relative Date Calculation

_For any_ relative date string "in X days", the parsed date should be exactly X days after today at midnight.

**Validates: Requirements 3.3**

### Property 9: Month-Day Year Selection

_For any_ month-day combination that has already occurred this year, the parsed date should use next year; otherwise, it should use the current year.

**Validates: Requirements 11.4, 11.5**

### Property 10: Widget State Synchronization

_For any_ change to isAIChatOpen in FloatingWidgetContext, all consuming components should receive the updated value immediately.

**Validates: Requirements 2.4, 2.6, 2.7**

### Property 11: Task Deletion State Tracking

_For any_ task deletion operation in progress, the isDeleting state should be true; when no deletion is in progress, it should be false.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 12: ISO Format Pass-Through

_For any_ string already in ISO format (YYYY-MM-DD), parseNaturalDate should return it unchanged.

**Validates: Requirements 3.7**

## Error Handling

### Natural Language Date Parsing Errors

**Strategy**: Return null for unparseable inputs, never throw exceptions

**Implementation**:

- Validate input is non-null and non-empty
- Try each parsing strategy in order
- Wrap native Date parsing in try-catch
- Return null as fallback

**User Experience**: UI should handle null gracefully, possibly showing validation message

### Widget Positioning Errors

**Strategy**: Provide sensible defaults if context is unavailable

**Implementation**:

- Default `isAIChatOpen` to false if context not available
- Use standard positioning as fallback
- Log warnings in development mode

### Query Invalidation Errors

**Strategy**: Silent failure with logging, don't block user operations

**Implementation**:

- Wrap invalidation calls in try-catch
- Log errors to console
- Allow transaction operations to complete successfully

### Modal Z-Index Conflicts

**Strategy**: Use high z-index values with clear hierarchy

**Implementation**:

- Base content: z-index 0-999
- Floating widgets: z-index 9999
- Modals: z-index 10000
- Document hierarchy in design docs

## Testing Strategy

### Unit Tests

**Natural Language Date Parsing**:

- Test each supported format individually
- Test edge cases (null, undefined, empty string)
- Test year rollover logic for month-day parsing
- Test case insensitivity
- Test invalid inputs return null

**Task Filtering**:

- Test each filter type with sample tasks
- Test date normalization logic
- Test tasks without due_date are excluded from date filters
- Test combination of filters

**Widget Position Calculation**:

- Test position classes for AI chat open/closed states
- Test responsive breakpoints (mobile vs desktop)

**Query Invalidation Logic**:

- Test conditional invalidation based on field presence
- Test all three operations (create, update, delete)

### Property-Based Tests

**Property 1: Widget Position Coordination**

- Generate random AI chat open/closed states
- Verify timer widget position matches expected offset
- **Validates: Requirements 2.2, 2.3**

**Property 2: Natural Language Date Parsing Consistency**

- Generate random valid date strings
- Parse twice and verify results are identical
- **Validates: Requirements 3.1-3.6**

**Property 3: Date Filter Exclusivity**

- Generate random tasks with and without due_dates
- Apply date filters and verify tasks without dates are excluded
- **Validates: Requirements 4.7**

**Property 4: Account Query Invalidation Precision**

- Generate random transaction operations
- Verify invalidation occurs if and only if account fields are affected
- **Validates: Requirements 5.1-5.6**

**Property 5: Modal Z-Index Hierarchy**

- Verify modal z-index > floating widget z-index
- **Validates: Requirements 6.1, 6.4**

**Property 6: Date Normalization Consistency**

- Generate random dates on the same calendar day
- Normalize and verify timestamps are equal
- **Validates: Requirements 4.9**

**Property 7: Parse Natural Date Null Safety**

- Generate null, undefined, empty, and whitespace inputs
- Verify all return null without errors
- **Validates: Requirements 11.1-11.3**

**Property 8: Relative Date Calculation**

- Generate random "in X days" strings
- Verify parsed date is exactly X days from today
- **Validates: Requirements 3.3**

**Property 9: Month-Day Year Selection**

- Generate random month-day combinations
- Verify year selection logic (current vs next year)
- **Validates: Requirements 11.4, 11.5**

**Property 10: Widget State Synchronization**

- Change isAIChatOpen state
- Verify all consuming components receive update
- **Validates: Requirements 2.4, 2.6, 2.7**

### Integration Tests

**Multi-Widget Coordination**:

- Open/close AI chat widget
- Verify timer widget repositions correctly
- Verify no visual overlap

**End-to-End Task Creation with Natural Dates**:

- Create task with "tomorrow" as due date
- Verify task appears in "Tomorrow" filter
- Verify due_date is correct ISO format

**Modal Over Widgets**:

- Open AI chat and timer widgets
- Open a modal
- Verify modal appears above both widgets
- Verify modal is fully interactive

**Account Query Optimization**:

- Create transaction with account_id
- Verify accounts query is invalidated
- Create transaction without account_id
- Verify accounts query is NOT invalidated

### Test Configuration

**Framework**: Vitest (existing project standard)

**Property-Based Testing Library**: fast-check

**Minimum Iterations**: 100 runs per property test

**Coverage Goals**:

- Unit tests: 90%+ coverage for new utilities
- Property tests: All 10 correctness properties implemented
- Integration tests: Critical user flows covered

## Performance Considerations

### Widget Rendering Optimization

- Use React.memo for FloatingAIChatWidget to prevent unnecessary re-renders
- Debounce position calculations if needed
- Use CSS transitions instead of JavaScript animations

### Query Invalidation Optimization

- Conditional invalidation reduces unnecessary network requests
- Accounts query only refetches when actually needed
- Maintains data consistency while improving performance

### Date Parsing Performance

- Early returns for common cases (ISO format, null)
- Regex matching is fast for pattern recognition
- Native Date parsing as last resort only

### Task Filtering Performance

- Date normalization happens once per filter application
- Memoize filtered results in useTaskFiltering hook
- Virtualized list rendering for large task sets

## Accessibility

### Keyboard Navigation

- AI chat widget accessible via Tab key
- Close button accessible via keyboard
- Cmd+K / Ctrl+K shortcut for search modal
- Escape key closes modals and widgets

### Screen Reader Support

- Proper ARIA labels for floating widgets
- Announce widget state changes
- Modal focus trap for accessibility
- Semantic HTML structure

### Visual Accessibility

- High contrast ratios for text
- Theme support (dark/light/Halloween)
- Clear visual hierarchy with z-index
- Smooth animations with reduced motion support

## Security Considerations

### Input Validation

- Sanitize natural language date inputs
- Validate parsed dates are reasonable (not too far in future/past)
- Prevent injection attacks in AI chat input

### Data Privacy

- AI chat messages stored locally or encrypted
- No sensitive data in widget state
- Respect user privacy settings

### Query Security

- Row-level security on all database queries
- User ID validation in query keys
- Prevent unauthorized account access

## Future Enhancements

### Widget System Expansion

- Support for additional floating widgets
- Drag-and-drop widget positioning
- User-configurable widget layout
- Widget docking/snapping system

### Natural Language Parsing

- Support for more date formats ("end of month", "next quarter")
- Time parsing ("3pm tomorrow")
- Recurring date patterns ("every monday")
- Localization for different languages

### AI Chat Features

- Voice input support
- Multi-turn conversations with context
- Task creation directly from chat
- Integration with other app features

### Performance Monitoring

- Track query invalidation frequency
- Monitor widget render performance
- Measure date parsing performance
- User interaction analytics
