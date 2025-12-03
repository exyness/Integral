# Requirements Document

## Introduction

This document specifies the requirements for the Floating AI Chat Widget system implemented in Integral. The system provides persistent AI assistance through a floating chat interface that coordinates with the existing timer widget. The AI assistant supports comprehensive productivity and financial management commands, including task creation, note-taking, journal entries, transaction tracking, budget management, goal contributions, fund transfers, and secure credential storage. The design prioritizes seamless multi-widget coordination, conversational multi-step flows, and theme-aware styling across Halloween, dark, and light modes.

## Glossary

- **Floating AI Chat Widget**: A persistent chat interface that provides AI assistance and remains accessible across all authenticated pages
- **FloatingWidgetContext**: React Context that manages visibility state for all floating widgets (timer, search modal, AI chat)
- **Widget Coordination**: System that ensures the timer widget repositions itself when the AI chat opens to prevent overlap
- **Mentions Dropdown**: Command suggestion dropdown triggered by "@" character with keyboard navigation
- **Pending Action**: Multi-step conversation flow where the AI collects missing information sequentially
- **Command**: Shortcut prefix (e.g., @task, @note, @transaction) that triggers specific AI actions
- **Integral Assistant**: Default project/folder name for AI-created content
- **Theme-Aware Styling**: UI that adapts colors and decorations based on Halloween, dark, or light mode
- **Glass Morphism**: Translucent card design with backdrop blur effects
- **Typewriter Animation**: Text animation that types and deletes words character by character
- **Markdown Rendering**: Display of formatted text with support for bold, paragraphs, and inline code
- **Integral**: The productivity suite application
- **TanStack Query**: React library for server state management with caching

## Requirements

### Requirement 1

**User Story:** As a user, I want a persistent AI chat widget that stays accessible across all pages, so that I can get AI assistance without navigating away from my current work.

#### Acceptance Criteria

1. WHEN a user is on any authenticated page, THE **Integral** application SHALL display the **Floating AI Chat Widget** button in the bottom-right corner
2. WHEN the AI chat widget is closed, THE **Integral** application SHALL display a floating button with assistant.svg icon and Sparkles indicator
3. WHEN a user clicks the floating button, THE **Integral** application SHALL expand the AI chat interface with smooth scale and opacity animations
4. WHEN a user closes the AI chat widget, THE **Integral** application SHALL collapse it to the floating button with exit animations
5. THE **Floating AI Chat Widget** SHALL persist its open/closed state in the **FloatingWidgetContext** using isAIChatOpen
6. THE **Floating AI Chat Widget** SHALL be integrated into the Layout component, making it available on all authenticated pages
7. THE **Floating AI Chat Widget** SHALL use glass morphism styling with GlassCard component
8. THE **Floating AI Chat Widget** SHALL have a z-index of 9999 to appear above content but below modals (z-index 10000)
9. WHEN the AI chat widget is open on mobile, THE **Integral** application SHALL display a backdrop blur overlay at z-index 9998
10. THE floating button SHALL display the assistant.svg icon with theme-aware color filtering (teal for Halloween, purple for dark, default for light)
11. THE collapsed button SHALL be 48x48px (mobile) or 56x56px (desktop) with rounded-xl corners
12. THE expanded chat SHALL be full-screen on mobile (inset-x-2 top-12 bottom-2) and 350x414px on desktop

### Requirement 2

**User Story:** As a user, I want the AI chat widget and timer widget to position themselves intelligently, so that they don't overlap and I can use both simultaneously.

#### Acceptance Criteria

