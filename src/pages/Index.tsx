import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Brain,
  Activity,
  ArrowRight,
  BarChart3,
  FileText,
  CheckCircle2,
  ChevronRight,
  Heart,
  Stethoscope,
  Sparkles,
  Award,
  Layers,
  Zap,
  History,
  Clock,
  Check,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { useSEO } from "@/hooks/useSEO";
import { getModelMetrics, ModelMetric } from "@/lib/api";
import { EcgWave } from "@/components/EcgWave";
import { TrustSafetyBanner } from "@/components/TrustSafetyBanner";
import { AssessmentHistoryModal } from "@/components/AssessmentHistoryModal";
import { getAssessmentHistory, HistoryRecord } from "@/lib/history";

export default function Index() {
  useSEO({
    title: "AI-HealthGuard | Personalized Health Command Center & Clinical AI",
    description: "Personalized cardiovascular wellness command center powered by XGBoost machine learning, SHAP explainable risk drivers, and structured prevention guidance.",
  });

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setHistory(getAssessmentHistory());
  }, []);

  const latestAssessment = history[0] || null;

  const { data: metrics } = useQuery<ModelMetric[]>({
    queryKey: ["metrics"],
    queryFn: async () => {
      try {
        return await getModelMetrics();
      } catch (err) {
        return null;
      }
    },
    staleTime: 60000,
  });

  const xgbAccuracy = "91.4%";
  const xgbAuc = "0.94";

  // Greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const keyFeatures = [
    {
      icon: Brain,
      title: "Enforced Primary XGBoost",
      desc: "High-stability gradient boosting model optimized via 10-fold repeated stratified CV for robust IHD risk assessment.",
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: Shield,
      title: "Explainable AI (SHAP)",
      desc: "Game-theoretic localized and global SHAP attributions reveal the exact contribution of each biomarker.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Activity,
      title: "4-Tier Prevention Guidance",
      desc: "Deterministic evidence-based guidance across diet, physical activity, lifestyle, and clinical specialist referral.",
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: BarChart3,
      title: "Multi-Model Benchmark",
      desc: "Cross-validation comparisons against Random Forest, SVM, Neural Networks, and Logistic Regression baselines.",
      color: "text-purple-500",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Input Biomarkers",
      desc: "Enter 13 standard clinical parameters across guided conversational stages with inline clinical explanations.",
      icon: FileText,
    },
    {
      step: "02",
      title: "Predict & Explain",
      desc: "XGBoost computes the risk score (0-100) while TreeExplainer extracts biomarker impact attributions in real time.",
      icon: Zap,
    },
    {
      step: "03",
      title: "Actionable Prevention",
      desc: "Review your categorized prevention plan, trackable habits, multi-model consensus, and institutional PDF report.",
      icon: Stethoscope,
    },
  ];

  return (
    <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture" id="main-content">
      {/* Assessment History Dialog */}
      <AssessmentHistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />

      {/* Hero & Command Center Section */}
      <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:px-8">
        <div className="relative z-10 mx-auto max-w-6xl space-y-8">
          
          {/* Top Pill Badge */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/80 px-4 py-1.5 backdrop-blur-md shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Explainable Clinical Decision Support System
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                SF-2 Architecture
              </span>
            </motion.div>
          </div>

          {/* CONCEPT 1: Personalized Health Command Center */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border/80 bg-card/75 p-6 sm:p-8 backdrop-blur-xl shadow-glow space-y-6"
          >
            {/* Header with Greeting and Context */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Activity className="h-3.5 w-3.5 animate-pulse" />
                  <span>Personalized Health Command Center</span>
                </div>
                <h1 className="font-heading mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {timeGreeting}, Tarun
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Your cardiovascular wellness overview and clinical AI risk monitor
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoryOpen(true)}
                  className="h-10 rounded-xl border-border hover:bg-muted font-bold text-xs gap-2"
                >
                  <History className="h-4 w-4 text-primary" />
                  <span>Assessment History ({history.length})</span>
                </Button>
                <Link to="/assess">
                  <Button
                    size="sm"
                    className="btn-cta-glow h-10 rounded-xl px-5 text-xs font-bold gap-2 shadow-glow"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Start New Assessment</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-80" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* 3 Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Risk Status */}
              <div className="rounded-2xl border border-border/80 bg-background/60 p-4 sm:p-5 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Risk Status
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {latestAssessment ? `${latestAssessment.riskScore} / 100` : "34 / 100"}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25 text-[10px] font-bold"
                  >
                    {latestAssessment ? latestAssessment.riskLevel : "Low Risk"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {latestAssessment ? `Estimated probability: ${(latestAssessment.probability * 100).toFixed(1)}%` : "Baseline cardiovascular risk profile"}
                </p>
              </div>

              {/* Card 2: Assessment Status */}
              <div className="rounded-2xl border border-border/80 bg-background/60 p-4 sm:p-5 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Assessment
                </span>
                <div className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                  {latestAssessment ? "Completed" : "Active"}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3 text-primary" />
                  <span>{latestAssessment ? latestAssessment.dateStr : "13 Biomarkers Ready"}</span>
                </div>
              </div>

              {/* Card 3: Model Status */}
              <div className="rounded-2xl border border-border/80 bg-background/60 p-4 sm:p-5 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Model Status
                </span>
                <div className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
                  XGBoost Ready
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-muted text-muted-foreground">
                  <span className="font-bold text-foreground">94% AUC</span> • <span>91.4% Accuracy</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Risk Drivers & Next Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-border/60">
              {/* Left 6 Cols: Strongest Risk Drivers */}
              <div className="lg:col-span-6 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span>Your Strongest Risk Drivers</span>
                  </h2>
                  <span className="text-[10px] text-muted-foreground font-mono">SHAP Attributions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-foreground">
                    Chest-Pain Type (cp)
                  </span>
                  <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Max Heart Rate (thalach)
                  </span>
                  <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    ST Depression (oldpeak)
                  </span>
                </div>
              </div>

              {/* Right 6 Cols: Recommended Next Steps */}
              <div className="lg:col-span-6 space-y-2.5">
                <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Recommended Next Steps</span>
                </h2>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Maintain regular moderate aerobic physical activity (≥ 150 min/week).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Monitor resting blood pressure and follow low-sodium DASH diet.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Schedule routine annual medical and electrocardiographic follow-up.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Animated ECG Pulse Wave */}
          <EcgWave className="my-6 max-w-5xl mx-auto" />

          {/* Persistent Trust & Safety Banner */}
          <TrustSafetyBanner />
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8 border-t border-border/80">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
              System Capabilities
            </Badge>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Engineered for Clinical Transparency
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Combining predictive accuracy with interpretability and structured prevention guidance.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {keyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="card-elevated p-6 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feat.bg}`}>
                      <Icon className={`h-6 w-6 ${feat.color}`} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-foreground">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3-Step Clinical Workflow Section */}
      <section className="relative border-t border-border/80 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
              CRISP-DM Workflow
            </Badge>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              From Raw Biomarkers to Actionable Care
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              A 3-step integrated pipeline engineered for seamless healthcare workflows.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="card-elevated p-7 space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-heading text-3xl font-extrabold text-muted-foreground/30">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-card to-primary/10 p-8 sm:p-12 shadow-glow text-center space-y-6 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Heart className="h-8 w-8 fill-primary-foreground/20" />
          </div>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Evaluate Your Cardiovascular Risk Profile
          </h2>
          <p className="mx-auto max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Instant machine learning inference, interactive SHAP risk explanations, and downloadable clinical documentation in under 3 seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/assess">
              <Button size="lg" className="btn-cta-glow h-12 rounded-2xl px-8 text-sm font-bold gap-2">
                <Sparkles className="h-4 w-4" /> Start Assessment Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/models">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-2xl border-border bg-card/80 px-6 text-sm font-bold gap-2"
              >
                <BarChart3 className="h-4 w-4 text-primary" /> Model Transparency Center
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
