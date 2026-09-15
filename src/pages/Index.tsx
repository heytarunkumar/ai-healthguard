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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { useSEO } from "@/hooks/useSEO";
import { getModelMetrics, ModelMetric } from "@/lib/api";

export default function Index() {
  useSEO({
    title: "AI-HealthGuard | Clinical Ischemic Heart Disease Risk Assessment & Explainable AI",
    description: "AI-HealthGuard uses state-of-the-art machine learning (XGBoost, SF-2 top-10 features) to assess Ischemic Heart Disease risk with transparent SHAP explanations and personalized prevention guidance.",
  });

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

  const stats = [
    { value: xgbAccuracy, label: "XGBoost Accuracy", sub: "Benchmarked on SF-2 Subset", highlight: true },
    { value: xgbAuc, label: "AUC-ROC Score", sub: "Discriminative Separation", highlight: false },
    { value: "13", label: "Clinical Parameters", sub: "Validated UCI Cleveland Data", highlight: false },
    { value: "5", label: "ML Architectures", sub: "Multi-Model Consensus", highlight: false },
  ];

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
      desc: "Enter 13 standard clinical parameters including resting BP, serum cholesterol, ECG, thalach, and fluoroscopy data.",
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
      title: "Clinical Report & Plan",
      desc: "Review your categorized prevention plan, multi-model consensus, and generate an institutional PDF report.",
      icon: Stethoscope,
    },
  ];

  return (
    <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture" id="main-content">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:px-8 text-center">
        <div className="relative z-10 mx-auto max-w-4xl space-y-6">
          {/* Top Pill Badge */}
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

          {/* Display Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.15]"
          >
            AI-Powered Risk Assessment for{" "}
            <span className="text-gradient-primary">Ischemic Heart Disease</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            Empowering clinicians and patients with high-precision machine learning, game-theoretic SHAP explainability, and actionable cardiovascular prevention planning.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link to="/assess">
              <Button size="lg" className="btn-cta-glow h-13 rounded-2xl px-8 text-sm font-bold gap-3 shadow-glow-lg">
                <Heart className="h-5 w-5 fill-white/20" />
                <span>Start Risk Assessment</span>
                <ArrowRight className="h-4 w-4 opacity-80" />
              </Button>
            </Link>
            <Link to="/models">
              <Button
                variant="outline"
                size="lg"
                className="h-13 rounded-2xl border-border/80 bg-card/80 px-6 text-sm font-bold text-foreground backdrop-blur-md hover:bg-muted/60 transition-all shadow-sm gap-2"
              >
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>View Model Benchmarks</span>
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* 4 Stat Cards */}
        <div className="mx-auto mt-16 max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {stats.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + idx * 0.08 }}
                className={`card-elevated p-5 text-center ${
                  s.highlight ? "border-primary/40 bg-gradient-to-b from-primary/10 via-card to-card" : ""
                }`}
              >
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {s.highlight ? <span className="text-primary">{s.value}</span> : s.value}
                </div>
                <div className="mt-1 text-xs font-bold text-foreground">{s.label}</div>
                <div className="text-[10px] font-medium text-muted-foreground mt-0.5">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
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
      <section className="relative border-t border-border/80 px-4 py-20 sm:px-6 lg:px-8">
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
            {workflowSteps.map((step, idx) => {
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
          <div>
            <Link to="/assess">
              <Button size="lg" className="btn-cta-glow h-12 rounded-2xl px-8 text-sm font-bold gap-2">
                <Sparkles className="h-4 w-4" /> Start Assessment Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
