# Accounts - Design

## Overview

The Accounts feature provides comprehensive secure credential storage with encrypted passwords, usage tracking with automatic reset periods, folder organization, activity logging, and calendar visualization. The design emphasizes security, ease of access, and usage monitoring to help users manage multiple accounts and stay within usage limits.

**Key Design Decisions:**

1. **Password Security**: Passwords encrypted at rest by Supabase, masked by default in UI, secure clipboard operations
2. **Optimistic Updates**: All mutations update the UI immediately before server confirmation to provide instant feedback, with automatic rollback on failure
3. **Automatic Usage Reset**: Usage automatically resets based on configured period (daily, weekly, monthly, yearly) when viewing accounts
4. **Shared Folders**: Folders are shared between accounts and notes, providing unified organization across features
5. **Usage Tracking**: Comprehensive usage logging with progress indicators, calendar view, and activity history
6. **URL State Synchronization**: Tab selection and folder views are reflected in the URL, enabling bookmarking and browser navigation

## Architecture

### Data Flow

```
User Creates Account → Encrypt Password → Save to Database → Display (Masked)
User Views Account → Check Reset → Decrypt Password → Show/Hide Toggle → Copy to Clipboard
User Logs Usage → Create Log → Update Current Usage → Recalculate Progress
```

## Database Schema

### accounts table

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  folder_id UUID REFERENCES folders,
  title VARCHAR(255) NOT NULL,
  platform VARCHAR(255) NOT NULL,
  email_username VARCHAR(255) NOT NULL,
  password TEXT NOT NULL, -- Encrypted by Supabase
  usage_type VARCHAR(20) DEFAULT 'custom' CHECK (usage_type IN ('custom', 'daily', 'weekly', 'monthly', 'yearly')),
  usage_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  reset_period VARCHAR(20) DEFAULT 'monthly' CHECK (reset_period IN ('daily', 'weekly', 'monthly', 'yearly', 'never')),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_platform_email UNIQUE(user_id, platform, email_username)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_folder_id ON accounts(folder_id);
CREATE INDEX idx_accounts_created_at ON accounts(created_at DESC);
CREATE INDEX idx_accounts_platform ON accounts(user_id, platform);
```

### account_usage_logs table

```sql
CREATE TABLE account_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  account_id UUID REFERENCES accounts ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_account_usage_logs_user_id ON account_usage_logs(user_id);
CREATE INDEX idx_account_usage_logs_account_id ON account_usage_logs(account_id);
CREATE INDEX idx_account_usage_logs_timestamp ON account_usage_logs(timestamp DESC);
```

### folders table (shared with notes)

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('note', 'account')),
  parent_id UUID REFERENCES folders,
  color VARCHAR(7) DEFAULT '#8B5CF6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_type ON folders(user_id, type);
```

**Rationale**:

- `password` encrypted at rest by Supabase for security
- `usage_type` and `reset_period` as enums for data integrity
- Unique constraint on (user_id, platform, email_username) prevents duplicates
- Cascade delete on usage logs ensures cleanup
- Indexes on user_id, folder_id, and timestamps for efficient queries

## Type Definitions

```typescript
interface Account {
  id: string;
  user_id: string;
  folder_id?: string | null;
  folder?: Folder | null;
  title: string;
  platform: string;
  email_username: string;
  password: string; // Encrypted
  usage_type: "custom" | "daily" | "weekly" | "monthly" | "yearly";
  usage_limit?: number | null;
  current_usage: number;
  reset_period: "daily" | "weekly" | "monthly" | "yearly" | "never";
  description?: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UsageLog {
  id: string;
  user_id: string;
  account_id: string;
  account?: {
    title: string;
    platform: string;
  };
  amount: number;
  description?: string | null;
  timestamp: string;
}

interface Folder {
  id: string;
  user_id: string;
  name: string;
  type: "note" | "account";
  parent_id?: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

interface AccountFormData {
  title: string;
  platform: string;
  email_username: string;
  password: string;
  usage_type: "custom" | "daily" | "weekly" | "monthly" | "yearly";
  usage_limit?: number;
  reset_period: "daily" | "weekly" | "monthly" | "yearly" | "never";
  description?: string;
  tags: string[];
  folder_id?: string;
}

interface UsageLogFormData {
  amount: number;
  description?: string;
}
```

