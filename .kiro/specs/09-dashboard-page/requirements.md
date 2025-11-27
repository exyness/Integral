# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive unified dashboard for Integral. The dashboard provides an overview of all productivity metrics, quick actions for navigation, AI-powered insights, zombie task alerts, and motivational elements. The design prioritizes data accuracy, performance through parallel data fetching, and an engaging user experience that motivates users to stay productive.

## Glossary

- **Dashboard**: The main landing page displaying aggregated statistics and quick access to all features
- **Statistics Card**: A visual card displaying a single metric (count, percentage, or value) with an icon and color
- **Quick Action**: A clickable card that navigates to a specific feature page
- **Completion Rate**: The percentage of completed tasks out of total tasks
- **Zombie Task**: An overdue task that has been past its due date for 7 or more days
- **AI Insights**: Automated analysis and recommendations based on user data patterns
- **Daily Ritual**: A suggested daily activity to maintain productivity habits
- **Productivity Summary**: An overview of daily habits, recent activity, and trends
- **Halloween Mode**: A seasonal theme with teal colors and spooky decorations
- **Integral**: The productivity suite application

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a welcome message and my overall task completion rate, so that I can quickly understand my productivity status.

#### Acceptance Criteria

1. THE **Dashboard** SHALL display a welcome message with the user's email address
2. THE **Dashboard** SHALL display the task **Completion Rate** prominently in the header
3. THE **Completion Rate** SHALL be calculated as (completed tasks / total tasks) × 100
4. THE **Completion Rate** SHALL display as a percentage with 1 decimal place
5. THE **Dashboard** SHALL display a trending up icon next to the completion rate
6. WHEN Halloween mode is enabled, THE header SHALL display animated decorations (bat, pumpkin, spider, ghost, witch)
7. THE header SHALL be responsive and adjust layout for mobile devices
8. THE **Dashboard** SHALL apply theme-aware styling to the header

### Requirement 2

**User Story:** As a user, I want to see statistics cards for all modules, so that I can get a quick overview of my data across the application.

#### Acceptance Criteria