1. WHEN the AI chat widget is closed, THE timer widget SHALL position itself at right-3 (12px from right edge on mobile) or right-4 (16px on desktop)
2. WHEN the AI chat widget is open, THE timer widget SHALL shift its position to right-[72px] on mobile or right-[84px] on desktop
3. THE timer widget SHALL animate its position change with CSS transition: "right 0.3s ease-in-out"
4. THE **FloatingWidgetContext** SHALL provide an `isAIChatOpen` boolean state to all consuming components
5. THE **FloatingWidgetContext** SHALL provide a `setAIChatOpen` function to update the AI chat visibility state
6. WHEN the AI chat widget opens, THE **FloatingWidgetContext** SHALL immediately update the `isAIChatOpen` state to true
7. WHEN the AI chat widget closes, THE **FloatingWidgetContext** SHALL immediately update the `isAIChatOpen` state to false
8. THE timer widget SHALL read the `isAIChatOpen` state from useFloatingWidget hook and adjust its positioning accordingly
9. THE position adjustment SHALL apply to both the collapsed button and expanded widget states

### Requirement 3

**User Story:** As a user, I want to see a helpful empty state with animated text, so that I understand what the AI assistant can do.

#### Acceptance Criteria

1. WHEN the chat is empty and open, THE **Integral** application SHALL display a typewriter animation
2. THE typewriter animation SHALL cycle through words: Tasks, Notes, Journal, Budget, Goals, Pomodoro
3. THE typewriter animation SHALL start with a random word from the list
4. THE typewriter animation SHALL type characters at 80ms intervals
5. THE typewriter animation SHALL delete characters at 30ms intervals
6. THE typewriter animation SHALL pause for 40 frames when a word is complete before deleting
7. THE typewriter animation SHALL display a blinking cursor (|) after the text
8. THE empty state SHALL display themed message: "Ask the spirits about your {word}!" (Halloween) or "Ask me about your {word}!" (normal)
9. THE empty state SHALL display 3 random example prompts as clickable buttons
10. WHEN a user clicks an example prompt, THE **Integral** application SHALL populate the input field with that prompt

### Requirement 4

**User Story:** As a user, I want to use command shortcuts with "@" mentions, so that I can quickly access specific AI functions.

#### Acceptance Criteria

1. WHEN a user types "@" in the chat input, THE **Integral** application SHALL display a mentions dropdown
2. THE mentions dropdown SHALL include 12 commands: @task, @note, @journal, @transaction, @budget, @category, @goal, @liability, @transfer, @finance, @recurring, @account
3. WHEN a user types "@" followed by text, THE **Integral** application SHALL filter the mentions list based on the input
4. WHEN a user presses Arrow Down, THE **Integral** application SHALL highlight the next mention in the list
5. WHEN a user presses Arrow Up, THE **Integral** application SHALL highlight the previous mention in the list
6. WHEN a user presses Enter with a mention highlighted, THE **Integral** application SHALL insert the command into the input field
7. WHEN a user clicks a mention, THE **Integral** application SHALL insert the command into the input field
8. WHEN a user presses Escape, THE **Integral** application SHALL close the mentions dropdown
9. THE mentions dropdown SHALL auto-scroll the selected item into view
10. THE mentions dropdown SHALL display command key, label, and example for each mention
11. THE mentions dropdown SHALL use theme-aware styling with borders and backgrounds
12. THE mentions dropdown SHALL be positioned above the input field with max-height and custom scrollbar

### Requirement 5

**User Story:** As a user, I want the chat input to have dynamic placeholders based on my current page, so that I get contextual suggestions.

#### Acceptance Criteria

1. WHEN a user is on the Tasks page, THE input placeholder SHALL be "@task Add project deadline..."
2. WHEN a user is on the Notes page, THE input placeholder SHALL be "@note Save this idea..."
3. WHEN a user is on the Journal page, THE input placeholder SHALL be "@journal Today I learned..."
4. WHEN a user is on the Budget/Finances page, THE input placeholder SHALL be "@transaction Spent $50 on..."
5. WHEN a user is on the Goals page, THE input placeholder SHALL be "@goal Save $5000 for..."
6. WHEN a user is on the Accounts page, THE input placeholder SHALL be "@account Save login for..."
7. WHEN a user is on any other page, THE input placeholder SHALL be "Type @ for commands or ask anything..."
8. THE placeholder SHALL update automatically when navigating between pages

### Requirement 6

**User Story:** As a user, I want to see my messages and AI responses in a clear chat interface, so that I can follow the conversation.

#### Acceptance Criteria

