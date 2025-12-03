# Floating AI Chat Widget - Implementation Tasks

## Phase 1: Context and State Management

- [x] 1. Update FloatingWidgetContext with AI chat state management
  - Added `isAIChatOpen` boolean state to FloatingWidgetContext
  - Added `setAIChatOpen` setter function
  - Updated FloatingWidgetContextType interface
  - Exported updated context with new properties
  - _Requirements: 1.5, 2.4, 2.5, 9.3, 9.4_

## Phase 2: Widget Positioning Coordination

- [x] 2. Update FloatingTimerWidget for dynamic positioning
  - Read `isAIChatOpen` from FloatingWidgetContext
  - Implemented conditional position classes: `right-[72px] md:right-[84px]` when AI chat open, `right-3 md:right-4` when closed
  - Added CSS transition: `transition: right 0.3s ease-in-out`
  - Updated both collapsed button and expanded widget positioning
  - _Requirements: 2.1, 2.2, 2.3, 2.8_

## Phase 3: Core AI Chat Widget Component

- [x] 3. Create FloatingAIChatWidget component file
  - Created `src/components/ai/FloatingAIChatWidget.tsx`
  - Imported required dependencies: React hooks, Framer Motion, Lucide icons, TanStack Query
  - Imported all necessary hooks: useAuth, useTheme, useFloatingWidget, useAIAssistant, useTasks, useNotes, etc.
  - Set up component state for messages, input, pending actions, mentions
  - _Requirements: 1.1, 1.6_

- [x] 4. Implement collapsed button UI
  - Created floating button with assistant.svg icon
  - Added Sparkles icon indicator
  - Positioned at `bottom-3 right-3` (mobile) or `bottom-4 right-4` (desktop)
  - Applied theme-aware styling (Halloween teal, dark purple, light gray)
  - Added smooth scale animation on mount
  - Z-index set to 50
  - _Requirements: 1.2, 1.10, 12.8_

- [x] 5. Implement expanded chat interface structure
  - Created GlassCard container with full-screen mobile layout (inset-x-2 top-12 bottom-2)
  - Desktop layout: 350px width, 414px height at bottom-right
  - Z-index set to 9999
  - Added backdrop blur overlay for mobile (z-index 9998)
  - Applied glass morphism styling with theme-aware colors
  - Added Halloween decorations: witch brew (bottom-left), hanging spider (top-right) at 20% opacity
  - _Requirements: 1.3, 1.7, 1.8, 1.9, 12.1, 12.7_

- [x] 6. Create chat header component
  - Display assistant.svg icon with Sparkles indicator
  - Show "Integral Assistant" title with theme-aware colors
  - Display "Powered by Gemini" subtitle with ai.svg icon
  - Add info button (Info icon) to open help modal
  - Add clear chat button (RotateCcw icon)
  - Add close button (X icon) with red hover state
  - Apply responsive sizing (smaller on mobile)
  - _Requirements: 1.10, 21.1, 23.3, 23.4_

## Phase 4: Message System and Chat Interface

- [x] 7. Implement message state and rendering
  - Created Message interface with id, role (user|ai|success), content, timestamp
  - Implemented messages state array
  - Added auto-scroll to bottom on new messages using messagesEndRef
  - Rendered messages with role-based styling:
    - User: right-aligned, purple/teal background, rounded-tr-none
    - AI: left-aligned, dark background, rounded-tl-none
    - Success: green background with border
  - Applied theme-aware colors for all message types
  - _Requirements: 25.1, 25.2_

- [x] 8. Implement markdown rendering for AI messages
  - Integrated ReactMarkdown for AI and success messages
  - Configured prose styling with theme-aware colors
  - Supported elements: paragraphs, bold text, inline code
  - Halloween mode: teal colors for emphasis and code blocks
  - Removed default margins from first/last elements
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

- [x] 9. Implement loading state with shimmer animation
  - Display loading message when isProcessing is true
  - Used TextShimmer component for animated effect
  - Halloween mode: "The spirits are thinking..."
  - Normal mode: "Thinking..."
  - Applied theme-aware shimmer colors (teal/purple/purple)
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

- [x] 10. Create empty state with typewriter animation
  - Implemented typewriter effect cycling through: Tasks, Notes, Journal, Budget, Goals, Pomodoro
  - Started with random word selection
  - Type at 80ms intervals, delete at 30ms intervals
  - Pause for 40 frames when word complete
  - Display blinking cursor (|) after text
  - Show themed message: "Ask the spirits about your..." or "Ask me about your..."
  - Display 3 random example prompts as clickable buttons
  - _Requirements: 13.8, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7_

