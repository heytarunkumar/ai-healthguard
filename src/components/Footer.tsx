import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Activity, BookOpen, ExternalLink, GraduationCap, Github } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-card/40 backdrop-blur-xl transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4 md:col-span-1 lg:col-span-1.5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 p-1.5 shadow-sm group-hover:shadow-glow transition-all">
                <img src={logo} alt="AI-HealthGuard" className="h-6 w-6 object-contain" />
              </div>
              <span className="font-heading text-lg font-extrabold text-foreground">
                AI-Health<span className="text-primary">Guard</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explainable Multimodal AI Clinical Decision Support System for Ischemic Heart Disease (IHD) risk stratification, SHAP biomarker attribution, and personalized cardiovascular prevention.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>GL Bajaj Group of Institutions, Mathura</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/assess" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Risk Assessment Form
                </Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Model Benchmarks
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-purple-500" /> 6-Layer Architecture
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-500" /> Research Team & Mentors
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical & Architecture */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
              Clinical & Model Specs
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Primary Model: <strong className="text-foreground">XGBoost (SF-2 Subset)</strong></li>
              <li>Explainability: <strong className="text-foreground">TreeExplainer (SHAP)</strong></li>
              <li>Training Scheme: <strong className="text-foreground">10-Fold Repeated CV</strong></li>
              <li>Dataset: <strong className="text-foreground">UCI Cleveland (303 records)</strong></li>
              <li>Risk Bands: <span className="font-mono font-semibold text-foreground">0-39 | 40-69 | 70-100</span></li>
            </ul>
          </div>

          {/* Col 4: Academic Compliance & Disclaimers */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
              Academic Disclaimer
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-2xl border border-border/60">
              AI-HealthGuard is an academic clinical decision support research tool. Predictions and risk scores are intended for research and screening guidance; consult a certified cardiologist for diagnostic evaluations.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AI-HealthGuard. Dept. of Computer Science & Engineering, GL Bajaj Group of Institutions.</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="/AIHealthGuard_Project_Report.pdf" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              Project Report PDF
            </a>
            <span>•</span>
            <Link to="/documentation" className="hover:text-primary transition-colors">
              Documentation
            </Link>
            <span>•</span>
            <Link to="/about" className="hover:text-primary transition-colors">
              Team
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