1. THE chat SHALL display messages in a scrollable area with custom scrollbar
2. USER messages SHALL be right-aligned with purple/teal background and rounded-tr-none corners
3. AI messages SHALL be left-aligned with dark background and rounded-tl-none corners
4. SUCCESS messages SHALL have green background with border
5. THE chat SHALL auto-scroll to the bottom when new messages are added
6. THE chat area SHALL have max-height with overflow-y-auto
7. AI and SUCCESS messages SHALL render markdown using ReactMarkdown
8. MARKDOWN rendering SHALL support paragraphs, bold text, and inline code
9. MARKDOWN rendering SHALL use theme-aware prose styling
10. HALLOWEEN mode SHALL use teal colors for emphasis and code blocks in markdown
11. THE chat SHALL remove default margins from first and last markdown elements

### Requirement 7

**User Story:** As a user, I want to see loading states while the AI processes my request, so that I know my message is being handled.

#### Acceptance Criteria

1. WHEN the AI is processing a request, THE **Integral** application SHALL display a loading message with TextShimmer animation
2. THE loading message SHALL appear as a left-aligned AI message
3. HALLOWEEN mode loading message SHALL say "The spirits are thinking..."
4. NORMAL mode loading message SHALL say "Thinking..."
5. THE shimmer animation SHALL use theme-aware colors: teal for Halloween, purple for dark, purple for light
6. THE loading message SHALL disappear when the AI response is received
7. THE shimmer animation SHALL have 1.5s duration

### Requirement 8

**User Story:** As a user, I want to use multi-step conversational flows for complex actions, so that I can provide information naturally without filling out forms.

#### Acceptance Criteria

1. WHEN the AI determines required information is missing, THE **Integral** application SHALL enter a pending action state
2. THE pending action state SHALL track intent, collected params, and missing fields
3. WHEN in pending action state, THE **Integral** application SHALL prompt the user for the next missing field
4. WHEN the user provides information, THE **Integral** application SHALL update the pending action params
5. WHEN the user provides information, THE **Integral** application SHALL remove the filled field from missingFields array
6. WHEN all required fields are collected, THE **Integral** application SHALL execute the action automatically
7. WHEN the action completes, THE **Integral** application SHALL clear the pending action state
8. THE prompts SHALL be context-specific based on the action type (account creation, recurring transactions, budgets, categories, financial accounts)

### Requirement 9

**User Story:** As a user, I want to create tasks through the AI assistant with smart defaults, so that I can quickly capture todos.

#### Acceptance Criteria

1. WHEN a user creates a task without a due date, THE **Integral** application SHALL default to 7 days from today
2. WHEN a user creates a task, THE **Integral** application SHALL automatically assign it to the "Integral Assistant" project
3. WHEN a user creates a task, THE **Integral** application SHALL automatically add the "integral-assistant" label
4. WHEN a task is created successfully, THE **Integral** application SHALL display a success toast notification
5. WHEN a task is created successfully, THE **Integral** application SHALL display a success message in the chat showing task title and due date
6. WHEN task creation fails, THE **Integral** application SHALL display an error message in the chat

### Requirement 10

**User Story:** As a user, I want to create notes and journal entries through the AI assistant with automatic organization, so that my AI-generated content is kept separate.

#### Acceptance Criteria

1. WHEN a user creates a note through the AI assistant, THE **Integral** application SHALL find or create an "Integral Assistant" folder
2. WHEN the "Integral Assistant" folder doesn't exist, THE **Integral** application SHALL create it with purple color (#8B5CF6)
3. WHEN a user creates a note, THE **Integral** application SHALL automatically add the "integral-assistant" tag
4. WHEN a user creates a note, THE **Integral** application SHALL extract the first line as the title (max 50 characters)
5. WHEN a user creates a journal entry, THE **Integral** application SHALL automatically add the "integral-assistant" tag
6. WHEN a user creates a journal entry, THE **Integral** application SHALL set the mood to 3 (neutral) by default
7. WHEN a user creates a journal entry, THE **Integral** application SHALL use the current date as the entry_date
8. WHEN note or journal creation succeeds, THE **Integral** application SHALL show success toast and chat message