## Phase 5: Mentions and Command System

- [x] 11. Create mentions data structure
  - Defined 12 commands with key, label, and example:
    - @task, @note, @journal (Productivity)
    - @transaction, @budget, @category, @recurring, @finance, @transfer, @goal, @liability (Finance)
    - @account (Account Manager)
  - _Requirements: 13.2_

- [x] 12. Implement mentions dropdown UI
  - Trigger dropdown when "@" typed in input
  - Filter mentions based on text after "@"
  - Display command key, description, and example
  - Apply theme-aware styling with borders and backgrounds
  - Position above input field with max-height and scroll
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 13. Implement mentions keyboard navigation
  - Arrow Up/Down to navigate through filtered mentions
  - Auto-scroll selected item into view using refs
  - Enter key to select highlighted mention
  - Escape key to close dropdown
  - Highlight selected item with theme-aware colors
  - _Requirements: 13.4, 13.5, 13.6_

- [x] 14. Implement dynamic placeholder based on route
  - Created getPlaceholder() function with route detection
  - Tasks page: "@task Add project deadline..."
  - Notes page: "@note Save this idea..."
  - Journal page: "@journal Today I learned..."
  - Budget page: "@transaction Spent $50 on..."
  - Goals page: "@goal Save $5000 for..."
  - Accounts page: "@account Save login for..."
  - Default: "Type @ for commands or ask anything..."
  - _Requirements: 13.7_

## Phase 6: Pending Action System for Multi-Step Flows

- [x] 15. Create PendingAction interface and state
  - Defined interface with intent, params, missingFields
  - Added pendingAction state to track multi-step flows
  - Implemented sequential field collection logic
  - _Requirements: 14.1, 14.2_

- [x] 16. Implement context-specific prompts
  - create_account: prompt for platform, title, email, password with security message
  - create_recurring: prompt for description, amount, frequency, type
  - create_budget: prompt for name, amount, period
  - create_category: prompt for name, type (expense/income)
  - create_financial_account: prompt for name, type (with examples), balance
  - _Requirements: 14.5, 14.6, 14.7, 14.8_

- [x] 17. Implement field collection flow
  - Check if user response fills missing field
  - Update pendingAction.params with user input
  - Remove filled field from missingFields array
  - Prompt for next missing field if any remain
  - Execute action when all fields collected
  - Clear pendingAction after execution
  - _Requirements: 14.2, 14.3, 14.4_

## Phase 7: Task Creation Action (@task)

- [x] 18. Implement @task command processing
  - Process query through useAIAssistant hook
  - Extract title, description, priority, due_date from AI response
  - Default due_date to 7 days from today if not provided
  - Assign to "Integral Assistant" project
  - Add "integral-assistant" label
  - _Requirements: 15.1, 15.2, 15.3_

- [x] 19. Implement task creation with error handling
  - Call createTask with all parameters
  - Show success toast notification
  - Display success message in chat with task title and due date
  - Handle errors with error message in chat
  - _Requirements: 15.4, 15.5, 15.6_

## Phase 8: Note and Journal Actions (@note, @journal)

