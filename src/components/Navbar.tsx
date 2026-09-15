import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Risk Assessment", path: "/assess" },
  { label: "Model Comparison", path: "/models" },
  { label: "Documentation", path: "/documentation" },
  { label: "About", path: "/about" },
];

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="glass-header sticky top-0 z-50 transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo Treatment */}
        <Link to="/" className="group flex items-center gap-3.5 transition-transform">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-1.5 border border-primary/30 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow">
            <img src={logo} alt="AI-HealthGuard" className="h-7 w-7 object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
                AI-Health<span className="text-primary">Guard</span>
              </span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-primary border border-primary/20">
                SF-2
              </span>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wide -mt-0.5 hidden sm:block">
              Clinical Decision Support
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "text-primary font-extrabold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/25 shadow-sm"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}

          {/* Action & Theme Area */}
          <div className="ml-4 flex items-center gap-3 border-l border-border/80 pl-4">
            <ThemeToggle />
            <Link to="/assess">
              <Button
                size="sm"
                className="btn-cta-glow h-10 rounded-xl px-4 text-xs font-bold gap-2 shadow-glow"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Launch Assessment</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-80" />
              </Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Navigation Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 p-2 text-foreground transition-colors hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileOpen ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-border/80 bg-background/95 backdrop-blur-2xl px-5 py-4 md:hidden overflow-hidden shadow-xl"
          >
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <Link to="/assess" onClick={() => setMobileOpen(false)}>
                <Button className="btn-cta-glow w-full h-11 rounded-xl font-bold text-sm gap-2">
                  <Sparkles className="h-4 w-4" /> Launch Assessment Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