### Requirement 11

**User Story:** As a user, I want to manage my finances through the AI assistant, so that I can track transactions, budgets, and accounts conversationally.

#### Acceptance Criteria

1. WHEN a user creates a transaction, THE **Integral** application SHALL use the first available budget or null if none exists
2. WHEN a user creates a transaction, THE **Integral** application SHALL automatically add the "integral-assistant" tag
3. WHEN a user creates a budget, THE **Integral** application SHALL calculate start and end dates based on the period (weekly: +7 days, monthly: +1 month, yearly: +1 year)
4. WHEN a user creates a category, THE **Integral** application SHALL set it as active by default with purple color (#8B5CF6)
5. WHEN a user creates a financial account, THE **Integral** application SHALL choose an appropriate icon based on account type (FaPiggyBank for savings, FaCreditCard for credit_card, etc.)
6. WHEN a user creates a recurring transaction, THE **Integral** application SHALL set it as active by default with start_date and next_run_date set to today
7. THE **Integral** application SHALL support account types: cash, bank, credit_card, digital_wallet, investment, savings
8. WHEN financial actions succeed, THE **Integral** application SHALL show success toast and formatted chat message with currency symbols

### Requirement 12

**User Story:** As a user, I want to transfer funds between accounts and contribute to goals through the AI assistant, so that I can manage my money conversationally.

#### Acceptance Criteria

1. WHEN a user transfers funds, THE **Integral** application SHALL find accounts using normalized name matching (case-insensitive, ignoring "account"/"acct"/"acc")
2. WHEN a user transfers funds, THE **Integral** application SHALL check for sufficient balance in the source account
3. WHEN a user transfers funds, THE **Integral** application SHALL update both accounts atomically using Promise.all
4. WHEN a user transfers funds, THE **Integral** application SHALL create a transfer transaction record with both account IDs
5. WHEN a user transfers funds, THE **Integral** application SHALL invalidate the accounts query to force UI refresh
6. WHEN a user transfers funds, THE **Integral** application SHALL display before/after balances for both accounts in the chat
7. WHEN a user contributes to a goal, THE **Integral** application SHALL find the goal using case-insensitive partial name matching
8. WHEN a user contributes to a goal from an account, THE **Integral** application SHALL deduct the amount from the account
9. WHEN a user contributes to a goal, THE **Integral** application SHALL update the goal's current_amount
10. WHEN a user contributes to a goal, THE **Integral** application SHALL display progress percentage in the response

### Requirement 13

**User Story:** As a user, I want to track liabilities and debts through the AI assistant, so that I can monitor my financial obligations.

#### Acceptance Criteria

1. WHEN a user creates a liability, THE **Integral** application SHALL support types: loan, credit_card, mortgage, other
2. WHEN a user creates a liability without a due date, THE **Integral** application SHALL default to 30 days from today
3. WHEN a user creates a liability, THE **Integral** application SHALL use red color (#EF4444) by default
4. WHEN a user creates a liability, THE **Integral** application SHALL set it as active by default
5. WHEN a user creates a liability, THE **Integral** application SHALL use the user's currency setting
6. THE **Integral** application SHALL support optional fields: interest_rate, minimum_payment
7. WHEN a liability is created, THE **Integral** application SHALL show success toast and chat message with type label

### Requirement 14

**User Story:** As a user, I want to save account credentials securely through the AI assistant, so that I can store passwords without them being sent to the AI.

#### Acceptance Criteria

1. WHEN a user initiates account credential creation, THE **Integral** application SHALL NOT send password information to the AI
2. WHEN collecting account credentials, THE **Integral** application SHALL prompt for platform, title, email, and password separately
3. WHEN prompting for password, THE **Integral** application SHALL display message: "will be encrypted and stored securely"
4. WHEN a user creates account credentials, THE **Integral** application SHALL find or create an "Integral Assistant" folder
5. WHEN a user creates account credentials, THE **Integral** application SHALL automatically add the "integral-assistant" tag
6. WHEN a user creates account credentials, THE **Integral** application SHALL set usage_type to "custom" and reset_period to "never"
7. WHEN credentials are saved, THE **Integral** application SHALL show success toast and chat message

### Requirement 15

**User Story:** As a user, I want to access help documentation within the chat, so that I can learn about available commands and features.

#### Acceptance Criteria

1. WHEN a user clicks the info icon in the chat header, THE **Integral** application SHALL display the AIHelpModal
2. THE AIHelpModal SHALL display commands organized by category: Productivity (3 commands), Finance (8 commands), Account Manager (1 command)
3. THE AIHelpModal SHALL show command syntax, description, and example for each command
4. THE AIHelpModal SHALL display a "Natural Language" section with 6 example phrases
5. THE AIHelpModal SHALL display a "Features" section listing 6 key capabilities with icons
6. THE AIHelpModal SHALL support theme-aware styling (Halloween teal, dark purple, light gray)
7. THE AIHelpModal SHALL use responsive sizing (text-xs/sm on mobile, text-sm/lg on desktop)
8. THE AIHelpModal SHALL use Modal component with "lg" size

### Requirement 16

**User Story:** As a user, I want to clear the chat history, so that I can start fresh conversations.

#### Acceptance Criteria

1. WHEN a user clicks the clear chat button, THE **Integral** application SHALL remove all messages from the chat
2. WHEN a user clicks the clear chat button, THE **Integral** application SHALL clear any pending action state
3. THE clear chat button SHALL be accessible from the chat header with RotateCcw icon
4. THE clear chat button SHALL use theme-aware hover colors
5. WHEN chat is cleared, THE empty state with typewriter animation SHALL return

### Requirement 17

**User Story:** As a user, I want consistent theme-aware styling across all widget states, so that the interface feels cohesive.

#### Acceptance Criteria

1. THE **Floating AI Chat Widget** SHALL use glass morphism styling with GlassCard component
2. HALLOWEEN mode SHALL use teal accent colors (#60c9b6) throughout the widget
3. HALLOWEEN mode SHALL display witch brew decoration (bottom-left) and hanging spider (top-right) at 20% opacity
4. DARK mode SHALL use purple accent colors for highlights and interactive elements
5. LIGHT mode SHALL use gray colors with appropriate contrast
6. THE collapsed button SHALL apply theme-aware color filtering to the assistant.svg icon
7. THE Sparkles indicator SHALL use theme-aware colors (teal/purple/black with opacity)
8. ALL interactive elements SHALL have theme-aware hover states
9. THE mentions dropdown SHALL use theme-aware borders and backgrounds
10. MESSAGE bubbles SHALL use theme-aware colors (purple/teal for user, dark for AI, green for success)
11. THE loading shimmer SHALL use theme-aware colors
12. THE widget SHALL have smooth animations for all state transitions

### Requirement 18

**User Story:** As a user, I want the widget to work well on all screen sizes, so that I can use it on mobile and desktop.

#### Acceptance Criteria

1. ON MOBILE (320px - 767px), THE widget SHALL use full-screen layout (inset-x-2 top-12 bottom-2)
2. ON MOBILE, THE widget SHALL display a backdrop blur overlay when open
3. ON MOBILE, THE collapsed button SHALL be 48x48px
4. ON MOBILE, THE timer widget SHALL shift to right-[72px] when AI chat is open
5. ON DESKTOP (1024px+), THE widget SHALL be 350px wide and 414px tall
6. ON DESKTOP, THE widget SHALL be positioned at bottom-4 right-4
7. ON DESKTOP, THE collapsed button SHALL be 56x56px
8. ON DESKTOP, THE timer widget SHALL shift to right-[84px] when AI chat is open
9. ALL text SHALL use responsive sizing (text-xs/sm on mobile, text-sm on desktop)
10. ALL spacing SHALL use responsive values (p-2/p-3 on mobile, p-3/p-4 on desktop)
11. THE mentions dropdown SHALL be scrollable with max-height on all screen sizes
12. THE chat messages area SHALL be scrollable with custom scrollbar on all screen sizes