- [x] 20. Implement @note command processing
  - Extract content from AI response
  - Extract first line as title (max 50 characters)
  - Find or create "Integral Assistant" folder with purple color (#8B5CF6)
  - Add "integral-assistant" tag
  - Create note in folder using createNoteAsync
  - Show success toast and chat message
  - _Requirements: 16.1, 16.2, 16.3, 16.7_

- [x] 21. Implement @journal command processing
  - Extract content from AI response
  - Extract first line as title (max 50 characters)
  - Set mood to 3 (neutral) by default
  - Use current date as entry_date
  - Add "integral-assistant" tag
  - Create journal entry using addEntry
  - Show success toast and chat message
  - _Requirements: 16.4, 16.5, 16.6, 16.7_

## Phase 9: Financial Transaction Actions

- [x] 22. Implement @transaction command processing
  - Extract amount, description, type (expense/income), category from AI response
  - Use first available budget or null if none exists
  - Add "integral-assistant" tag
  - Create transaction with current date
  - Display type label and formatted amount in response
  - Show note if no budget assigned
  - _Requirements: 17.1, 17.2_

- [x] 23. Implement @budget command processing
  - Extract name, amount, period from AI response
  - Calculate start_date (today) and end_date based on period
  - Support periods: weekly (+7 days), monthly (+1 month), yearly (+1 year)
  - Use purple color (#8B5CF6)
  - Create budget with calculated dates
  - Show success toast and chat message with formatted amount
  - _Requirements: 17.3_

- [x] 24. Implement @category command processing
  - Extract name and type (expense/income) from AI response
  - Set as active by default
  - Use purple color (#8B5CF6) and "tag" icon
  - Set category_type to "user"
  - Create category
  - Show success toast and chat message
  - _Requirements: 17.4_

- [x] 25. Implement @recurring command processing
  - Extract description, amount, frequency, type from AI response
  - Support intervals: daily, weekly, monthly, yearly
  - Support types: expense, income
  - Set start_date and next_run_date to today
  - Set active to true
  - Create recurring transaction
  - Show success toast and chat message with formatted details
  - _Requirements: 17.6, 17.7_

- [x] 26. Implement @finance command processing (financial accounts)
  - Extract name, type, balance from AI response
  - Support types: cash, bank, credit_card, digital_wallet, investment, savings
  - Choose appropriate icon based on type:
    - savings: FaPiggyBank
    - credit_card: FaCreditCard
    - investment: FaChartLine
    - bank: FaUniversity
    - digital_wallet: FaMobileAlt
    - cash: FaMoneyBillWave
  - Use purple color (#8B5CF6)
  - Set include_in_total to true
  - Use user's currency setting
  - Create financial account
  - Show success toast and chat message with account type label
  - _Requirements: 17.5, 17.8_

## Phase 10: Advanced Financial Actions

- [x] 27. Implement @transfer command processing
  - Extract amount, from_account, to_account from AI response
  - Implement normalized account name matching (case-insensitive, remove "account"/"acct"/"acc")
  - Find source and destination accounts using partial matching
  - Validate sufficient balance in source account
  - Update both accounts atomically using Promise.all
  - Create transfer transaction record with both account IDs
  - Invalidate accounts query to force UI refresh
  - Display before/after balances for both accounts in chat
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 28. Implement @goal command processing
  - Support two modes: create goal and contribute to goal
  - Create goal: extract name, target_amount, current_amount, target_date
  - Default target_date to 1 year from today if not provided
  - Use green color (#10B981) and "Target" icon
  - Set is_active to true
  - Contribute to goal: find goal by case-insensitive partial name match
  - If from_account specified, find account and validate balance
  - Deduct amount from account if specified
  - Update goal's current_amount
  - Calculate and display progress percentage
  - Show before/after amounts in chat message
  - _Requirements: 18.6, 18.7, 18.8, 18.9_

- [x] 29. Implement @liability command processing
  - Extract name, type, amount, interest_rate, minimum_payment, due_date from AI response
  - Support types: loan, credit_card, mortgage, other
  - Default due_date to 30 days from today if not provided
  - Use red color (#EF4444) and "CreditCard" icon
  - Set is_active to true
  - Use user's currency setting
  - Support optional interest_rate and minimum_payment fields
  - Create liability
  - Show success toast and chat message with type label
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

## Phase 11: Secure Account Credential Storage

- [x] 30. Implement @account command processing (credentials)
  - DO NOT send password to AI (security requirement)
  - Enter pending action state immediately
  - Prompt for platform, title, email, password sequentially
  - Display security message in password prompt: "will be encrypted and stored securely"
  - Find or create "Integral Assistant" folder with purple color
  - Add "integral-assistant" tag
  - Set usage_type to "custom" and reset_period to "never"
  - Create account with encrypted password
  - Show success toast and chat message
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

## Phase 12: Help Modal Component

- [x] 31. Create AIHelpModal component file
  - Created `src/components/ai/AIHelpModal.tsx`
  - Imported Modal component, icons, theme context
  - Defined AIHelpModalProps interface with isOpen and onClose
  - _Requirements: 21.1_

- [x] 32. Implement Productivity Commands section
  - Display 3 commands: @task, @note, @journal
  - Show command syntax, description, and example for each
  - Use MessageSquare icon for section header
  - Apply theme-aware colors (teal/purple/gray)
  - Responsive text sizing (text-xs/sm on mobile, text-sm on desktop)
  - _Requirements: 21.2, 21.3, 21.7_

- [x] 33. Implement Finance Commands section
  - Display 8 commands: @transaction, @finance, @budget, @recurring, @category, @transfer, @goal, @liability
  - Show command syntax, description, and example for each
  - Use Tag icon for section header
  - Apply consistent styling with Productivity section
  - _Requirements: 21.2, 21.3, 21.7_

- [x] 34. Implement Account Manager section
  - Display 1 command: @account / @credential
  - Show command syntax, description, and example
  - Use Lock icon for section header
  - Apply consistent styling
  - _Requirements: 21.2, 21.3, 21.7_

- [x] 35. Implement Natural Language section
  - Display 6 example phrases showing command-free interaction:
    - "Remind me to call mom tomorrow"
    - "I spent 25 on lunch today"
    - "Transfer 1000 from savings to checking"
    - "Add 5000 to vacation goal"
    - "Track car loan 500000 at 8% interest"
    - "Set 500 budget for groceries monthly"
  - Style as code blocks with theme-aware colors
  - _Requirements: 21.4_

- [x] 36. Implement Features section
  - Display 6 capabilities with icons:
    - MessageSquare: Conversational follow-ups
    - FolderOpen: Auto-organizes into folders
    - Tag: Tags with "integral-assistant"
    - Lock: Secure password handling
    - Calendar: Smart date parsing
    - Sparkles: Default 7-day due dates
  - Apply theme-aware icon colors
  - _Requirements: 21.5_

- [x] 37. Apply responsive and theme-aware styling to modal
  - Use Modal component with "lg" size
  - Responsive spacing (space-y-3 on mobile, space-y-6 on desktop)
  - Responsive text sizing throughout
  - Halloween mode: teal colors (#60c9b6)
  - Dark mode: purple colors
  - Light mode: gray colors
  - _Requirements: 21.6, 21.7_

## Phase 13: Chat Utility Features

- [x] 38. Implement clear chat functionality
  - Created handleClearChat function
  - Clear all messages from state
  - Clear pending action state
  - Add clear button with RotateCcw icon in header
  - Apply theme-aware hover colors
  - _Requirements: 23.1, 23.2, 23.3, 23.4_

- [x] 39. Implement help modal integration
  - Add showHelpModal state
  - Add info button with Info icon in header
  - Wire up button to open AIHelpModal
  - Pass isOpen and onClose props to modal
  - _Requirements: 21.1_

- [x] 40. Implement message sending logic
  - Created handleSendMessage async function
  - Validate input is not empty
  - Add user message to messages array
  - Clear input field
  - Handle pending action responses (collect missing fields)
  - Process query through useAIAssistant if no pending action
  - Execute appropriate action based on intent
  - Add AI response to messages array
  - Handle errors with error messages
  - _Requirements: 13.1, 14.1, 14.2, 14.3, 14.4_

## Phase 14: Layout Integration

- [x] 41. Integrate FloatingAIChatWidget into Layout
  - Imported FloatingAIChatWidget in Layout component
  - Added widget after main content (after Navbar and page content)
  - Widget now appears on all authenticated pages
  - _Requirements: 1.6_

## Phase 15: Assistant SVG Icon

- [x] 42. Create assistant.svg icon
  - Created `public/assistant.svg` file
  - SVG with sparkles/stars design
  - Viewbox: -5.0 -10.0 110.0 135.0
  - Three star/sparkle paths with different sizes
  - Used in both collapsed button and expanded header
  - _Requirements: 1.2, 1.10_

## Phase 16: Testing and Verification

- [x] 43. Test widget open/close functionality
  - Verified collapsed button displays correctly
  - Verified clicking button opens chat interface
  - Verified close button closes chat
  - Verified state persists in FloatingWidgetContext
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 44. Test widget positioning coordination
  - Verified timer widget shifts right when AI chat opens
  - Verified timer widget returns to normal position when AI chat closes
  - Verified smooth transition animation (0.3s ease-in-out)
  - Verified no overlap between widgets
  - _Requirements: 2.1, 2.2, 2.3, 2.8_

- [x] 45. Test mentions dropdown functionality
  - Verified dropdown appears when typing "@"
  - Verified filtering works based on text after "@"
  - Verified keyboard navigation (Arrow Up/Down, Enter, Escape)
  - Verified click selection inserts command
  - Verified auto-scroll of selected item
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 46. Test task creation (@task)
  - Created task with natural language input
  - Verified default 7-day due date applied
  - Verified task assigned to "Integral Assistant" project
  - Verified "integral-assistant" label added
  - Verified success toast and chat message
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 47. Test note and journal creation (@note, @journal)
  - Created note through chat
  - Verified "Integral Assistant" folder created/used
  - Verified note saved with correct title and tags
  - Created journal entry through chat
  - Verified entry created with current date and mood 3
  - Verified success messages
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [x] 48. Test financial transaction actions
  - Created expense transaction (@transaction)
  - Verified transaction created with correct amount and type
  - Created budget (@budget)
  - Verified start/end dates calculated correctly
  - Created category (@category)
  - Verified category created as active
  - Created recurring transaction (@recurring)
  - Verified next_run_date set correctly
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.6, 17.7_

- [x] 49. Test financial account creation (@finance)
  - Created accounts of different types (cash, bank, savings, etc.)
  - Verified correct icon assigned based on type
  - Verified balance set correctly
  - Verified currency used from user settings
  - _Requirements: 17.5, 17.8_

- [x] 50. Test fund transfer (@transfer)
  - Transferred funds between accounts
  - Verified normalized name matching works
  - Verified balance validation
  - Verified both accounts updated atomically
  - Verified transfer transaction created
  - Verified accounts query invalidated
  - Verified before/after balances displayed
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 51. Test goal creation and contribution (@goal)
  - Created new financial goal
  - Verified goal created with correct target amount
  - Contributed to existing goal
  - Verified goal current_amount updated
  - Contributed from specific account
  - Verified account balance deducted
  - Verified progress percentage calculated
  - _Requirements: 18.6, 18.7, 18.8, 18.9_

- [x] 52. Test liability tracking (@liability)
  - Created liability with all fields
  - Verified type, amount, interest rate set correctly
  - Verified default due date (30 days)
  - Verified red color and CreditCard icon applied
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [x] 53. Test secure credential storage (@account)
  - Initiated account credential creation
  - Verified password NOT sent to AI
  - Verified sequential prompts for platform, title, email, password
  - Verified security message displayed
  - Verified "Integral Assistant" folder created/used
  - Verified account created with encrypted password
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

- [x] 54. Test pending action flows
  - Tested multi-step flows for various actions
  - Verified context-specific prompts displayed
  - Verified field collection works sequentially
  - Verified action executes when all fields collected
  - Verified pending action cleared after execution
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

- [x] 55. Test help modal
  - Opened help modal via info button
  - Verified all command sections display correctly
  - Verified examples and descriptions shown
  - Verified natural language section
  - Verified features section
  - Verified responsive sizing
  - Verified theme-aware styling
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

- [x] 56. Test theme support
  - Tested in Halloween mode
  - Verified teal colors (#60c9b6) applied throughout
  - Verified Halloween decorations appear (witch brew, spider)
  - Verified themed messages ("spirits are thinking...")
  - Tested in dark mode
  - Verified purple colors applied
  - Tested in light mode
  - Verified gray colors applied
  - Verified smooth theme transitions
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [x] 57. Test responsive design
  - Tested on mobile (320px - 767px)
  - Verified full-screen layout with backdrop blur
  - Verified smaller text and spacing
  - Tested on desktop (1024px+)
  - Verified fixed 350x414px widget size
  - Verified proper positioning
  - Verified timer widget coordination on both sizes
  - _Requirements: 1.8, 1.9_

- [x] 58. Test empty state and animations
  - Verified typewriter animation cycles through words
  - Verified random starting word
  - Verified correct timing (80ms type, 30ms delete, 40 frame pause)
  - Verified blinking cursor displays
  - Verified 3 random example prompts shown
  - Verified clicking prompt populates input
  - _Requirements: 13.8, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7_

- [x] 59. Test loading states
  - Verified shimmer animation displays during processing
  - Verified themed loading messages
  - Verified loading state clears when response received
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

- [x] 60. Test markdown rendering
  - Sent messages with bold text, paragraphs, code
  - Verified ReactMarkdown renders correctly
  - Verified theme-aware prose styling
  - Verified Halloween mode teal colors for emphasis
  - Verified proper spacing and margins
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

- [x] 61. Test clear chat functionality
  - Clicked clear chat button
  - Verified all messages cleared
  - Verified pending actions cleared
  - Verified empty state returns
  - _Requirements: 23.1, 23.2, 23.3, 23.4_

- [x] 62. Test dynamic placeholders
  - Navigated to different pages
  - Verified placeholder changes based on route
  - Verified appropriate command suggestions per page
  - _Requirements: 13.7_

## Phase 17: Code Review and Cleanup

- [x] 63. Code review and cleanup
  - Reviewed all AI chat widget code
  - Ensured consistent error handling
  - Verified all TypeScript types are correct
  - Verified no console.log statements in production code
  - Ensured code formatted with Biome
  - Added comments for complex logic
  - Verified all imports are used
  - _Requirements: All_
