# Authentication System - Design

## Overview

This design document outlines the authentication system for Integral, built on Supabase Auth. The system provides secure user authentication through email/password and OAuth providers (Google, GitHub), manages user sessions with automatic persistence and refresh, and protects application routes based on authentication state. The design prioritizes security, user experience, and seamless integration with the existing application architecture.

## Architecture

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                     Auth Page                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Email/Pass   │  │    Google    │  │    GitHub    │  │
│  │    Form      │  │    OAuth     │  │    OAuth     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Auth                          │
│  • Validates credentials                                 │
│  • Creates/verifies user                                 │
│  • Generates JWT tokens                                  │
│  • Manages OAuth flow                                    │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Browser Storage (localStorage)              │
│  • Session tokens (JWT)                                  │
│  • Refresh tokens                                        │
│  • User metadata                                         │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    AuthContext                           │
│  • Subscribes to auth state changes                      │
│  • Provides user/session to app                          │
│  • Syncs state across tabs                               │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Route Protection                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Protected   │  │  Auth Route  │  │ Public Route │  │
│  │   Routes     │  │  (redirect)  │  │  (landing)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Design Rationale**: This architecture separates concerns cleanly: Supabase handles all authentication logic and security, AuthContext manages application state, and route wrappers enforce access control. This separation makes the system testable, maintainable, and secure.

### Component Hierarchy

```
App
├── QueryClientProvider
├── NetworkProvider
├── ThemeProvider
├── CurrencyProvider
├── AuthProvider ← Authentication state lives here
│   ├── FloatingWidgetProvider
│   ├── TooltipProvider
│   ├── Toaster
│   └── BrowserRouter
│       └── Routes
│           ├── PublicRoute (/, /privacy, /terms, /cookies, /assets)
│           ├── AuthRoute (/auth) ← Redirects if authenticated
│           └── ProtectedRoute (all app pages) ← Requires authentication
```

**Design Rationale**: AuthProvider wraps the entire application to make authentication state available everywhere. It's placed after theme/network providers but before routing to ensure auth state is available for route decisions.

## Components and Interfaces

### AuthContext

The AuthContext provides centralized authentication state management using React Context and Supabase's auth state listener.

**Interface**:

```typescript
interface AuthContextType {
  user: User | null; // Supabase User object or null
  session: Session | null; // Supabase Session object or null
  loading: boolean; // True during initial auth check
}
```

**Implementation Details**:

- **State Management**: Uses React useState for user, session, and loading states
- **Initialization**: Calls `supabase.auth.getSession()` on mount to restore existing session
- **Real-time Updates**: Subscribes to `supabase.auth.onAuthStateChange()` to handle:
  - SIGNED_IN: User logged in
  - SIGNED_OUT: User logged out
  - TOKEN_REFRESHED: Session refreshed
  - USER_UPDATED: User metadata changed
- **Cleanup**: Unsubscribes from auth state changes on unmount
- **Cross-tab Sync**: Supabase automatically syncs auth state across browser tabs via localStorage events

**Design Rationale**: The context provides read-only access to auth state. All mutations happen through Supabase client methods called directly in components, keeping the context simple and focused on state distribution.

### Auth Page Component

The Auth page provides a comprehensive authentication interface with multiple sign-in methods and theme support.

**Component Structure**:

```typescript
Auth Component
├── Theme Toggles (top-right)
│   ├── HalloweenAudioToggle
│   ├── HalloweenToggle
│   └── AnimatedThemeToggle
├── NavbarDecorations (Halloween mode)
├── GlassCard (main container)
│   ├── Halloween Decorations (conditional)
│   │   ├── Background image (fiery pumpkin)
│   │   ├── Animated witch
│   │   ├── Animated candles
│   │   └── Animated ghost
│   ├── OAuth Buttons
│   │   ├── Google Sign In
│   │   └── GitHub Sign In
│   ├── Divider ("Or continue with email")
│   ├── Demo Credentials Section
│   │   ├── Email with copy button
│   │   └── Password with copy button
│   └── Email/Password Form
│       ├── Full Name (signup only)
│       ├── Email
│       ├── Password (with visibility toggle)
│       ├── Error Display
│       ├── Submit Button
│       └── Mode Toggle (login ↔ signup)
```

**State Management**:

```typescript
const [isLogin, setIsLogin] = useState(true); // Toggle login/signup
const [email, setEmail] = useState(""); // Email input
const [password, setPassword] = useState(""); // Password input
const [fullName, setFullName] = useState(""); // Full name (signup)
const [loading, setLoading] = useState(false); // Operation in progress
const [error, setError] = useState(""); // Error message
const [showPassword, setShowPassword] = useState(false); // Password visibility
```

**Authentication Logic**:

```typescript
// Email/Password Sign In
await supabase.auth.signInWithPassword({ email, password });

// Email/Password Sign Up
await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: fullName } },
});

// OAuth Sign In
await supabase.auth.signInWithOAuth({
  provider: "google" | "github",
  options: { redirectTo: `${window.location.origin}/` },
});
```