1. THE **Dashboard** SHALL display seven **Statistics Cards** in a responsive grid layout
2. THE statistics cards SHALL display: Total Tasks, Total Notes, Total Journal Entries, Total Pomodoro Sessions, Total Time Tracked (hours), Total Budgets, Active Accounts
3. EACH **Statistics Card** SHALL display an icon, title, value, and module-specific color
4. THE Tasks card SHALL use green color (#10B981) and CheckCircle icon
5. THE Notes card SHALL use purple color (#8B5CF6) and StickyNote icon
6. THE Journal card SHALL use blue color (#3B82F6) and BookOpen icon
7. THE Pomodoro card SHALL use red color (#EF4444) and Timer icon
8. THE Time card SHALL use amber color (#F59E0B) and Clock icon
9. THE Budget card SHALL use cyan color (#06B6D4) and DollarSign icon
10. THE Accounts card SHALL use pink color (#EC4899) and Wallet icon
11. THE grid SHALL display 2 columns on mobile, 4 columns on tablet, and 7 columns on large screens
12. WHEN Halloween mode is enabled, THE cards SHALL use teal color (#60c9b6) instead of module colors

### Requirement 3

**User Story:** As a user, I want quick action cards for all modules, so that I can navigate efficiently without multiple clicks.

#### Acceptance Criteria

1. THE **Dashboard** SHALL display seven **Quick Action** cards in a responsive grid layout
2. THE quick action cards SHALL provide access to: Tasks, Time Tracking, Notes, Journal, Pomodoro, Budgets, Accounts
3. EACH **Quick Action** card SHALL display an icon, title, description, and module-specific color indicator
4. WHEN a user clicks a quick action card, THE **Integral** application SHALL navigate to the corresponding page
5. THE Tasks action SHALL navigate to /tasks with description "Manage your tasks"
6. THE Time action SHALL navigate to /time with description "Track your time"
7. THE Notes action SHALL navigate to /notes with description "Your notes"
8. THE Journal action SHALL navigate to /journal with description "Daily entries"
9. THE Pomodoro action SHALL navigate to /pomodoro with description "Focus sessions"
10. THE Budget action SHALL navigate to /budget with description "Track spending"
11. THE Accounts action SHALL navigate to /accounts with description "Manage accounts"
12. THE grid SHALL display 2 columns on mobile, 3-4 columns on tablet, and 7 columns on large screens
13. THE cards SHALL have hover effects (scale, shadow)

### Requirement 4

**User Story:** As a user, I want to see detailed task statistics, so that I can understand my task management performance.

#### Acceptance Criteria

1. THE **Dashboard** SHALL calculate and display total tasks count
2. THE **Dashboard** SHALL calculate and display completed tasks count
3. THE **Dashboard** SHALL calculate and display active (non-completed) tasks count
4. THE **Dashboard** SHALL calculate and display high priority tasks count
5. THE **Dashboard** SHALL calculate task **Completion Rate** as (completed / total) × 100
6. THE **Dashboard** SHALL handle division by zero (show 0% if no tasks exist)
7. THE **Dashboard** SHALL update statistics in real-time when tasks change
8. THE statistics SHALL be accurate and match the actual task data

### Requirement 5

**User Story:** As a user, I want to see financial overview statistics, so that I can monitor my budget status.

#### Acceptance Criteria

1. THE **Dashboard** SHALL calculate and display total budget amount (sum of all budget amounts)
2. THE **Dashboard** SHALL calculate and display total spent (sum of all transaction amounts)
3. THE **Dashboard** SHALL calculate and display budget remaining (total budget - total spent)
4. THE **Dashboard** SHALL calculate budget utilization percentage as (total spent / total budget) × 100
5. THE **Dashboard** SHALL format currency values according to user's currency preference
6. THE **Dashboard** SHALL handle multiple currencies by converting to user's default currency
7. THE **Dashboard** SHALL update statistics in real-time when budgets or transactions change
8. THE statistics SHALL be accurate and match the actual budget data

### Requirement 6

**User Story:** As a user, I want to see a productivity summary with daily rituals, so that I can maintain productive habits.

#### Acceptance Criteria

1. THE **Dashboard** SHALL display a productivity summary card
2. THE productivity summary SHALL display daily rituals with completion status
3. THE daily rituals SHALL include: Morning Journal, Review Tasks, Focus Session, Budget Check
4. EACH ritual SHALL display an emoji icon, title, description, and completion indicator
5. EACH ritual SHALL have a click action that navigates to the relevant page
6. THE Morning Journal ritual SHALL be marked complete if user has a journal entry for today
7. THE Review Tasks ritual SHALL be marked complete if user has viewed tasks page today
8. THE Focus Session ritual SHALL be marked complete if user has completed a Pomodoro session today
9. THE Budget Check ritual SHALL be marked complete if user has viewed budget page today
10. THE productivity summary SHALL display recent activity and trends
11. THE productivity summary SHALL display motivational messages

### Requirement 7

**User Story:** As a user, I want to see AI-powered insights, so that I can get personalized recommendations.

#### Acceptance Criteria

1. THE **Dashboard** SHALL display a financial insights card
2. THE **Dashboard** SHALL display a productivity insights card
3. THE financial insights card SHALL analyze spending patterns
4. THE financial insights card SHALL provide budget recommendations
5. THE financial insights card SHALL alert about overspending
6. THE financial insights card SHALL suggest savings opportunities
7. THE productivity insights card SHALL analyze task completion patterns
8. THE productivity insights card SHALL analyze focus time
9. THE productivity insights card SHALL warn about **Zombie Tasks**
10. THE productivity insights card SHALL provide productivity tips
11. THE insights cards SHALL be displayed in a 2-column grid on large screens
12. THE insights cards SHALL stack vertically on mobile devices

### Requirement 8

**User Story:** As a user, I want to see zombie task alerts, so that I can address overdue tasks promptly.

#### Acceptance Criteria

1. THE **Dashboard** SHALL identify **Zombie Tasks** as tasks that are overdue by 7 or more days
2. THE **Dashboard** SHALL display the count of zombie tasks in the productivity insights card
3. THE **Dashboard** SHALL display a skull icon next to the zombie task count
4. WHEN zombie tasks exist, THE skull icon SHALL have a pulsing animation
5. THE **Dashboard** SHALL provide a "Resurrect" button to view and manage zombie tasks
6. WHEN a user clicks the resurrect button, THE **Integral** application SHALL display the zombie task modal
7. THE zombie task modal SHALL list all zombie tasks with their titles and due dates
8. THE zombie task modal SHALL provide options to break tasks into subtasks, create new tasks, or delete zombie tasks
9. WHEN a zombie task is resurrected, THE **Integral** application SHALL display a success toast notification
10. THE **Dashboard** SHALL update the zombie task count in real-time when tasks are completed or deleted

### Requirement 9

**User Story:** As a user, I want the dashboard to support Halloween theme mode, so that I can enjoy seasonal decorations.

#### Acceptance Criteria

1. WHEN Halloween mode is enabled, THE **Dashboard** SHALL display teal accent color (#60c9b6) for all module colors
2. WHEN Halloween mode is enabled, THE **Dashboard** SHALL display animated decorations throughout the page
3. THE decorations SHALL include: flying bat, peeking pumpkin, hanging spider with web, cute spider, background overlay, ghost on hover
4. THE bat SHALL animate across the screen in a 15-second loop
5. THE pumpkin SHALL bob up and down in a 4-second loop
6. THE spider SHALL descend on web in 2 seconds, then sway in a 2-second loop
7. THE ghost SHALL appear with fade-in animation on hover
8. THE **Dashboard** SHALL apply glowing effects to cards and text
9. THE **Dashboard** SHALL use Creepster font for section titles
10. THE **Dashboard** SHALL display Halloween-themed empty states
11. WHEN Halloween mode is disabled, THE **Dashboard** SHALL revert to standard theme colors and remove decorations

### Requirement 10

**User Story:** As a user, I want the dashboard to load quickly, so that I can access my data without delay.

#### Acceptance Criteria

1. THE **Dashboard** SHALL fetch all data in parallel using multiple hooks
2. THE **Dashboard** SHALL display loading skeletons while data is being fetched
3. THE **Dashboard** SHALL load and display data within 2 seconds on average network conditions
4. THE **Dashboard** SHALL use useMemo for expensive calculations to optimize performance
5. THE **Dashboard** SHALL avoid blocking operations during data fetching
6. THE **Dashboard** SHALL display partial data if some queries fail (graceful degradation)
7. THE **Dashboard** SHALL provide smooth transitions between loading and loaded states
8. THE **Dashboard** SHALL use virtualization for long lists (if applicable)

### Requirement 11

**User Story:** As a user, I want accurate statistics on the dashboard, so that I can trust the data displayed.

#### Acceptance Criteria

1. THE **Dashboard** SHALL calculate all statistics from actual data (no hardcoded values)
2. THE task completion rate SHALL equal (completed tasks / total tasks) × 100
3. THE total time tracked SHALL equal the sum of all completed time entry durations
4. THE total budget SHALL equal the sum of all budget amounts
5. THE total spent SHALL equal the sum of all transaction amounts
6. THE active accounts count SHALL equal the number of accounts with is_active = true
7. THE Pomodoro stats SHALL match the data from the Pomodoro sessions table
8. THE **Dashboard** SHALL update statistics in real-time when underlying data changes
9. THE **Dashboard** SHALL handle edge cases (no data, division by zero, null values)
10. THE **Dashboard** SHALL display "0" or appropriate default values when no data exists

### Requirement 12

**User Story:** As a user, I want the dashboard to be responsive, so that I can use it on any device.

#### Acceptance Criteria

1. THE **Dashboard** SHALL display correctly on mobile devices (320px - 767px width)
2. THE **Dashboard** SHALL display correctly on tablet devices (768px - 1023px width)
3. THE **Dashboard** SHALL display correctly on desktop devices (1024px+ width)
4. THE statistics cards grid SHALL display 2 columns on mobile, 4 columns on tablet, 7 columns on desktop
5. THE quick actions grid SHALL display 2 columns on mobile, 3-4 columns on tablet, 7 columns on desktop
6. THE insights cards SHALL stack vertically on mobile and display side-by-side on desktop
7. THE header SHALL adjust layout for mobile (stack elements vertically)
8. THE **Dashboard** SHALL ensure all interactive elements are touch-friendly (44x44px minimum)
9. THE **Dashboard** SHALL handle landscape and portrait orientations on mobile devices
10. THE **Dashboard** SHALL avoid horizontal scrolling on any device

### Requirement 13

**User Story:** As a user, I want error handling on the dashboard, so that I can still use the app if some data fails to load.

#### Acceptance Criteria

1. WHEN a data fetch fails, THE **Dashboard** SHALL display an error toast notification
2. WHEN a data fetch fails, THE **Dashboard** SHALL display partial data for successful queries
3. WHEN a data fetch fails, THE **Dashboard** SHALL provide a retry button for failed queries
4. WHEN a data fetch fails, THE **Dashboard** SHALL log the error to console for debugging
5. WHEN all data fetches fail, THE **Dashboard** SHALL display an error state with retry option
6. THE **Dashboard** SHALL handle network errors gracefully
7. THE **Dashboard** SHALL handle authentication errors by redirecting to login
8. THE **Dashboard** SHALL display user-friendly error messages (no technical jargon)

### Requirement 14

**User Story:** As a user, I want smooth animations on the dashboard, so that the experience feels polished and engaging.

#### Acceptance Criteria

1. THE **Dashboard** SHALL use fade-in animations for all cards when they appear
2. THE **Dashboard** SHALL use stagger effect for cards (each card animates slightly after the previous)
3. THE **Dashboard** SHALL use scale and shadow effects on hover for interactive cards
4. THE **Dashboard** SHALL use smooth transitions between loading and loaded states
5. THE **Dashboard** SHALL use Framer Motion for all animations
6. THE animations SHALL not cause performance issues or jank
7. THE animations SHALL be disabled if user prefers reduced motion
8. THE Halloween decorations SHALL have smooth, continuous animations
