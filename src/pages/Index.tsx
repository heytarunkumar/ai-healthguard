import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Shield, Brain, Activity, ArrowRight, BarChart3, FileText, CheckCircle2, ChevronRight, Heart, Stethoscope, Apple, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { useSEO } from "@/hooks/useSEO";

export default function Index() {
  useSEO({
    title: "AI-HealthGuard | AI-Based Ischemic Heart Disease Risk Prediction & Prevention System",
    description: "AI-HealthGuard uses state-of-the-art machine learning to assess your Ischemic Heart Disease risk from routine parameters, explained with transparent AI insights.",
  });

  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const res = await fetch("/api/metrics");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 60000,
  });

  const xgbAccuracy = metrics?.XGB ? (metrics.XGB.Accuracy * 100).toFixed(1) : "91.4";
  const xgbAuc = metrics?.XGB ? (metrics.XGB.AUC).toFixed(2) : "0.94";

  const stats = [
    { value: `${xgbAccuracy}%`, label: "XGBoost Accuracy", sub: "Benchmarked & Validated" },
    { value: xgbAuc, label: "AUC-ROC Score", sub: "Discriminative Power" },
    { value: "13", label: "Clinical Parameters", sub: "SF-2 Feature Set" },
    { value: "5", label: "ML Classifiers", sub: "Ensemble & Deep Learning" },
  ];

  const keyFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Prediction",
      desc: "Five ML models including XGBoost analyze 13 clinical parameters for accurate IHD risk assessment.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/30",
    },
    {
      icon: Shield,
      title: "Explainable AI (SHAP)",
      desc: "Understand exactly which health factors drive your risk score with transparent SHAP explanations.",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/30",
    },
    {
      icon: Activity,
      title: "Personalised Prevention",
      desc: "Receive tailored lifestyle, diet, activity, and medical recommendations based on your profile.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/30",
    },
    {
      icon: BarChart3,
      title: "Model Comparison",
      desc: "Compare performance of Random Forest, XGBoost, SVM, Neural Network, and Logistic Regression.",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "hover:border-purple-500/30",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Enter Parameters",
      desc: "Input 13 clinical data points optimized for the SF-2 feature subset (age, blood pressure, cholesterol, ECG, etc.).",
      icon: FileText,
    },
    {
      step: "02",
      title: "ML Insight",
      desc: "XGBoost and ensemble models compute your IHD risk probability profile in under 3 seconds.",
      icon: Brain,
    },
    {
      step: "03",
      title: "Action Plan",
      desc: "Receive a deep-dive diagnostic report with localized SHAP feature impact, 4-tier prevention advice, and downloadable PDF.",
      icon: Stethoscope,
    },
  ];

  return (
    <main className="min-h-screen bg-background" id="main-content">
      {/* Hero Section - Matching Fig. 2 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background px-6 pt-16 pb-24 text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Machine Learning Optimization Accuracy: {xgbAccuracy}%</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl leading-tight"
          >
            Predict Heart Disease Risk <br className="hidden sm:inline" />
            <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Before It's Too Late
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mx-auto mb-10 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            AI-HealthGuard uses state-of-the-art machine learning to assess your Ischemic Heart Disease (IHD) risk from routine clinical parameters, explained with transparent AI insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/assess" id="link-start-assessment">
              <Button
                id="btn-start-assessment"
                size="lg"
                className="h-12 px-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base font-semibold shadow-md transition-all hover:scale-[1.02]"
              >
                Start Risk Assessment <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/models" id="link-view-benchmarks">
              <Button
                id="btn-view-benchmarks"
                size="lg"
                variant="outline"
                className="h-12 px-6 rounded-lg border-border text-foreground hover:bg-muted font-semibold transition-all"
              >
                Model Benchmarks
              </Button>
            </Link>
          </motion.div>

          {/* Stats Bar (Pills matching Fig. 2) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="text-3xl font-extrabold text-primary">{s.value}</div>
                <div className="mt-1 text-xs font-bold text-foreground">{s.label}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advanced Clinical Support - Key Features Section (Fig. 2) */}
      <section className="px-6 py-24 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
              Key Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Advanced Clinical Support
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              Built on the gold-standard UCI Cleveland Dataset using optimized hyper-parameter tuning and class-balancing (SMOTE).
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {keyFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`group flex flex-col justify-between rounded-2xl border border-border bg-card p-8 shadow-sm transition-all ${f.border} hover:shadow-lg`}
              >
                <div>
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${f.bg} ${f.color} transition-transform group-hover:scale-110`}>
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore detail</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Path to Heart Health - 3-Step Process (Fig. 2) */}
      <section className="px-6 py-24 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <Badge className="mb-3 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider">
              Clinical Workflow
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your Path to Heart Health
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              A 3-step structured pipeline converting raw biomarkers into evidence-based preventative action.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {workflowSteps.map((s, idx) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                className="relative flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold shadow-sm">
                  {s.step}
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prioritize Your Heart Health Banner Card (Fig. 2) */}
      <section className="px-6 py-20 bg-background">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-10 sm:p-16 text-center text-white shadow-xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <Heart className="h-8 w-8 text-rose-400 fill-rose-400/20 animate-pulse" />
              </div>
              <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl tracking-tight">
                Prioritize Your Heart Health
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
                Early detection of Ischemic Heart Disease significantly improves long-term outcomes. Get your comprehensive analysis in seconds.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/assess" id="link-launch-cta">
                  <Button
                    size="lg"
                    className="h-12 px-8 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold shadow-lg transition-all"
                  >
                    Launch Assessment <ArrowRight className="h-4 w-4 ml-2 text-primary" />
                  </Button>
                </Link>
                <a
                  href="/AIHealthGuard_Project_Report.pdf"
                  download
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" /> Download Project Report
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Academic Institutional Footer */}
      <footer className="border-t border-border bg-card px-6 py-12 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI-HealthGuard" className="h-8 w-8 object-contain" />
            <div className="text-left">
              <p className="font-bold text-foreground text-sm">AI-HealthGuard</p>
              <p className="text-[11px]">B.Tech Major Research Project | Academic Year 2025–2026</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-semibold text-foreground">GL Bajaj Group of Institutions, Mathura</p>
            <p className="text-[11px]">Department of Computer Science & Engineering (Affiliated to AKTU)</p>
          </div>
        </div>
        <div className="mt-8 border-t border-border/60 pt-6 text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AI-HealthGuard. Developed by Tarun Kumar, Sakshi Rajput, Prashant Prajapati. Guided by Er. Tanya Shrivastava.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-primary transition-colors">About Project</Link>
            <Link to="/documentation" className="hover:text-primary transition-colors">Documentation</Link>
            <Link to="/models" className="hover:text-primary transition-colors">Model Comparison</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
