# Dashboard - Implementation Tasks

## Phase 1: Data Fetching Setup

- [x] 1. Import All Required Hooks
  - Import useTasks from `src/hooks/useTasks.ts`
  - Import useNotes from `src/hooks/useNotes.ts`
  - Import useJournalQuery from `src/hooks/queries/useJournalQuery.ts`
  - Import usePomodoro from `src/hooks/usePomodoro.ts`
  - Import useTimeTracking from `src/hooks/useTimeTracking.ts`
  - Import useBudgets from `src/hooks/useBudgets.ts`
  - Import useBudgetTransactions from `src/hooks/useBudgetTransactions.ts`
  - Import useAccounts from `src/hooks/useAccounts.ts`
  - Import useAuth from `src/contexts/AuthContext.ts`
  - Import useTheme from `src/contexts/ThemeContext.ts`
  - _Requirements: AC10_

- [x] 2. Initialize All Data Hooks in Dashboard Component
  - Call useTasks hook to fetch tasks data
  - Call useNotes hook to fetch notes data
  - Call useJournalQuery hook to fetch journal entries
  - Call usePomodoro hook to fetch Pomodoro statistics
  - Call useTimeTracking hook to fetch time entries
  - Call useBudgets hook to fetch budgets
  - Call useBudgetTransactions hook to fetch transactions
  - Call useAccounts hook to fetch accounts
  - Ensure all hooks are called at component top level for parallel execution
  - Extract loading states from each hook
  - Extract error states from each hook
  - _Requirements: AC10_

- [x] 3. Implement Combined Loading State
  - Create loading variable combining all individual loading states with OR operator
  - Use loading state to control skeleton display
  - Ensure loading is true if any query is still fetching
  - Ensure loading is false only when all queries complete
  - _Requirements: AC10_

- [x] 4. Implement Error Handling Logic
  - Collect all error states into errors array
  - Filter out null/undefined errors
  - Check if all queries failed (errors.length === total hooks)
  - Check if some queries failed (errors.length > 0 && < total hooks)
  - Display error state if all queries failed
  - Display error toast if some queries failed
  - Continue rendering with available data for partial failures
  - _Requirements: AC13_

## Phase 2: Statistics Calculation

- [x] 5. Create Dashboard Stats Calculation with useMemo
  - Wrap all statistics calculations in useMemo hook
  - Add dependencies: tasks, budgets, transactions, accounts, getAllTimeStats, timeEntries
  - Ensure recalculation only when dependencies change
  - Return stats object with all calculated values
  - _Requirements: AC4, AC5, AC10, AC11_

- [x] 6. Calculate Task Statistics
  - Calculate completedTasks: filter tasks where completed === true, get length
  - Calculate totalTasks: tasks.length
  - Calculate activeTasks: filter tasks where completed === false, get length
  - Calculate completionRate: (completedTasks / totalTasks) × 100, round to 1 decimal
  - Handle division by zero: return 0 if totalTasks === 0
  - Calculate highPriorityTasks: filter tasks where !completed && priority === "high", get length
  - _Requirements: AC4, AC11_

- [x] 7. Calculate Financial Statistics
  - Calculate totalBudget: reduce budgets array, sum all budget.amount values
  - Calculate totalSpent: reduce transactions array, sum all transaction.amount values
  - Calculate budgetRemaining: totalBudget - totalSpent
  - Handle empty arrays: return 0 if no budgets or transactions
  - Format currency values according to user's currency preference
  - _Requirements: AC5, AC11_

- [x] 8. Calculate Account Statistics
  - Calculate activeAccounts: filter accounts where is_active === true, get length
  - Handle empty array: return 0 if no accounts
  - _Requirements: AC11_

- [x] 9. Get Pomodoro Statistics
  - Call getAllTimeStats() method from usePomodoro hook
  - Extract total, completed, work, breaks from returned stats
  - Store in pomodoroStats object
  - _Requirements: AC11_

- [x] 10. Calculate Time Tracking Statistics
  - Filter timeEntries where end_time is not null (completed entries only)
  - Reduce filtered entries to calculate total time
  - For each entry: use duration if available, else calculate from start_time and end_time
  - Convert milliseconds to hours: (end - start) / (1000 × 60 × 60)
  - Sum all durations to get totalTimeTracked
  - Round to 1 decimal place: Math.round(totalTimeTracked × 10) / 10
  - Store in totalTimeHours variable
  - _Requirements: AC11_

## Phase 3: Dashboard Page Structure