**Rationale**: Explicit types improve type safety. Nullable fields allow optional features. Tags as array enables efficient filtering.

## Component Structure

### Pages

- **Accounts.tsx**: Main accounts page with tab navigation, folder sidebar, URL state management, and view switching

### Components

#### Account Components

- **AccountGrid**: Grid layout of account cards with virtualization
- **AccountList**: List layout of account rows with virtualization
- **AccountCard**: Individual account card with masked password, usage progress, and actions
- **AccountRow**: Individual account row for list view
- **CreateAccountModal**: Create new account form with all fields
- **ViewAccountModal**: View account details with show/hide password, copy buttons, and usage logs
- **EditAccountModal**: Edit account form with validation
- **DeleteAccountModal**: Delete confirmation with account details

#### Usage Components

- **LogUsageModal**: Log usage form with amount and description
- **EditUsageModal**: Edit usage log form
- **UsageActivityView**: List of all usage logs with filters and search
- **UsageActivityCard**: Individual usage log card with edit/delete actions
- **AccountUsageCalendar**: Monthly calendar view with usage logs
- **DayLogsModal**: View usage logs for a specific day

#### Shared Components

- **FolderSidebar**: Folder navigation (shared with notes)
- **CreateFolderModal**: Create/edit folder form (shared with notes)

### Hooks

#### Query Hooks

- **useAccounts**: Fetch accounts, create/update/delete accounts with TanStack Query
- **useUsageLogs**: Fetch usage logs, create/update/delete logs with TanStack Query
- **useFolders**: Fetch folders, create/update/delete folders with TanStack Query (shared with notes)

#### Utility Hooks

- **useUsageReset**: Check and perform automatic usage reset based on period
- **useAccountFiltering**: Filter and search logic with memoization

## State Management

### TanStack Query Configuration

```typescript
// Query Keys
const accountKeys = {
  accounts: (userId: string) => ["accounts", userId] as const,
  usageLogs: (userId: string) => ["account-usage-logs", userId] as const,
  folders: (userId: string, type: string) => ["folders", userId, type] as const,
};

// Query Options
const queryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
};
```

### Optimistic Update Pattern

```typescript
// Account Creation
onMutate: async (newAccount) => {
  await queryClient.cancelQueries({ queryKey: accountKeys.accounts(userId) });
  const previousAccounts = queryClient.getQueryData(accountKeys.accounts(userId));

  queryClient.setQueryData(accountKeys.accounts(userId), (old) => [
    newAccount,
    ...old,
  ]);

  return { previousAccounts };
},
onError: (err, newAccount, context) => {
  queryClient.setQueryData(accountKeys.accounts(userId), context.previousAccounts);
  toast.error("Failed to create account");
},

// Usage Log Creation
onMutate: async (newLog) => {
  await queryClient.cancelQueries({ queryKey: accountKeys.usageLogs(userId) });
  const previousLogs = queryClient.getQueryData(accountKeys.usageLogs(userId));

  // Update usage logs
  queryClient.setQueryData(accountKeys.usageLogs(userId), (old) => [
    newLog,
    ...old,
  ]);

  // Update account current_usage
  queryClient.setQueryData(accountKeys.accounts(userId), (old) =>
    old.map((account) =>
      account.id === newLog.account_id
        ? { ...account, current_usage: account.current_usage + newLog.amount }
        : account
    )
  );

  return { previousLogs };
},
onError: (err, newLog, context) => {
  queryClient.setQueryData(accountKeys.usageLogs(userId), context.previousLogs);
  toast.error("Failed to log usage");
},
```

**Rationale**: Optimistic updates provide instant feedback. Rollback on error maintains data consistency. Usage log creation updates both logs and account usage.

### URL State Management

