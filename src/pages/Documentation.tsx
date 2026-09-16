import { Cpu, Sparkles, Layers, ShieldCheck, Activity, BrainCircuit, Database, LineChart, Stethoscope, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

export default function Documentation() {
  useSEO({
    title: "System Architecture & 6-Layer Pipeline | AI-HealthGuard",
    description: "Comprehensive technical documentation for AI-HealthGuard's 6-layer machine learning architecture, SHAP explainability framework, and clinical decision support pipeline.",
  });

  const pipelineLayers = [
    {
      layer: "L1",
      name: "Data Ingestion Layer",
      module: "data_loader.py",
      desc: "Loads and version-controls the raw clinical dataset (303 records, 13 raw features) with rigorous schema validation and integrity checks.",
      icon: Database,
    },
    {
      layer: "L2",
      name: "Preprocessing & Balancing Layer",
      module: "preprocessor.py",
      desc: "Performs median/mode imputation, one-hot encoding, SF-2 top-10 feature selection, standard scaling, and SMOTE oversampling to eliminate class imbalance.",
      icon: Sparkles,
    },
    {
      layer: "L3",
      name: "Model Training & Tuning Layer",
      module: "model_trainer.py, evaluator.py",
      desc: "Trains, cross-validates (10-Fold Repeated CV), tunes hyperparameters via GridSearchCV, and serializes 5 predictive models (XGBoost, RF, LR, SVM, NN).",
      icon: BrainCircuit,
    },
    {
      layer: "L4",
      name: "Real-Time Inference Layer",
      module: "inference_engine.py / Fast Engine",
      desc: "Deserializes pre-trained artifacts, transforms live clinical inputs, computes risk probabilities, and delivers predictions in sub-second response times.",
      icon: Cpu,
    },
    {
      layer: "L5",
      name: "Explainability & Attribution Layer",
      module: "explainer.py / SHAP",
      desc: "Computes localized and global Shapley values using TreeExplainer and KernelExplainer across force plots, waterfall charts, and summary distributions.",
      icon: LineChart,
    },
    {
      layer: "L6",
      name: "Clinical Presentation Layer",
      module: "UI Dashboards & Prevention Engine",
      desc: "Powers the interactive risk gauge, 4-tier personalized cardiovascular prevention roadmap, and clinical risk summary PDF exports.",
      icon: Stethoscope,
    },
  ];

  const keyFeatures = [
    { key: "cp", name: "Chest Pain Type", clinical: "Typical angina, atypical angina, non-anginal pain, asymptomatic", weight: "High (+SHAP impact)" },
    { key: "thalach", name: "Max Heart Rate", clinical: "Maximum heart rate achieved during exercise stress test (bpm)", weight: "High (Protective when high)" },
    { key: "oldpeak", name: "ST Depression", clinical: "ST depression induced by exercise relative to rest (mm)", weight: "High (Key ischemic biomarker)" },
    { key: "ca", name: "Major Vessels", clinical: "Number of major vessels (0-3) colored by fluoroscopy", weight: "High (Anatomical biomarker)" },
    { key: "thal", name: "Thallium Stress", clinical: "Normal, fixed defect, or reversible defect on myocardial perfusion scan", weight: "High (Perfusion marker)" },
    { key: "age", name: "Patient Age", clinical: "Chronological age in years (range 29–77 in benchmark cohort)", weight: "Moderate" },
    { key: "sex", name: "Biological Sex", clinical: "Male (1) or Female (0)", weight: "Moderate" },
    { key: "trestbps", name: "Resting Blood Pressure", clinical: "Resting blood pressure on hospital admission (mm Hg)", weight: "Moderate" },
    { key: "chol", name: "Serum Cholesterol", clinical: "Serum cholesterol concentration in mg/dl", weight: "Moderate" },
    { key: "exang", name: "Exercise Induced Angina", clinical: "Presence of angina pectoris during physical exertion (1 = Yes, 0 = No)", weight: "Moderate" },
  ];

  return (
    <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture px-4 py-12 sm:px-6 lg:px-8" id="main-content">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
            Technical Architecture & Specifications
          </Badge>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            System Documentation
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            In-depth architectural specifications, 6-layer machine learning pipeline design, and SHAP explainability methodology powering AI-HealthGuard.
          </p>
        </div>

        {/* 6-Layers Pipeline Architecture */}
        <div className="card-elevated p-6 sm:p-8 space-y-6">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> 6-Layer Modular ML Pipeline Architecture
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Separation of offline data engineering & model training (L1–L3) from online sub-second clinical inference & explainability (L4–L6).
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-mono font-bold w-fit">
              Architecture v2.0
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pipelineLayers.map((l) => (
              <div key={l.layer} className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-3 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <l.icon className="h-4 w-4" />
                    </div>
                    <Badge className="bg-primary/15 text-primary border-primary/25 text-[11px] font-mono font-bold">
                      {l.layer}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{l.module}</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">{l.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Clinical Biomarkers */}
        <div className="card-elevated p-6 sm:p-8 space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" /> Clinical Biomarkers & Feature Schema (SF-2 Subset)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Top 10 selected predictive features optimized for maximal diagnostic accuracy and minimal clinical collection burden.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {keyFeatures.map((f) => (
              <div key={f.key} className="p-4 rounded-xl border border-border/70 bg-card/40 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-primary">{f.key}</span>
                    <span className="font-heading font-bold text-xs text-foreground">• {f.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{f.clinical}</p>
                </div>
                <Badge variant="outline" className="text-[10px] whitespace-nowrap shrink-0 border-border">
                  {f.weight}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Explainability Framework Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-elevated p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">SHAP (SHapley Additive exPlanations)</h3>
                <p className="text-xs text-muted-foreground">Game-Theoretic Feature Attribution</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-HealthGuard integrates TreeExplainer to guarantee exact local feature attribution according to classical Shapley values. Each clinical biomarker is assigned an additive attribution value quantifying whether it pushed the patient towards higher or lower Ischemic Heart Disease risk relative to the baseline population expectation.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-xl font-bold text-xs">
                <Link to="/models">
                  View Model Benchmarks <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="card-elevated p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">4-Tier Prevention Guidance Engine</h3>
                <p className="text-xs text-muted-foreground">Personalized Actionable Strategies</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The recommendation engine dynamically analyzes patient-specific SHAP drivers and maps them into four distinct lifestyle and clinical domains: Dietary Modifications, Physical Activity Protocols, Medical & Pharmacological Follow-ups, and Stress & Sleep Optimization.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Button asChild size="sm" className="rounded-xl font-bold text-xs btn-cta-glow text-white">
                <Link to="/assess">
                  Launch Risk Assessment <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
