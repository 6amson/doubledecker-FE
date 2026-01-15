import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import QueryBuilder from "./pages/QueryBuilder";
import QueryResults from "./pages/QueryResults";
import SavedQueries from "./pages/SavedQueries";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Auth/Login";
import { Signup } from "./pages/Auth/Signup";
import { MobileBlocker } from "./components/MobileBlocker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="doubledecker-theme">
      <TooltipProvider>
        <AuthProvider>
          <MobileBlocker />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/query-builder" element={
                <ProtectedRoute>
                  <QueryBuilder />
                </ProtectedRoute>
              } />
              <Route path="/query-results" element={
                <ProtectedRoute>
                  <QueryResults />
                </ProtectedRoute>
              } />
              <Route path="/saved-queries" element={
                <ProtectedRoute>
                  <SavedQueries />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