- [x] 11. Verify Dashboard Page Component
  - Verify `src/pages/Dashboard.tsx` exists and is properly structured
  - Ensure all imports are present
  - Ensure component exports correctly
  - Verify routing is configured in App.tsx
  - _Requirements: AC1_

- [x] 12. Create Header Section
  - Display "Welcome back" message with user email from useAuth
  - Display completion rate prominently with TrendingUp icon
  - Format completion rate as percentage with 1 decimal place
  - Apply theme-aware styling (teal for Halloween, default otherwise)
  - Make header responsive (stack on mobile, horizontal on desktop)
  - Add Halloween decorations when isHalloweenMode is true
  - _Requirements: AC1_

- [x] 13. Implement Loading State with Skeleton
  - Check if loading variable is true
  - Render DashboardSkeleton component when loading
  - Wrap skeleton in motion.div with fade-in animation
  - Ensure skeleton matches actual dashboard layout
  - _Requirements: AC10_

- [x] 14. Implement Error State
  - Check if all queries failed (errors.length === total hooks)
  - Display error icon (AlertCircle) with large size
  - Display error title: "Failed to load dashboard"
  - Display error message: "Please try again"
  - Add retry button that reloads the page
  - Apply theme-aware styling
  - _Requirements: AC13_

## Phase 4: Statistics Cards Section

- [x] 15. Create Statistics Cards Array
  - Define statsCards array with useMemo
  - Add dependency: dashboardStats, isHalloweenMode, notes, entries, budgets
  - Create 7 stat card objects with title, value, icon, color
  - Tasks card: title "Total Tasks", value totalTasks, icon CheckCircle, color green or teal
  - Notes card: title "Total Notes", value notes.length, icon StickyNote, color purple or teal
  - Journal card: title "Journal Entries", value entries.length, icon BookOpen, color blue or teal
  - Pomodoro card: title "Pomodoro Sessions", value pomodoroStats.total, icon Timer, color red or teal
  - Time card: title "Time Tracked", value `${totalTimeHours}h`, icon Clock, color amber or teal
  - Budget card: title "Total Budgets", value budgets.length, icon DollarSign, color cyan or teal
  - Accounts card: title "Active Accounts", value activeAccounts, icon Wallet, color pink or teal
  - _Requirements: AC2_

- [x] 16. Render Statistics Cards Grid
  - Create grid container with responsive classes: grid-cols-2 md:grid-cols-4 lg:grid-cols-7
  - Map through statsCards array
  - Wrap each card in motion.div with fade-in and stagger animation
  - Set initial: { opacity: 0, y: 20 }
  - Set animate: { opacity: 1, y: 0 }
  - Set transition delay: index × 0.05 for stagger effect
  - _Requirements: AC2, AC14_

- [x] 17. Create Individual Stat Card Component
  - Wrap in GlassCard component for glass morphism effect
  - Display icon with dynamic color from stat.color
  - Display title with theme-aware text color
  - Display value with large font size and bold weight
  - Add hover effect: scale slightly on hover
  - Apply responsive padding and spacing
  - _Requirements: AC2_

## Phase 5: Quick Actions Section

- [x] 18. Create Quick Actions Array
  - Define quickActions array with useMemo
  - Add dependency: isHalloweenMode
  - Create 7 quick action objects with title, description, icon, href, color, bgColor
  - Tasks action: title "Tasks", description "Manage your tasks", icon List, href "/tasks"
  - Time action: title "Time", description "Track time", icon Timer, href "/time"
  - Notes action: title "Notes", description "Your notes", icon StickyNote, href "/notes"
  - Journal action: title "Journal", description "Daily entries", icon BookOpen, href "/journal"
  - Pomodoro action: title "Pomodoro", description "Focus sessions", icon Timer, href "/pomodoro"
  - Budget action: title "Budget", description "Track spending", icon DollarSign, href "/budget"
  - Accounts action: title "Accounts", description "Manage accounts", icon Wallet, href "/accounts"
  - Apply theme-aware colors (teal for Halloween, module colors otherwise)
  - _Requirements: AC3_

- [x] 19. Render Quick Actions Grid
  - Create grid container with responsive classes: grid-cols-2 md:grid-cols-3 lg:grid-cols-7
  - Map through quickActions array
  - Wrap each action in motion.div with fade-in and stagger animation
  - Set initial: { opacity: 0, y: 20 }
  - Set animate: { opacity: 1, y: 0 }
  - Set transition delay: index × 0.05 for stagger effect
  - _Requirements: AC3, AC14_

