import { Link, useLocation } from"react-router-dom";
import { Menu, X } from"lucide-react";
import { useState } from"react";
import logo from"@/assets/logo.png";
import { motion, AnimatePresence } from"framer-motion";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
 { label:"Home", path:"/" },
 { label:"Risk Assessment", path:"/assess" },
 { label:"Model Comparison", path:"/models" },
 { label:"Documentation", path:"/documentation" },
 { label:"About", path:"/about" },
];

export function Navbar() {
 const location = useLocation();
 const [mobileOpen, setMobileOpen] = useState(false);

 return (
 <nav className="glass-header sticky top-0 z-50">
 <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
 <Link to="/" className="flex items-center gap-3 transition-transform">
 <div className="relative">
 <div className="absolute -inset-2 rounded-full bg-primary/20" />
 <img src={logo} alt="AiHealth Guard" className="relative h-10 w-10 object-contain" />
 </div>
 <span className="text-xl font-semibold text-foreground">
 AiHealth <span className="text-gradient-primary">Guard</span>
 </span>
 </Link>

      {/* Desktop */}
      <div className="hidden items-center gap-1 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              location.pathname === item.path
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {location.pathname === item.path && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </Link>
        ))}
        <div className="ml-3 flex items-center gap-3 border-l border-border/60 pl-3">
          <ThemeToggle />
          <Link
            to="/assess"
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            Launch Assessment
          </Link>
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="flex items-center gap-4 md:hidden">
        <ThemeToggle />
        <button 
          className="rounded-full p-2 transition-colors hover:bg-muted" 
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileOpen ?"close" :"menu"}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>
    </div>

 {/* Mobile menu */}
 <AnimatePresence>
 {mobileOpen && (
 <motion.div 
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height:"auto" }}
 exit={{ opacity: 0, height: 0 }}
 transition={{ duration: 0.3 }}
 className="border-t bg-card/95 px-4 py-4 md:hidden overflow-hidden"
 >
 {navItems.map((item) => (
 <Link
 key={item.path}
 to={item.path}
 onClick={() => setMobileOpen(false)}
 className={`block rounded-xl px-5 py-3 mb-1 text-sm font-bold transition-all ${location.pathname === item.path
 ?"bg-primary/10 text-primary"
 :"text-muted-foreground hover:bg-muted/50 hover:text-foreground"
 }`}
 >
 {item.label}
 </Link>
 ))}
 </motion.div>
 )}
 </AnimatePresence>
 </nav>
 );
}
