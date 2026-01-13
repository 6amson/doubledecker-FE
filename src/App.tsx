import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import QueryBuilder from "./pages/QueryBuilder";
import QueryResults from "./pages/QueryResults";
import SavedQueries from "./pages/SavedQueries";
import NotFound from "./pages/NotFound";
import { MobileBlocker } from "./components/MobileBlocker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="doubledecker-theme">
      <TooltipProvider>
        <MobileBlocker />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/query-builder" element={<QueryBuilder />} />
            <Route path="/query-results" element={<QueryResults />} />
            <Route path="/saved-queries" element={<SavedQueries />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