```typescript
// Tab State
const [searchParams, setSearchParams] = useSearchParams();
const activeTab = (searchParams.get("tab") as TabType) || "accounts";

const handleTabChange = (tab: TabType) => {
  setSearchParams({ tab }, { replace: true });
};

// Folder State
const folderId = searchParams.get("folder");
const selectedFolder = folders?.find((f) => f.id === folderId);

const handleFolderClick = (folder: Folder) => {
  setSearchParams({ tab: "accounts", folder: folder.id }, { replace: true });
};

const handleClearFolder = () => {
  setSearchParams({ tab: "accounts" }, { replace: true });
};
```

**Rationale**: URL state enables bookmarking, sharing, and browser navigation. Replace mode prevents cluttering history.

## Security Implementation

### Password Handling

```typescript
// Password is encrypted at rest by Supabase
// No additional client-side encryption needed for basic security
// For enhanced security, could implement client-side encryption:

// Display (masked by default)
const [showPassword, setShowPassword] = useState(false);

<input
  type={showPassword ? 'text' : 'password'}
  value={account.password}
  readOnly
  className="font-mono"
/>
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

### Copy to Clipboard

```typescript
const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch (err) {
    console.error("Failed to copy:", err);
    toast.error(`Failed to copy ${label}`);
  }
};

// Usage
<button onClick={() => copyToClipboard(account.password, "Password")}>
  <Copy className="w-4 h-4" />
</button>
<button onClick={() => copyToClipboard(account.email_username, "Email")}>
  <Copy className="w-4 h-4" />
</button>
```

**Rationale**: Supabase handles encryption at rest. Masked display prevents shoulder surfing. Secure clipboard API with error handling.

## Usage Reset Logic

### Reset Check Function

```typescript
const shouldResetUsage = (account: Account): boolean => {
  const lastUpdate = new Date(account.updated_at);
  const now = new Date();

  switch (account.reset_period) {
    case "daily":
      return now.toDateString() !== lastUpdate.toDateString();

    case "weekly":
      const nowWeek = getWeek(now);
      const lastWeek = getWeek(lastUpdate);
      return (
        nowWeek !== lastWeek || now.getFullYear() !== lastUpdate.getFullYear()
      );

    case "monthly":
      return (
        now.getMonth() !== lastUpdate.getMonth() ||
        now.getFullYear() !== lastUpdate.getFullYear()
      );

    case "yearly":
      return now.getFullYear() !== lastUpdate.getFullYear();

    case "never":
    default:
      return false;
  }
};

const getWeek = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};
```

### Auto-reset on View

```typescript
const checkAndResetUsage = async (account: Account) => {
  if (shouldResetUsage(account)) {
    await updateAccount(account.id, {
      current_usage: 0,
      updated_at: new Date().toISOString(),
    });

    // Optional: Show notification
    toast.info(`Usage reset for ${account.title}`);
  }
};