**Auto-login After Signup**: When a user signs up, the component attempts to sign them in immediately. If `signUp` returns a session, the user is redirected. Otherwise, it attempts `signInWithPassword` to handle cases where email confirmation is disabled.

**Design Rationale**: The Auth page is self-contained with all authentication logic inline. This keeps the component simple and avoids over-abstraction. OAuth providers are configured to redirect back to the app root, where the AuthContext will detect the new session and route appropriately.

### Route Protection Components

Three route wrapper components enforce authentication requirements:

**ProtectedRoute**: Requires authentication

```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth" replace />;

  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
};
```

**AuthRoute**: Redirects authenticated users

```typescript
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
};
```

**PublicRoute**: Accessible to all users

```typescript
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();

  if (loading) return <Spinner />;

  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
};
```

**Design Rationale**: These wrappers provide declarative route protection. The loading state prevents flash of wrong content during auth check. The `replace` prop on Navigate prevents back button issues.

## Data Models

### Supabase User Object

```typescript
interface User {
  id: string; // UUID
  email: string; // User's email
  user_metadata: {
    // Custom metadata
    full_name?: string;
    [key: string]: any;
  };
  app_metadata: {
    // Supabase metadata
    provider?: string; // 'email', 'google', 'github'
    providers?: string[];
  };
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  aud: string; // Audience claim
  role: string; // User role
}
```

### Supabase Session Object

```typescript
interface Session {
  access_token: string; // JWT access token
  refresh_token: string; // Refresh token
  expires_in: number; // Seconds until expiry
  expires_at: number; // Unix timestamp
  token_type: "bearer";
  user: User; // User object
}
```

### Auth Form State