- [x] 20. Create Individual Quick Action Card
  - Wrap in Link component from react-router-dom with href
  - Use GlassCard component for glass morphism effect
  - Display icon with dynamic color
  - Display title with bold font
  - Display description with smaller font
  - Add hover effects: scale up, increase shadow
  - Apply dynamic background color with opacity
  - Make card clickable and accessible
  - _Requirements: AC3_

## Phase 6: AI Insights Section

- [x] 21. Create Insights Grid Container
  - Create grid container with responsive classes: grid-cols-1 lg:grid-cols-2
  - Add gap between cards
  - Stack vertically on mobile, side-by-side on large screens
  - _Requirements: AC7_

- [x] 22. Integrate Financial Insights Card
  - Use existing FinancialInsightsCard component from `src/components/budget/FinancialInsightsCard.tsx`
  - Pass transactions prop
  - Pass budgets prop
  - Wrap in motion.div with fade-in animation
  - Handle loading state within component
  - Handle error state within component
  - _Requirements: AC7_

- [x] 23. Integrate Productivity Insights Card
  - Use existing ProductivityInsightsCard component from `src/components/tasks/ProductivityInsightsCard.tsx`
  - Pass tasks prop
  - Calculate zombie tasks: filter tasks where overdue by 7+ days and not completed
  - Pass zombieTasks prop
  - Wrap in motion.div with fade-in animation
  - Handle loading state within component
  - Display zombie task count with skull icon
  - Add pulsing animation to skull if zombies exist
  - _Requirements: AC7, AC8_

- [x] 24. Implement Zombie Task Modal Integration
  - Use existing ZombieTaskModal component from `src/components/tasks/ZombieTaskModal.tsx`
  - Set up state for modal visibility: showZombieModal
  - Pass zombieTasks to modal
  - Pass onClose handler to close modal
  - Pass onResurrect handler to handle task resurrection
  - Display modal when resurrect button clicked
  - Update zombie task count after resurrection
  - Show success toast after resurrection
  - _Requirements: AC8_

## Phase 7: Productivity Summary Section

- [x] 25. Create Daily Rituals Array
  - Define dailyRituals array with useMemo
  - Add dependencies: entries, pomodoroStats, navigate
  - Get today's date in ISO format
  - Create 4 ritual objects with icon, title, description, completed, action
  - Morning Journal ritual: icon "📝", check if entries.some(e => e.entry_date === today)
  - Review Tasks ritual: icon "✅", check localStorage for `tasks-viewed-${today}`
  - Focus Session ritual: icon "🍅", check if pomodoroStats.todayCompleted > 0
  - Budget Check ritual: icon "💰", check localStorage for `budget-viewed-${today}`
  - Each ritual action navigates to relevant page
  - _Requirements: AC6_

- [x] 26. Integrate Productivity Summary Card
  - Use existing ProductivitySummaryCard component from `src/components/dashboard/ProductivitySummaryCard.tsx`
  - Pass dailyRituals prop
  - Pass dashboardStats prop
  - Pass tasks prop for recent activity
  - Wrap in motion.div with fade-in animation
  - Display motivational messages
  - Display recent activity and trends
  - _Requirements: AC6_

## Phase 8: Halloween Decorations

- [x] 27. Create Dashboard Decorations Component
  - Use existing DashboardDecorations component from `src/components/halloween/DashboardDecorations.tsx`
  - Check isHalloweenMode from useTheme
  - Return null if Halloween mode is disabled
  - Render all decorations when enabled
  - _Requirements: AC9_

- [x] 28. Implement Flying Bat Animation
  - Create motion.div with fixed positioning
  - Set initial position: top-20, left-0
  - Animate x from 0vw to 100vw (across screen)
  - Animate y with wave pattern: [0, -20, 0, 20, 0]
  - Set duration: 15 seconds
  - Set repeat: Infinity
  - Set ease: linear
  - Use batFlying image from assets
  - Set pointer-events-none to prevent interaction
  - Set high z-index (50) for visibility
  - _Requirements: AC9_

- [x] 29. Implement Peeking Pumpkin Animation
  - Create motion.div with fixed positioning
  - Set position: bottom-10, right-10
  - Animate y: [0, -10, 0] (bobbing motion)
  - Set duration: 4 seconds
  - Set repeat: Infinity
  - Set ease: easeInOut
  - Use pumpkinPeeking image from assets
  - Set pointer-events-none
  - Set high z-index (50)
  - _Requirements: AC9_