// Call when viewing account details
useEffect(() => {
  if (selectedAccount) {
    checkAndResetUsage(selectedAccount);
  }
}, [selectedAccount]);
```

**Rationale**: Automatic reset based on period ensures users don't have to manually track. Reset on view ensures timely updates without background jobs.

## Usage Progress Calculation

### Progress Bar Logic

```typescript
const calculateUsageProgress = (account: Account) => {
  if (!account.usage_limit || account.usage_limit === 0) {
    return { percentage: 0, color: "gray", status: "No limit" };
  }

  const percentage = (account.current_usage / account.usage_limit) * 100;

  let color: string;
  let status: string;

  if (percentage < 50) {
    color = "green";
    status = "Good";
  } else if (percentage < 80) {
    color = "yellow";
    status = "Warning";
  } else if (percentage < 100) {
    color = "orange";
    status = "High";
  } else {
    color = "red";
    status = "Exceeded";
  }

  return { percentage: Math.min(percentage, 100), color, status };
};
```

### Progress Bar Component

```typescript
const UsageProgressBar: React.FC<{ account: Account }> = ({ account }) => {
  const { percentage, color, status } = calculateUsageProgress(account);

  const colorClasses = {
    gray: 'bg-gray-400',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{account.current_usage} / {account.usage_limit || '∞'}</span>
        <span className={`font-medium text-${color}-600`}>{status}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

**Rationale**: Color-coded progress provides quick visual feedback. Percentage capped at 100% for display. Status labels help users understand usage level.

## UI Design

### Tab Navigation

Three tabs with animated indicator and URL synchronization:

1. **Accounts**: Grid or list view with folder sidebar
2. **Activity**: Usage logs list with filters
3. **Calendar**: Monthly calendar view with usage logs

**URL Pattern**: `/accounts?tab=accounts&folder=uuid` or `/accounts?tab=activity`

**Rationale**: URL state enables bookmarking specific views and browser back/forward navigation.

### Account Card (Grid View)

Display elements:

- Title (bold, truncated to 1 line)
- Platform badge with icon
- Email/username (truncated)
- Password (masked: ••••••••)
- Show/hide password toggle button
- Copy password button
- Copy email button
- Usage progress bar (if usage_limit set)
- Tags (max 3 visible, "..." if more)
- Folder color indicator (left border)
- Click handler to open detail modal

### Account Row (List View)

Display elements:

- Title (bold)
- Platform badge
- Email/username
- Usage indicator (percentage or "No limit")
- Action buttons (view, edit, delete)
- Folder color indicator (left border)

### Account Form

Fields:

- Title input (required)
- Platform input (required)
- Email/username input (required)
- Password input (required, type="password")
- Usage type selector (custom, daily, weekly, monthly, yearly)
- Usage limit input (number, optional)
- Reset period selector (daily, weekly, monthly, yearly, never)
- Description textarea (optional)
- Tags input (comma-separated, optional)
- Folder selector dropdown (optional)

Validation:

- Title: non-empty
- Platform: non-empty
- Email/username: non-empty
- Password: non-empty, minimum 1 character
- Usage limit: positive integer if provided
- Unique constraint: (user_id, platform, email_username)

### Usage Log Form

Fields:

- Amount input (required, positive integer)
- Description input (optional)
- Current usage display (read-only)
- Usage limit display (read-only)
- Progress bar preview

Validation:

- Amount: required, positive integer

### Folder Sidebar

Display elements:

- "All Accounts" option (shows all)
- List of folders with:
  - Folder name
  - Folder color indicator
  - Account count badge
- "Create Folder" button
- Collapsible on mobile

### View Toggle

- Grid icon button
- List icon button
- Active state indicator
- Persisted in localStorage

### Search Bar

- Search input with icon
- Placeholder: "Search accounts..."
- Keyboard shortcut indicator (Ctrl+K)
- Clear button (when text present)
- Debounced by 300ms

## Filtering & Sorting Logic

### Account Filtering

```typescript
const filterAccounts = (
  accounts: Account[],
  filters: {
    searchTerm: string;
    selectedFolderId?: string;
  }
) => {
  let filtered = [...accounts];

  // Folder filter
  if (filters.selectedFolderId) {
    filtered = filtered.filter(
      (account) => account.folder_id === filters.selectedFolderId
    );
  }

  // Search filter
  if (filters.searchTerm.trim()) {
    const search = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (account) =>
        account.title.toLowerCase().includes(search) ||
        account.platform.toLowerCase().includes(search) ||
        account.email_username.toLowerCase().includes(search) ||
        account.tags.some((tag) => tag.toLowerCase().includes(search)) ||
        account.description?.toLowerCase().includes(search)
    );
  }

  return filtered;
};
```

### Usage Log Filtering

```typescript
const filterUsageLogs = (
  logs: UsageLog[],
  filters: {
    searchTerm: string;
    selectedAccountId?: string;
    dateRange: { start: string; end: string };
    sortBy: "date-desc" | "date-asc" | "amount";
  }
) => {
  let filtered = [...logs];

  // Account filter
  if (filters.selectedAccountId) {
    filtered = filtered.filter(
      (log) => log.account_id === filters.selectedAccountId
    );
  }

  // Search filter
  if (filters.searchTerm.trim()) {
    const search = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.description?.toLowerCase().includes(search) ||
        log.account?.title?.toLowerCase().includes(search) ||
        log.account?.platform?.toLowerCase().includes(search)
    );
  }

  // Date range filter
  if (filters.dateRange.start) {
    filtered = filtered.filter(
      (log) => new Date(log.timestamp) >= new Date(filters.dateRange.start)
    );
  }

  if (filters.dateRange.end) {
    filtered = filtered.filter(
      (log) => new Date(log.timestamp) <= new Date(filters.dateRange.end)
    );
  }

  // Sort
  switch (filters.sortBy) {
    case "date-asc":
      filtered.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      break;
    case "amount":
      filtered.sort((a, b) => b.amount - a.amount);
      break;
    case "date-desc":
    default:
      filtered.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      break;
  }

  return filtered;
};
```

**Rationale**: Filters use AND logic to progressively narrow results. Case-insensitive search. Multiple sort options for flexibility.

## Navigation Flow

```
Accounts Page
  ├─ Sidebar: Folders
  │   ├─ All Accounts
  │   ├─ Folder 1 (count)
  │   ├─ Folder 2 (count)
  │   └─ Create Folder → Folder Creation Modal
  │
  ├─ Tab: Accounts (default)
  │   ├─ Search Bar (Ctrl+K)
  │   ├─ View Toggle (Grid/List)
  │   ├─ New Account Button
  │   ├─ Account Cards/Rows
  │   │   └─ Click → View Account Modal
  │   │       ├─ Show/hide password
  │   │       ├─ Copy password
  │   │       ├─ Copy email
  │   │       ├─ View usage logs
  │   │       ├─ Edit → Edit Account Modal
  │   │       ├─ Delete → Delete Confirmation Modal
  │   │       └─ Log Usage → Log Usage Modal
  │   └─ Empty State (if no accounts)
  │
  ├─ Tab: Activity
  │   ├─ Filters (Account, Date Range, Search)
  │   ├─ Sort Options (Date, Amount)
  │   ├─ Usage Log Cards
  │   │   ├─ Edit → Edit Usage Modal
  │   │   └─ Delete → Delete Confirmation Modal
  │   └─ Empty State (if no logs)
  │
  └─ Tab: Calendar
      ├─ Monthly Calendar View
      ├─ Navigate Months (Previous/Next)
      ├─ Usage indicators on dates
      └─ Click Date → Day Logs Modal
          ├─ View logs for date
          ├─ Edit logs
          └─ Delete logs
```

## Calendar View

### Calendar Component

```typescript
const AccountUsageCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { usageLogs } = useUsageLogs();

  // Group logs by date
  const logsByDate = useMemo(() => {
    const grouped: Record<string, UsageLog[]> = {};

    usageLogs.forEach((log) => {
      const date = new Date(log.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });

    return grouped;
  }, [usageLogs]);

  const getDayContent = (date: Date) => {
    const dateStr = date.toDateString();
    const logs = logsByDate[dateStr] || [];

    if (logs.length === 0) return null;

    const totalAmount = logs.reduce((sum, log) => sum + log.amount, 0);

    return (
      <div className="text-xs">
        <div className="font-semibold">{totalAmount}</div>
        <div className="text-gray-500">{logs.length} logs</div>
      </div>
    );
  };

  return (
    <DayPicker
      mode="single"
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      modifiers={{
        hasLogs: (date) => !!logsByDate[date.toDateString()],
      }}
      modifiersStyles={{
        hasLogs: { backgroundColor: '#60c9b6', color: 'white' },
      }}
      components={{
        DayContent: ({ date }) => getDayContent(date),
      }}
    />
  );
};
```

**Rationale**: Calendar provides visual overview of usage patterns. Color-coding and amounts help identify high-usage days.

## Form Validation

### Account Form Validation Rules

```typescript
const accountValidation = {
  title: {
    required: "Title is required",
    minLength: { value: 1, message: "Title cannot be empty" },
  },
  platform: {
    required: "Platform is required",
    minLength: { value: 1, message: "Platform cannot be empty" },
  },
  email_username: {
    required: "Email/username is required",
    minLength: { value: 1, message: "Email/username cannot be empty" },
  },
  password: {
    required: "Password is required",
    minLength: { value: 1, message: "Password cannot be empty" },
  },
  usage_limit: {
    min: { value: 1, message: "Usage limit must be positive" },
  },
};
```

### Usage Log Form Validation Rules

```typescript
const usageLogValidation = {
  amount: {
    required: "Amount is required",
    min: { value: 1, message: "Amount must be positive" },
  },
};
```

**Rationale**: React Hook Form with validation provides type-safe validation with clear error messages. Inline errors guide users to fix issues before submission.

## Error Handling

### Validation Errors

- Account: Title, platform, email/username, password required
- Usage log: Amount required and positive
- Display inline error messages below fields
- Prevent form submission until valid
- Highlight invalid fields with red border

### Network Errors

- Display toast notification with error message
- Rollback optimistic updates
- Provide retry option for failed operations
- Show offline indicator if network unavailable
- Log errors to console for debugging

### Unique Constraint Errors

- Detect duplicate (user_id, platform, email_username)
- Display specific error message: "An account with this platform and email already exists"
- Suggest editing existing account instead
- Provide link to existing account (if possible)

### Security Errors

- Clipboard API not available → Show fallback message
- Password encryption failed → Show error and prevent save
- HTTPS not enforced → Show security warning

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Account CRUD Operations

_For any_ account creation, the account appears in the list immediately and persists to database.

```typescript
createAccount(data) → accounts.includes(newAccount) === true (before server response)
```

_For any_ account update, the changes appear immediately and persist to database.

```typescript
updateAccount(id, updates) → account.field === updates.field (before server response)
```

_For any_ account deletion, the account disappears immediately and is removed from database.

```typescript
deleteAccount(id) → accounts.includes(account) === false (before server response)
```

**Validates**: Requirements 1.10, 1.11, 4.4, 5.4, 5.5, 15.2, 15.3, 15.4

### Property 2: Unique Constraint Enforcement

_For any_ account, the combination of (user_id, platform, email_username) is unique.

```typescript
accounts.every((a1, i) =>
  accounts.every(
    (a2, j) =>
      i === j ||
      !(
        a1.user_id === a2.user_id &&
        a1.platform === a2.platform &&
        a1.email_username === a2.email_username
      )
  )
);
```

**Validates**: Requirements 1.12, 4.5

### Property 3: Password Security

_For any_ account, the password is never logged in console or error messages.

```typescript
console.log(account) → output does not contain account.password
error.message → does not contain account.password
```

_For any_ account, the password is masked by default in the UI.

```typescript
showPassword === false → displayedPassword === "••••••••"
showPassword === true → displayedPassword === account.password
```

**Validates**: Requirements 13.2, 13.3, 13.4

### Property 4: Usage Tracking Accuracy

_For any_ usage log creation, the account's current_usage increases by the log amount.

```typescript
createUsageLog(accountId, amount) →
  account.current_usage === previousUsage + amount
```

_For any_ usage log deletion, the account's current_usage decreases by the log amount.

```typescript
deleteUsageLog(logId) →
  account.current_usage === previousUsage - log.amount
```

_For any_ usage log update, the account's current_usage adjusts by the difference.

```typescript
updateUsageLog(logId, newAmount) →
  account.current_usage === previousUsage - oldAmount + newAmount
```

**Validates**: Requirements 6.5, 9.3, 9.5

### Property 5: Usage Progress Calculation

_For any_ account with usage_limit, the usage percentage equals (current_usage / usage_limit) \* 100.

```typescript
account.usage_limit > 0 →
  usagePercentage === (account.current_usage / account.usage_limit) * 100
```

_For any_ usage percentage, the color coding is correct.

```typescript
percentage < 50 → color === 'green'
50 <= percentage < 80 → color === 'yellow'
80 <= percentage < 100 → color === 'orange'
percentage >= 100 → color === 'red'
```

**Validates**: Requirements 6.6, 6.7, 6.8

### Property 6: Automatic Usage Reset

_For any_ account with reset_period "daily", usage resets when the current date differs from updated_at date.

```typescript
account.reset_period === 'daily' &&
  now.toDateString() !== lastUpdate.toDateString() →
  account.current_usage === 0
```

_For any_ account with reset_period "monthly", usage resets when the current month differs from updated_at month.

```typescript
account.reset_period === 'monthly' &&
  (now.getMonth() !== lastUpdate.getMonth() ||
   now.getFullYear() !== lastUpdate.getFullYear()) →
  account.current_usage === 0
```

_For any_ account with reset_period "never", usage never resets automatically.

```typescript
account.reset_period === 'never' →
  account.current_usage remains unchanged
```

**Validates**: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7

### Property 7: Folder Association

_For any_ account with folder_id, the account appears in that folder's account list.

```typescript
account.folder_id === folderId →
  folderAccounts.includes(account) === true
```

_For any_ folder, the account count equals the number of accounts with that folder_id.

```typescript
folder.accountCount ===
  accounts.filter((a) => a.folder_id === folder.id).length;
```

_For any_ folder deletion, associated accounts become unassociated (folder_id = null).

```typescript
deleteFolder(id) →
  accounts.filter(a => a.folder_id === id).every(a => a.folder_id === null)
```

**Validates**: Requirements 11.3, 11.9

### Property 8: Search and Filter Logic

_For any_ search query, all returned accounts match the query in title, platform, email/username, tags, or description.

```typescript
filteredAccounts.every(
  (a) =>
    a.title.includes(query) ||
    a.platform.includes(query) ||
    a.email_username.includes(query) ||
    a.tags.some((t) => t.includes(query)) ||
    a.description?.includes(query)
);
```

_For any_ folder filter, all returned accounts have the selected folder_id.

```typescript
selectedFolderId !== null →
  filteredAccounts.every(a => a.folder_id === selectedFolderId)
```

_For any_ combination of filters, the result set satisfies all filter conditions (AND logic).

```typescript
filtered.every((a) => matchesSearch(a) && matchesFolderFilter(a));
```

**Validates**: Requirements 12.1, 12.3, 12.5, 12.7

### Property 9: Copy to Clipboard

_For any_ copy operation, the clipboard contains the copied text.

```typescript
copyToClipboard(text) succeeds →
  navigator.clipboard.readText() === text
```

_For any_ successful copy, a success toast is displayed.

```typescript
copyToClipboard(text) succeeds → toastDisplayed === true
```

_For any_ failed copy, an error toast is displayed.

```typescript
copyToClipboard(text) fails → errorToastDisplayed === true
```

**Validates**: Requirements 3.5, 3.6, 13.5, 13.6, 13.7

### Property 10: URL State Synchronization

_For any_ tab selection, the URL contains the tab query parameter with the selected tab name.

```typescript
setActiveTab(tab) → window.location.search.includes(`tab=${tab}`)
```

_For any_ folder selection, the URL contains the folder query parameter with the folder ID.

```typescript
selectFolder(folder) → window.location.search.includes(`folder=${folder.id}`)
```

_For any_ URL with tab or folder parameters, loading the page restores the corresponding view.

```typescript
window.location.search.includes("tab=activity") → activeTab === "activity"
window.location.search.includes("folder=uuid") → selectedFolder.id === "uuid"
```

_For any_ browser back/forward navigation, the application state matches the URL parameters.

```typescript
browserBack() → applicationState === stateFromURL(window.location.search)
```

**Validates**: Requirements 16.1, 16.2, 16.3, 16.4, 16.5

## Testing Strategy

### Unit Tests

- Account CRUD operations
- Usage log CRUD operations
- Usage reset logic
- Usage progress calculation
- Password masking/unmasking
- Copy to clipboard
- Filter and search logic
- Validation rules

### Property-Based Tests

- Property 2: Unique constraint (generate random accounts, verify uniqueness)
- Property 4: Usage tracking accuracy (generate random usage logs, verify current_usage)
- Property 5: Usage progress calculation (generate random usage values, verify percentage and color)
- Property 6: Automatic usage reset (generate random dates and reset periods, verify reset logic)
- Property 8: Search and filter logic (generate random filters, verify AND logic)

### Integration Tests

- Create account → View account → Edit account → Delete account
- Log usage → Edit usage log → Delete usage log → Verify current_usage
- Create folder → Assign accounts → Delete folder → Verify accounts unassociated
- Search accounts → Filter by folder → Verify results
- Copy password → Verify clipboard → Show/hide password → Verify display

### End-to-End Tests

- Complete account management workflow
- Usage tracking and reset workflow
- Folder organization workflow
- Calendar view navigation
- Error handling and recovery
- Security features (password masking, clipboard)