```typescript
interface AuthFormState {
  isLogin: boolean; // true = login, false = signup
  email: string; // Email input value
  password: string; // Password input value
  fullName: string; // Full name (signup only)
  loading: boolean; // Operation in progress
  error: string; // Error message to display
  showPassword: boolean; // Password visibility toggle
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Authentication State Consistency

_For any_ authentication operation (sign in, sign up, sign out), the AuthContext user state should accurately reflect the Supabase auth state after the operation completes.

**Validates: Requirements 1.1, 2.1, 2.2, 2.3, 4.5**

**Design Rationale**: The auth state must be consistent across the application. If Supabase says a user is authenticated, the AuthContext must reflect that, and vice versa.

### Property 2: Route Protection Enforcement

_For any_ protected route, an unauthenticated user should be redirected to /auth, and an authenticated user should be able to access the route.

**Validates: Requirements 4.1, 4.2**

**Design Rationale**: Route protection is the primary security mechanism. This property ensures unauthorized users cannot access protected features.

### Property 3: Auth Route Redirection

_For any_ authenticated user visiting the /auth route, the application should redirect to /dashboard.

**Validates: Requirements 2.6, 4.3**

**Design Rationale**: Authenticated users shouldn't see the login page. This prevents confusion and provides a better user experience.

### Property 4: Session Persistence

_For any_ authenticated session, refreshing the page should restore the user state without requiring re-authentication.

**Validates: Requirements 3.1, 3.2**

**Design Rationale**: Users expect to stay logged in across page refreshes. Session persistence is critical for good UX.

### Property 5: Cross-tab Synchronization

_For any_ authentication state change in one browser tab, all other tabs should reflect the same state change.

**Validates: Requirements 3.3**

**Design Rationale**: Users often have multiple tabs open. Auth state must be consistent across all tabs to prevent confusion and security issues.

### Property 6: Loading State Accuracy

_For any_ authentication check or operation, the loading state should be true during the operation and false after completion.

**Validates: Requirements 4.4, 7.1**

**Design Rationale**: Loading states prevent race conditions and provide user feedback. They must accurately reflect operation status.

### Property 7: Error Display Completeness

_For any_ authentication error, the application should display an error message to the user.

**Validates: Requirements 1.6, 2.5, 7.2**

**Design Rationale**: Users need feedback when operations fail. All errors must be caught and displayed in a user-friendly format.

### Property 8: OAuth Redirect Correctness

_For any_ OAuth authentication flow, the user should be redirected back to the application root after successful authentication.

**Validates: Requirements 2.2, 2.3**

**Design Rationale**: OAuth flows involve external redirects. The redirect URL must be correct to complete the authentication flow.

## Error Handling

### Error Categories

**Authentication Errors**:

- Invalid email format
- Invalid credentials (wrong password)
- User already exists (signup with existing email)
- Email not confirmed (if confirmation enabled)
- OAuth provider errors

**Network Errors**:

- Connection timeout
- Server unavailable
- Rate limiting

**Session Errors**:

- Session expired
- Invalid token
- Token refresh failed

### Error Display Strategy

**Inline Errors**: Displayed in a red alert box above the form

```typescript
{error && (
  <div className="text-red-400 text-xs sm:text-sm bg-red-400/10
                  border border-red-400/20 rounded-lg p-2.5 sm:p-3">
    {error}
  </div>
)}
```

**Toast Notifications**: Used for success messages (e.g., "Email copied to clipboard")

```typescript
toast.success("Email copied to clipboard");
```

**Design Rationale**: Inline errors keep the user's attention on the form. Toast notifications provide non-blocking feedback for secondary actions. Error messages come directly from Supabase for consistency.

### Error Recovery

- **Invalid Credentials**: User can retry with correct credentials
- **Network Errors**: User can retry the operation
- **Session Expired**: User is redirected to /auth to re-authenticate
- **OAuth Errors**: User can try a different authentication method

**Design Rationale**: All errors are recoverable without page refresh. The application never enters an unrecoverable error state.

## Testing Strategy

### Unit Testing

Unit tests will verify specific authentication behaviors:

- AuthContext initializes with loading=true, user=null
- AuthContext updates state when auth state changes
- ProtectedRoute redirects unauthenticated users
- AuthRoute redirects authenticated users
- PublicRoute renders for all users
- Error messages display correctly
- Loading states toggle correctly

### Property-Based Testing

Property-based tests will verify universal properties across the authentication system:

- **Property Testing Library**: fast-check (JavaScript/TypeScript PBT library)
- **Minimum iterations**: 100 runs per property test
- **Test annotation format**: `**Feature: authentication-system, Property {number}: {property_text}**`

Each correctness property will be implemented as a property-based test to verify it holds across various inputs and scenarios.

### Integration Testing

- Complete sign-up flow (email/password)
- Complete sign-in flow (email/password)
- OAuth flow (Google, GitHub)
- Session persistence across page refresh
- Cross-tab session synchronization
- Route protection for all protected routes
- Auth route redirection
- Sign-out flow

**Design Rationale**: Unit tests catch specific bugs, property tests verify general correctness, and integration tests ensure all pieces work together end-to-end.

## Security Considerations

### Password Security

- **No Client-side Storage**: Passwords are never stored in browser storage
- **No Logging**: Passwords are never logged to console or analytics
- **HTTPS Only**: All authentication requests use HTTPS in production
- **Supabase Hashing**: Passwords are hashed with bcrypt by Supabase

**Design Rationale**: Password security is handled entirely by Supabase. The client never sees or stores password hashes.

### Token Security

- **HttpOnly Cookies**: Supabase can be configured to use HttpOnly cookies (not currently enabled)
- **localStorage**: Tokens stored in localStorage (default Supabase behavior)
- **Automatic Refresh**: Tokens automatically refresh before expiry
- **Secure Transmission**: All tokens transmitted over HTTPS

**Design Rationale**: localStorage is acceptable for SPAs with proper HTTPS. HttpOnly cookies provide additional security but complicate mobile app integration.

### Row-Level Security

All database tables have RLS policies that restrict access based on `auth.uid()`:

```sql
CREATE POLICY "Users can view their own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data"
ON table_name FOR DELETE
USING (auth.uid() = user_id);
```

**Design Rationale**: RLS enforces security at the database level, making it impossible to bypass through API manipulation. This is the most secure approach for multi-tenant applications.

## Performance Considerations

### Initial Load Performance

- **Session Check**: < 500ms (cached in localStorage)
- **Auth State Subscription**: Immediate (synchronous)
- **Route Decision**: Immediate after session check

**Optimization Strategies**:

- Session restored from localStorage (no network request)
- Loading spinner prevents flash of wrong content
- Lazy loading for route components reduces initial bundle

**Design Rationale**: Fast initial load is critical for perceived performance. Caching the session in localStorage eliminates network latency.

### Authentication Operation Performance

- **Email/Password Sign In**: 1-2 seconds (network request to Supabase)
- **OAuth Sign In**: 2-5 seconds (redirect to provider and back)
- **Sign Out**: < 500ms (local operation + network request)

**Optimization Strategies**:

- Optimistic UI updates (disable button immediately)
- Loading states provide feedback
- Error handling prevents hanging states

**Design Rationale**: Authentication operations involve network requests and are inherently slower. Clear loading states manage user expectations.

## Accessibility

### Keyboard Navigation

- All form inputs are keyboard accessible
- Tab order follows visual order
- Enter key submits form
- Escape key can close modals (if added)

### Screen Reader Support

- All inputs have associated labels
- Error messages are announced
- Loading states are announced
- Buttons have descriptive text

### Visual Accessibility

- High contrast text colors
- Focus indicators on all interactive elements
- Error messages use color + text (not color alone)
- Sufficient touch target sizes (44x44px minimum)

**Design Rationale**: Accessibility is built in from the start, not added later. All users should be able to authenticate regardless of ability.

## Theme Integration

### Dark Mode

- Dark background colors
- Light text colors
- Purple accent color (#8B5CF6)
- Subtle borders and shadows

### Light Mode

- Light background colors
- Dark text colors
- Purple accent color (#8B5CF6)
- Defined borders and shadows

### Halloween Mode

- Teal accent color (#60c9b6)
- Animated decorations (witch, ghost, candles)
- Pumpkin background image
- Glowing effects on borders
- Creepster font for titles (if added)

**Design Rationale**: The auth page respects the user's theme preference, providing a consistent experience across the entire application. Halloween mode adds delight without compromising usability.
