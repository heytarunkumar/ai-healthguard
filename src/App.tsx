import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Activity } from "lucide-react";
import logo from "@/assets/logo.png";

// Lazy-loaded pages for Code Splitting (Performance)
const Index = lazy(() => import("./pages/Index"));
const RiskAssessment = lazy(() => import("./pages/RiskAssessment"));
const Results = lazy(() => import("./pages/Results"));
const ModelComparison = lazy(() => import("./pages/ModelComparison"));
const Documentation = lazy(() => import("./pages/Documentation"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Premium Branded Loading Screen
const PageLoader = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background bg-aurora-mesh bg-grid-texture px-4 text-center">
    <div className="relative mb-6">
      <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-xl shadow-glow">
        <img src={logo} alt="AI-HealthGuard" className="h-10 w-10 object-contain animate-pulse-subtle" />
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary">
      <Activity className="h-3.5 w-3.5 animate-pulse" /> AI-HealthGuard Engine
    </div>
    <p className="mt-2 text-sm font-semibold text-muted-foreground">
      Loading Clinical Intelligence System...
    </p>
  </div>
);

const queryClient = new QueryClient();

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className="w-full flex-1"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
          <Route path="/assess" element={<PageWrapper><RiskAssessment /></PageWrapper>} />
          <Route path="/results" element={<PageWrapper><Results /></PageWrapper>} />
          <Route path="/models" element={<PageWrapper><ModelComparison /></PageWrapper>} />
          <Route path="/documentation" element={<PageWrapper><Documentation /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
            <Navbar />
            <div className="flex-1 w-full">
              <AnimatedRoutes />
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