- [x] 30. Implement Hanging Spider Animation
  - Create motion.div with fixed positioning
  - Set position: top-0, right-40
  - Set initial y: -100 (above viewport)
  - Animate y to 0 (descend) in 2 seconds
  - After descent, animate rotate: [-5, 5, -5] (swaying)
  - Set sway duration: 2 seconds
  - Set sway repeat: Infinity
  - Use spiderHanging image from assets
  - Set pointer-events-none
  - Set high z-index (50)
  - _Requirements: AC9_

- [x] 31. Implement Additional Decorations
  - Add cute spider decoration with fixed positioning
  - Add spider web decoration in corner
  - Add background overlay with gradient (purple-900/5 to transparent)
  - Add ghost decoration that appears on hover
  - Use fade-in animation for ghost
  - Position all decorations strategically around page
  - Ensure decorations don't interfere with content
  - _Requirements: AC9_

- [x] 32. Apply Halloween Theme Styling
  - Apply teal color (#60c9b6) to all stat cards when Halloween mode enabled
  - Apply teal color to all quick action cards when Halloween mode enabled
  - Add glowing effects to cards (box-shadow with teal color)
  - Use Creepster font for section titles when Halloween mode enabled
  - Add drop shadow effects to text
  - Ensure smooth transitions when toggling Halloween mode
  - _Requirements: AC9_

## Phase 9: Loading Skeletons

- [x] 33. Create Dashboard Skeleton Component
  - Create `src/components/skeletons/DashboardSkeleton.tsx` file
  - Import Skeleton component from UI library
  - Create skeleton for header section (2 skeleton lines)
  - Create skeleton for stats cards grid (7 skeleton cards)
  - Create skeleton for quick actions grid (7 skeleton cards)
  - Create skeleton for insights grid (2 skeleton cards)
  - Create skeleton for productivity summary (1 skeleton card)
  - Match skeleton layout to actual dashboard layout
  - Use same responsive grid classes
  - Apply theme-aware styling
  - _Requirements: AC10_

- [x] 34. Implement Skeleton Display Logic
  - Check loading variable in Dashboard component
  - Render DashboardSkeleton when loading is true
  - Wrap skeleton in motion.div with fade-in animation
  - Transition smoothly from skeleton to actual content
  - Ensure skeleton displays immediately on mount
  - _Requirements: AC10_

## Phase 10: Responsive Design

- [x] 35. Test Mobile Layout (320px - 767px)
  - Test header layout (stack elements vertically)
  - Test stats cards grid (2 columns)
  - Test quick actions grid (2 columns)
  - Test insights cards (stack vertically)
  - Test productivity summary (full width)
  - Verify all text is readable
  - Verify all buttons are touch-friendly (44x44px minimum)
  - Fix any overflow issues
  - Test on actual mobile devices
  - _Requirements: AC12_

- [x] 36. Test Tablet Layout (768px - 1023px)
  - Test header layout (horizontal with spacing)
  - Test stats cards grid (4 columns)
  - Test quick actions grid (3-4 columns)
  - Test insights cards (stack or side-by-side based on width)
  - Test productivity summary (full width)
  - Verify spacing and padding
  - Test landscape and portrait orientations
  - _Requirements: AC12_

- [x] 37. Test Desktop Layout (1024px+)
  - Test header layout (full horizontal)
  - Test stats cards grid (7 columns)
  - Test quick actions grid (7 columns)
  - Test insights cards (2 columns side-by-side)
  - Test productivity summary (full width)
  - Verify optimal spacing and layout
  - Test on various screen sizes (1024px, 1440px, 1920px)
  - _Requirements: AC12_

## Phase 11: Animations and Polish

- [x] 38. Implement Card Animations
  - Add fade-in animation to all cards (initial opacity 0, animate to 1)
  - Add slide-up animation to all cards (initial y: 20, animate to 0)
  - Implement stagger effect (delay each card by index × 0.05)
  - Add hover animations to quick action cards (scale: 1.02, shadow increase)
  - Add hover animations to stat cards (subtle scale: 1.01)
  - Use Framer Motion for all animations
  - Ensure animations are smooth (60fps)
  - Test performance with many cards
  - _Requirements: AC14_

- [x] 39. Implement Reduced Motion Support
  - Check user's prefers-reduced-motion setting
  - Disable animations if user prefers reduced motion
  - Use CSS media query: @media (prefers-reduced-motion: reduce)
  - Provide instant transitions instead of animations
  - Ensure functionality works without animations
  - _Requirements: AC14_

- [x] 40. Add Empty States
  - Create empty state for no tasks (encouraging message, illustration)
  - Create empty state for no notes (call-to-action)
  - Create empty state for no journal entries (motivational message)
  - Create empty state for no budgets (getting started guide)
  - Add Halloween-themed empty states when isHalloweenMode is true
  - Use appropriate icons and messages for each state
  - Add call-to-action buttons to create first item
  - _Requirements: (UX)_

## Phase 12: Final Testing and Cleanup

- [x] 41. Test All Quick Actions Navigation
  - Click Tasks action, verify navigation to /tasks
  - Click Time action, verify navigation to /time
  - Click Notes action, verify navigation to /notes
  - Click Journal action, verify navigation to /journal
  - Click Pomodoro action, verify navigation to /pomodoro
  - Click Budget action, verify navigation to /budget
  - Click Accounts action, verify navigation to /accounts
  - Verify all links work correctly
  - _Requirements: AC3_

- [x] 42. Test Statistics Accuracy
  - Verify total tasks count matches actual tasks.length
  - Verify completed tasks count matches filtered count
  - Verify completion rate calculation is correct
  - Verify total budget matches sum of budget amounts
  - Verify total spent matches sum of transaction amounts
  - Verify active accounts count matches filtered count
  - Verify Pomodoro stats match actual data
  - Verify time tracked matches calculated hours
  - Test with various data scenarios (no data, partial data, full data)
  - _Requirements: AC11_

- [x] 43. Test Zombie Task Functionality
  - Create tasks with due dates 7+ days in past
  - Verify zombie tasks are identified correctly
  - Verify zombie count displays in productivity insights
  - Verify skull icon appears and pulses
  - Click resurrect button, verify modal opens
  - Test task resurrection options
  - Test task deletion from modal
  - Verify zombie count updates after actions
  - _Requirements: AC8_

- [x] 44. Test Daily Rituals
  - Create journal entry for today, verify Morning Journal marked complete
  - Complete Pomodoro session, verify Focus Session marked complete
  - Visit tasks page, verify Review Tasks marked complete (if localStorage tracking implemented)
  - Visit budget page, verify Budget Check marked complete (if localStorage tracking implemented)
  - Click ritual action buttons, verify navigation
  - Test ritual completion persistence
  - _Requirements: AC6_

- [x] 45. Test Halloween Mode
  - Toggle Halloween mode on, verify teal colors applied
  - Verify all decorations appear (bat, pumpkin, spider, ghost, witch)
  - Verify animations are smooth and continuous
  - Verify glowing effects on cards
  - Verify Creepster font on titles
  - Toggle Halloween mode off, verify decorations disappear
  - Verify colors revert to defaults
  - Test theme toggle multiple times
  - _Requirements: AC9_

- [x] 46. Test Error Handling
  - Simulate network error for one query, verify partial data displays
  - Simulate network error for all queries, verify error state displays
  - Verify error toast appears for partial failures
  - Click retry button, verify page reloads
  - Test with various error scenarios
  - Verify user-friendly error messages
  - _Requirements: AC13_

- [x] 47. Test Performance
  - Measure dashboard load time (should be < 2 seconds)
  - Verify all queries execute in parallel
  - Check for unnecessary re-renders (use React DevTools)
  - Verify useMemo prevents recalculations
  - Test with large datasets (100+ tasks, notes, etc.)
  - Check animation performance (should be 60fps)
  - Optimize if performance issues found
  - _Requirements: AC10_

- [x] 48. Accessibility Testing
  - Test keyboard navigation (Tab through all interactive elements)
  - Test screen reader (verify all content is announced)
  - Verify all images have alt text
  - Verify all buttons have aria-labels
  - Check color contrast ratios (WCAG AA compliance)
  - Test focus indicators (visible focus rings)
  - Verify semantic HTML structure
  - _Requirements: (accessibility)_

- [x] 49. Code Review and Cleanup
  - Remove console.log statements
  - Ensure consistent code formatting with Biome
  - Check for unused imports and variables
  - Verify all error messages are user-friendly
  - Add comments for complex logic (statistics calculations, zombie task logic)
  - Verify all components have proper TypeScript types
  - Check for any hardcoded values that should be constants
  - Verify all requirements are met
  - _Requirements: All_

- [x] 50. Final Manual Testing
  - Test complete dashboard workflow from login to navigation
  - Test with demo account (demo@integral.com)
  - Test with empty account (no data)
  - Test with full account (all features used)
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test on multiple devices (mobile, tablet, desktop)
  - Test theme switching (light, dark, Halloween)
  - Verify all features work as expected
  - Document any issues found
  - _Requirements: All_
