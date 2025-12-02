import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import path from "path";
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/Tooltip.tsx";
import { Toaster } from "@/components/ui/toast/Sonner.tsx";
import { FloatingTimerWidget } from "./components/FloatingTimerWidget";
import { Layout } from "./components/Layout";
import { SearchModal } from "./components/SearchModal";
import { Spinner } from "./components/Spinner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { FloatingWidgetProvider } from "./contexts/FloatingWidgetContext";
import { IconPickerProvider } from "./contexts/IconPickerContext";
import { NetworkProvider } from "./contexts/NetworkContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import { Auth } from "./pages/Auth";

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Notes = lazy(() =>
  import("./pages/Notes.tsx").then((m) => ({ default: m.Notes })),
);

const NotFound = lazy(() => import("./pages/NotFound"));
const Accounts = lazy(() =>
  import("./pages/Accounts").then((m) => ({ default: m.Accounts })),
);
const Tasks = lazy(() =>
  import("./pages/Tasks.tsx").then((m) => ({ default: m.Tasks })),
);
const Time = lazy(() =>
  import("./pages/Time").then((m) => ({ default: m.Time })),
);
const Journal = lazy(() =>
  import("./pages/Journal").then((m) => ({ default: m.Journal })),
);
const Pomodoro = lazy(() =>
  import("./pages/Pomodoro").then((m) => ({ default: m.Pomodoro })),
);
const Finances = lazy(() =>
  import("./pages/Finances").then((m) => ({ default: m.Finances })),
);
const AuthPage = lazy(() =>
  import("./pages/Auth").then((m) => ({ default: m.Auth })),
);
const Landing = lazy(() =>
  import("./pages/Landing").then((m) => ({ default: m.Landing })),
);
const Privacy = lazy(() =>
  import("./pages/Privacy").then((m) => ({ default: m.Privacy })),
);
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const HalloweenAssets = lazy(() =>
  import("./pages/HalloweenAssets").then((m) => ({
    default: m.HalloweenAssets,
  })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      networkMode: "online",
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  useDocumentTitle();
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NetworkProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <IconPickerProvider>
              <FloatingWidgetProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter>
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <PublicRoute>
                            <Landing />
                          </PublicRoute>
                        }
                      />
                      <Route
                        path="/privacy"
                        element={
                          <Suspense fallback={<Spinner />}>
                            <Privacy />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/terms"
                        element={
                          <Suspense fallback={<Spinner />}>
                            <Terms />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/cookies"
                        element={
                          <Suspense fallback={<Spinner />}>
                            <Cookies />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/assets"
                        element={
                          <Suspense fallback={<Spinner />}>
                            <HalloweenAssets />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/auth"
                        element={
                          <AuthRoute>
                            <AuthPage />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Dashboard />
                              <FloatingTimerWidget />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/notes"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Notes />
                              <FloatingTimerWidget />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/accounts"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Accounts />
                              <FloatingTimerWidget />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tasks"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Tasks />
                              <FloatingTimerWidget />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/time"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Time />
                              <FloatingTimerWidget />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/journal"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Journal />
                              <FloatingTimerWidget />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/pomodoro"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Pomodoro />
                              <FloatingTimerWidget />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/finances"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Finances />
                              <FloatingTimerWidget />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="*"
                        element={
                          <PublicRoute>
                            <NotFound />
                          </PublicRoute>
                        }
                      />
                    </Routes>
                  </BrowserRouter>
                  <SearchModal />
                </TooltipProvider>
              </FloatingWidgetProvider>
            </IconPickerProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </NetworkProvider>
  </QueryClientProvider>
);

export default App;
