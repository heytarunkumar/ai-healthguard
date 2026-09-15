import { FileText, Download, ExternalLink, BookOpen, Cpu, Sparkles, Files, Info, Layers, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";

export default function Documentation() {
  useSEO({
    title: "Project Documentation & 6-Layer Architecture | AI-HealthGuard",
    description: "Access complete technical documentation, 6-layer pipeline specifications, and downloadable academic project reports for AI-HealthGuard.",
  });

  const documents = [
    {
      title: "Project Final Report (PDF)",
      desc: "Complete 54-page final year B.Tech major project report including literature review, CRISP-DM methodology, 6-layer pipeline, SHAP analysis, and Turnitin similarity index.",
      file: "/AIHealthGuard_Project_Report.pdf",
      type: "PDF",
      icon: FileText,
      primary: true,
    },
    {
      title: "Product Requirements Document (PRD)",
      desc: "Core functional specifications, user personas, clinical diagnostic scope, and acceptance criteria.",
      file: "/AiHealth_Guard_PRD.docx",
      type: "DOCX",
      icon: BookOpen,
      primary: false,
    },
    {
      title: "Google Colab ML Pipeline",
      desc: "Sequential 7-cell reproducible pipeline (SMOTE class balancing, SF-2 feature selection, GridSearchCV tuning, SHAP explainers).",
      file: "/AiHealth_Guard_Colab_Pipeline.ipynb",
      type: "IPYNB",
      icon: Cpu,
      primary: false,
    },
  ];

  const pipelineLayers = [
    { layer: "L1", name: "Data Layer", module: "data_loader.py", desc: "Loads and version-controls the raw UCI Cleveland CSV dataset (303 samples, 13 features)." },
    { layer: "L2", name: "Preprocessing Layer", module: "preprocessor.py", desc: "Imputation (median/mode), target binarization, one-hot encoding, SF-2 top-10 feature selection, and SMOTE oversampling." },
    { layer: "L3", name: "Model Training Layer", module: "model_trainer.py, evaluator.py", desc: "Trains, tunes (GridSearchCV), evaluates, and serializes all 5 ML models (XGB ★, RF, LR, SVM, NN)." },
    { layer: "L4", name: "Inference Layer", module: "inference_engine.py / API", desc: "Loads serialized model artifacts (.pkl, .keras), preprocesses incoming clinical inputs, and returns risk probabilities in <3s." },
    { layer: "L5", name: "Explainability Layer", module: "explainer.py", desc: "Computes localized and global SHAP values using TreeExplainer and KernelExplainer across all 4 visualization formats." },
    { layer: "L6", name: "Presentation Layer", module: "app.py / React, recommender.py, risk_scorer.py", desc: "Interactive UI dashboards, circular risk gauge, 4-tier prevention engine, and clinical PDF report generation." },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8" id="main-content">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
            Technical Specification & Archive
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Project Documentation
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Architectural specifications, ML pipeline reproduction guidelines, and official B.Tech project artifacts for AI-HealthGuard.
          </p>
        </div>

        {/* Downloadable Documents */}
        <div className="grid gap-6 md:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.title}
              className={`rounded-3xl border bg-card p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                doc.primary ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${doc.primary ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-foreground"}`}>
                    <doc.icon className="h-6 w-6" />
                  </div>
                  <Badge variant={doc.primary ? "default" : "outline"} className="text-[10px] font-bold uppercase">
                    {doc.type}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{doc.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">{doc.desc}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border/60">
                <Button asChild size="sm" className={`flex-1 rounded-xl font-semibold gap-2 ${doc.primary ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}>
                  <a href={doc.file} download>
                    <Download className="h-4 w-4" /> Download
                  </a>
                </Button>
                {doc.type === "PDF" && (
                  <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-xl border-border">
                    <a href={doc.file} target="_blank" rel="noreferrer" title="Open in new tab">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 6-Layers Pipeline Architecture (Table 2 in Report) */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> System Architecture: 6-Layers Pipeline (Table 2)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Modular pipeline design operating in offline training mode (L1–L3) and online inference mode (L4–L6).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pipelineLayers.map((l) => (
              <div key={l.layer} className="p-5 rounded-2xl border border-border bg-background space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] font-mono font-bold">
                    {l.layer}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">{l.module}</span>
                </div>
                <h3 className="font-bold text-sm text-foreground">{l.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Embedded PDF Viewer Section */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Interactive Project Report Document
              </h2>
              <p className="text-xs text-muted-foreground">Direct inline preview of AIHealthGuard_Project_Report.pdf</p>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-xl border-border font-semibold gap-2">
              <a href="/AIHealthGuard_Project_Report.pdf" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> Open Full Screen
              </a>
            </Button>
          </div>

          <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-border bg-muted/20">
            <iframe
              src="/AIHealthGuard_Project_Report.pdf#toolbar=1"
              className="h-full w-full border-0"
              title="AI-HealthGuard Project Report PDF"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
