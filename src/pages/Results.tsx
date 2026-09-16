import { useState, useMemo, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Shield,
  Activity,
  Apple,
  Dumbbell,
  Stethoscope,
  Pill,
  TrendingUp,
  BarChart3,
  Layers,
  ChevronRight,
  Info,
  Building2,
  RefreshCw,
  Copy,
  Check,
  CheckSquare,
  Square,
  History,
  HelpCircle,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskGauge } from "@/components/RiskGauge";
import { featureFields, recommendations as defaultRecommendations, modelComparison } from "@/lib/mockData";
import { useSEO } from "@/hooks/useSEO";
import { useToast } from "@/hooks/use-toast";
import { predictRisk, PredictionResponse } from "@/lib/api";
import { saveAssessmentRecord } from "@/lib/history";
import { AssessmentHistoryModal } from "@/components/AssessmentHistoryModal";
import { TrustSafetyBanner } from "@/components/TrustSafetyBanner";
import jsPDF from "jspdf";

// Plain language translation and action generator for SHAP drivers
function getShapExplanation(feature: string, value: number, isRisk: boolean): { explanation: string; action: string } {
  switch (feature) {
    case "cp":
      return {
        explanation: isRisk
          ? "Chest pain presentation correlates with exertional or asymptomatic myocardial ischemia."
          : "Absence of ischemic chest pain symptoms lowers the model's predicted probability.",
        action: "Avoid strenuous unmonitored exertion and discuss symptom onset thresholds with a doctor.",
      };
    case "thalach":
      return {
        explanation: isRisk
          ? "Lower maximum heart rate achieved reflects chronotropic incompetence under exertion."
          : `Your achieved heart rate (${value} bpm) demonstrates strong cardiac reserve, significantly lowering predicted risk.`,
        action: "Maintain regular aerobic conditioning to preserve healthy heart rate variability.",
      };
    case "oldpeak":
      return {
        explanation: isRisk
          ? `ST depression of ${value} mm during exercise points to exertional subendocardial ischemia.`
          : "Minimal ST segment depression indicates healthy myocardial oxygenation during stress.",
        action: "Undergo formal exercise treadmill ECG testing under cardiologist supervision.",
      };
    case "ca":
      return {
        explanation: isRisk
          ? `Fluoroscopy colored ${value} major vessel(s), indicating anatomic coronary calcification or narrowing.`
          : "Zero fluoroscopy-detected vessel blockages strongly lowers long-term ischemic risk.",
        action: "Pursue lipid-lowering lifestyle interventions to prevent further vessel plaque accumulation.",
      };
    case "thal":
      return {
        explanation: isRisk
          ? "Thallium stress test identified a fixed or reversible perfusion defect in myocardial tissue."
          : "Normal thallium perfusion scintigraphy indicates unobstructed myocardial blood flow.",
        action: "Consult a cardiologist for advanced myocardial perfusion imaging evaluation.",
      };
    case "chol":
      return {
        explanation: isRisk
          ? `Serum cholesterol of ${value} mg/dL is elevated above normal thresholds (< 200 mg/dL).`
          : `Healthy serum cholesterol level (${value} mg/dL) supports clean arterial endothelium.`,
        action: "Adopt low-saturated-fat Mediterranean diet and check fasting lipid profile semi-annually.",
      };
    case "trestbps":
      return {
        explanation: isRisk
          ? `Resting blood pressure of ${value} mmHg places added strain on the coronary vasculature.`
          : `Optimal resting blood pressure (${value} mmHg) minimizes endothelial wall stress.`,
        action: "Adopt a low-sodium DASH diet and track resting BP daily.",
      };
    case "age":
      return {
        explanation: isRisk
          ? `Age (${value} years) serves as a non-modifiable demographic risk multiplier.`
          : `Younger demographic baseline (${value} years) provides baseline cardiovascular resilience.`,
        action: "Focus on proactive modifiable risk management (diet, physical conditioning, stress).",
      };
    default:
      return {
        explanation: isRisk
          ? "This clinical parameter influenced the XGBoost model toward a higher predicted risk."
          : "This clinical parameter influenced the XGBoost model toward a lower predicted risk.",
        action: "Review this biomarker alongside your primary care physician.",
      };
  }
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const patientData = location.state?.patientData as Record<string, string> | undefined;

  useSEO({
    title: "IHD Risk Assessment Results | AI-HealthGuard",
    description: "Interactive risk reveal, game-theoretic SHAP risk drivers, 4-tier personalized prevention workspace, and institutional reporting.",
  });

  const [activeTab, setActiveTab] = useState("risk");
  const [copied, setCopied] = useState(false);
  const [completedHabits, setCompletedHabits] = useState<Record<string, boolean>>({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const sessionId = useMemo(() => `AI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, []);

  // API Query for Real Inference & SHAP
  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PredictionResponse, Error>({
    queryKey: ["predict", patientData],
    queryFn: async () => {
      if (!patientData) throw new Error("No patient clinical parameters provided.");
      return await predictRisk(patientData);
    },
    enabled: !!patientData,
    retry: 1,
  });

  const riskScore: number = useMemo(() => {
    return apiData?.risk_score ?? 0;
  }, [apiData]);

  const riskLevel: string = useMemo(() => {
    if (apiData?.risk_level) return apiData.risk_level;
    if (riskScore <= 39) return "LOW RISK";
    if (riskScore <= 69) return "MODERATE RISK";
    return "HIGH RISK";
  }, [apiData, riskScore]);

  // SHAP Values processing
  const shapDrivers = useMemo(() => {
    if (apiData?.shap?.shap_values && apiData?.shap?.features) {
      const features = Object.keys(apiData.shap.features);
      const values: number[] = apiData.shap.shap_values;
      return features
        .map((feat, idx) => {
          const val = values[idx] || 0;
          const fieldMeta = featureFields.find((f) => f.name === feat);
          const patientVal = apiData.shap.features[feat];
          const isRisk = val >= 0;
          const { explanation, action } = getShapExplanation(feat, patientVal, isRisk);

          return {
            feature: feat,
            label: fieldMeta ? `${fieldMeta.label} (${feat})` : feat,
            value: patientVal,
            shap: val,
            direction: isRisk ? ("risk" as const) : ("protective" as const),
            explanation,
            action,
          };
        })
        .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
        .slice(0, 10);
  }
    return [];
  }, [apiData]);

  // Automatically record to localStorage assessment history once loaded
  useEffect(() => {
    if (apiData && patientData && !savedToHistory) {
      const topDrivers = shapDrivers.slice(0, 3).map((d) => d.label);
      saveAssessmentRecord({
        riskScore: apiData.risk_score,
        riskLevel: apiData.risk_level,
        probability: apiData.probability,
        primaryModel: apiData.primary_model || "XGBoost",
        patientData,
        topDrivers,
      });
      setSavedToHistory(true);
    }
  }, [apiData, patientData, shapDrivers, savedToHistory]);

  // 4 Categories of Recommendations with priority and reason
  const preventionModules = useMemo(() => {
    const raw = {
      lifestyle: apiData?.recommendations?.lifestyle || defaultRecommendations.lifestyle,
      diet: apiData?.recommendations?.diet || defaultRecommendations.diet,
      activity: apiData?.recommendations?.activity || defaultRecommendations.activity,
      medical: apiData?.recommendations?.medical || defaultRecommendations.medical,
    };

    return [
      {
        id: "diet",
        title: "Cardiovascular Nutrition",
        sub: "Targeted lipid reduction & dietary fiber",
        priority: "High Priority",
        priorityColor: "bg-red-500/10 text-red-600 border-red-500/25",
        reason: "Reduces circulating atherogenic LDL cholesterol and endothelial inflammatory load.",
        frequency: "Daily with all meals",
        icon: Apple,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10 border-emerald-500/20",
        items: raw.diet,
      },
      {
        id: "activity",
        title: "Physical Activity Strategy",
        sub: "Heart-rate adapted training targets",
        priority: "High Priority",
        priorityColor: "bg-amber-500/10 text-amber-600 border-amber-500/25",
        reason: "Improves chronotropic competence, lowers resting BP, and enhances myocardial perfusion.",
        frequency: "≥ 150 minutes / week",
        icon: Dumbbell,
        color: "text-amber-500",
        bg: "bg-amber-500/10 border-amber-500/20",
        items: raw.activity,
      },
      {
        id: "lifestyle",
        title: "Lifestyle Modifications",
        sub: "Circadian rhythm, stress & home tracking",
        priority: "Routine Priority",
        priorityColor: "bg-blue-500/10 text-blue-600 border-blue-500/25",
        reason: "Mitigates sympathetic nervous system overactivity and supports vascular rest.",
        frequency: "Continuous daily routine",
        icon: Activity,
        color: "text-blue-500",
        bg: "bg-blue-500/10 border-blue-500/20",
        items: raw.lifestyle,
      },
      {
        id: "medical",
        title: "Medical Specialist Follow-Up",
        sub: "Clinical consultations & diagnostic workup",
        priority: riskScore >= 70 ? "Urgent Priority" : "Standard Priority",
        priorityColor: riskScore >= 70 ? "bg-red-500/10 text-red-600 border-red-500/25" : "bg-primary/10 text-primary border-primary/25",
        reason: "Formal diagnostic validation of fluoroscopy, ECG, and stress markers by a licensed cardiologist.",
        frequency: riskScore >= 70 ? "Immediate (< 14 days)" : "Within 30–60 days",
        icon: Stethoscope,
        color: "text-red-500",
        bg: "bg-red-500/10 border-red-500/20",
        items: raw.medical,
      },
    ];
  }, [apiData, riskScore]);

  // 5 Models Consensus
  const modelResults = useMemo(() => {
    if (apiData?.model_results) {
      const mr = apiData.model_results;
      return [
        {
          name: "XGBoost (Primary ★)",
          key: "xgb",
          prob: mr.xgb?.probability ?? (riskScore / 100),
          accuracy: "91.4%",
          status: "Primary Decision Engine",
          error: mr.xgb?.error,
        },
        {
          name: "Random Forest",
          key: "rf",
          prob: mr.rf?.probability ?? null,
          accuracy: "89.5%",
          status: "Ensemble Validator",
          error: mr.rf?.error,
        },
        {
          name: "Neural Network",
          key: "nn",
          prob: mr.nn?.probability ?? null,
          accuracy: "88.6%",
          status: "Deep Learning Baseline",
          error: mr.nn?.error,
        },
        {
          name: "SVM (RBF Kernel)",
          key: "svm",
          prob: mr.svm?.probability ?? null,
          accuracy: "87.8%",
          status: "Kernel Classifier",
          error: mr.svm?.error,
        },
        {
          name: "Logistic Regression",
          key: "lr",
          prob: mr.lr?.probability ?? null,
          accuracy: "82.9%",
          status: "Linear Baseline",
          error: mr.lr?.error,
        },
      ];
    }
    return [];
  }, [apiData, riskScore]);

  const handleCopySummary = () => {
    const text = `AI-HEALTHGUARD | CLINICAL RISK ASSESSMENT SUMMARY
Session ID: ${sessionId}
Date: ${new Date().toLocaleDateString()}
Calculated IHD Risk Score: ${riskScore}/100 [ ${riskLevel} ]
Primary Model: XGBoost (Probability: ${(apiData?.probability ? apiData.probability * 100 : 0).toFixed(1)}%)

TOP SHAP BIOMARKER DRIVERS:
${shapDrivers.slice(0, 5).map((d) => `- ${d.label}: value=${d.value} (${d.direction === "risk" ? "+" : ""}${d.shap.toFixed(3)})`).join("\n")}

RECOMMENDED PREVENTIVE ACTIONS:
- Diet: ${preventionModules[0].items.slice(0, 2).join("; ")}
- Physical Activity: ${preventionModules[1].items.slice(0, 2).join("; ")}
- Lifestyle: ${preventionModules[2].items.slice(0, 2).join("; ")}
- Medical Follow-up: ${preventionModules[3].items.slice(0, 2).join("; ")}

Disclaimer: Clinical decision support research tool. Consult a certified cardiologist for formal evaluation.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Summary Copied to Clipboard",
      description: "Clinical summary report copied as text.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleHabit = (id: string) => {
    setCompletedHabits((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // PDF Export Function
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const primaryColor = [37, 99, 235];
      const darkColor = [15, 23, 42];

      // Header Banner
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("AI-HealthGuard | Clinical Risk Assessment Report", 14, 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("AI-HealthGuard | Clinical Decision Support System", 14, 21);
      doc.text(`Session ID: ${sessionId} | Date: ${new Date().toLocaleDateString()}`, 14, 27);

      // Risk Score Box
      let y = 42;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, 182, 36, 3, 3, "F");

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Calculated Ischemic Heart Disease (IHD) Risk Score", 20, y + 10);

      doc.setFontSize(28);
      const scoreColor = riskScore <= 39 ? [16, 185, 129] : riskScore <= 69 ? [245, 158, 11] : [239, 68, 68];
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(`${riskScore}/100`, 20, y + 24);

      doc.setFontSize(14);
      doc.text(`[ ${riskLevel} ]`, 70, y + 23);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(
        riskScore <= 39
          ? "Below-average IHD risk (0-39). Maintain healthy habits and routine annual checkups."
          : riskScore <= 69
          ? "Moderate IHD risk (40-69). Targeted lifestyle changes and physician follow-up advised."
          : "Elevated IHD risk (70-100). Comprehensive cardiologist evaluation strongly recommended.",
        20,
        y + 31
      );

      // Section 1: Top SHAP Risk Drivers
      y = 86;
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("1. Localized SHAP Biomarker Influence (Top Drivers)", 14, y);

      y += 6;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, "F");
      doc.text("Feature / Biomarker", 18, y + 5);
      doc.text("Patient Value", 85, y + 5);
      doc.text("SHAP Impact", 130, y + 5);
      doc.text("Classification", 165, y + 5);

      y += 7;
      doc.setFont("helvetica", "normal");
      if (shapDrivers.length > 0) {
        shapDrivers.slice(0, 5).forEach((d) => {
          doc.text(d.label, 18, y + 5);
          doc.text(String(d.value ?? "-"), 85, y + 5);
          doc.text(d.shap > 0 ? `+${d.shap.toFixed(3)}` : d.shap.toFixed(3), 130, y + 5);
          doc.setTextColor(d.direction === "risk" ? 220 : 16, d.direction === "risk" ? 38 : 140, 38);
          doc.text(d.direction === "risk" ? "Risk Driver" : "Protective Asset", 165, y + 5);
          doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
          y += 6;
        });
      }

      // Section 2: 4-Tier Personalized Prevention Plan
      y += 6;
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("2. 4-Category Personalized Prevention Plan", 14, y);

      y += 6;
      preventionModules.forEach((cat) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`• ${cat.title} (${cat.priority})`, 16, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        cat.items.slice(0, 2).forEach((item: string) => {
          const splitText = doc.splitTextToSize(`- ${item}`, 175);
          doc.text(splitText, 20, y);
          y += splitText.length * 4;
        });
        y += 2;
      });

      // Clinical Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Disclaimer: AI-HealthGuard is an AI-powered clinical decision support research tool.", 14, 285);
      doc.text("Predictions and SHAP values are for risk screening assistance; consult a licensed cardiologist for medical diagnoses.", 14, 289);

      doc.save(`AIHealthGuard_Report_${sessionId}.pdf`);
      toast({
        title: "PDF Report Generated",
        description: `Saved as AIHealthGuard_Report_${sessionId}.pdf`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "PDF Generation Failed",
        description: "An error occurred while building the PDF report.",
        variant: "destructive",
      });
    }
  };

  if (!patientData) {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center bg-aurora-mesh bg-grid-texture" id="main-content">
        <Heart className="mb-4 h-16 w-16 text-muted-foreground/40 animate-pulse" />
        <h2 className="font-heading text-2xl font-bold text-foreground">No Assessment Active</h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm">
          Please input clinical parameters in the Conversational Wizard to calculate IHD risk, localized SHAP drivers, and prevention plans.
        </p>
        <Link to="/assess" className="mt-6">
          <Button size="lg" className="btn-cta-glow rounded-xl font-bold">
            Launch New Assessment <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </main>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture flex flex-col items-center justify-center px-4 text-center" id="main-content">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-full bg-primary/15 flex items-center justify-center animate-ping absolute inset-0 opacity-75"></div>
          <div className="h-20 w-20 rounded-2xl bg-card/80 border border-primary/30 flex items-center justify-center relative shadow-glow">
            <Heart className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>
        <h2 className="font-heading text-2xl font-extrabold text-foreground">Running Inference & SHAP Analysis</h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
          Preprocessing clinical biomarkers, evaluating primary XGBoost model, and computing local game-theoretic feature attributions...
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-primary">
          <RefreshCw className="h-4 w-4 animate-spin" /> Processing Session {sessionId}
        </div>
      </main>
    );
  }

  // Error State - No Synthetic Fallback
  if (isError || !apiData) {
    return (
      <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture flex flex-col items-center justify-center px-4 text-center" id="main-content">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive shadow-sm">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="font-heading text-2xl font-extrabold text-foreground">Inference Request Failed</h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
          {error?.message || "The inference service could not calculate a risk score for the submitted parameters. Synthetic fallback is disabled."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl font-bold gap-2">
            <RefreshCw className="h-4 w-4" /> Retry Inference
          </Button>
          <Button onClick={() => navigate("/assess", { state: { formData: patientData } })} className="btn-cta-glow rounded-xl font-bold gap-2">
            <ArrowLeft className="h-4 w-4" /> Edit Biomarkers
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture px-4 py-10 sm:px-6 lg:px-8" id="main-content">
      {/* Assessment History Dialog */}
      <AssessmentHistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />

      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Session ID: {sessionId}</span>
              <span>•</span>
              <span className="text-primary font-bold">XGBoost Primary (SF-2 Top-10)</span>
            </div>
            <h1 className="font-heading mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Assessment Results & Prevention Workspace
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setHistoryOpen(true)}
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-border hover:bg-muted font-bold text-xs gap-2 shadow-sm"
            >
              <History className="h-4 w-4 text-primary" />
              <span>Assessment History</span>
            </Button>

            <Button
              onClick={handleCopySummary}
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-border hover:bg-muted font-bold text-xs gap-2 shadow-sm"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied" : "Copy Summary"}</span>
            </Button>

            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-border hover:bg-primary hover:text-primary-foreground font-bold text-xs gap-2 shadow-sm transition-all"
            >
              <Download className="h-4 w-4" /> PDF Report
            </Button>

            <Link to="/assess">
              <Button
                size="sm"
                className="btn-cta-glow h-10 rounded-xl px-4 font-bold text-xs gap-2 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" /> New Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* CONCEPT 3: Interactive Risk Reveal Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl p-6 border shadow-sm ${
            riskScore <= 39
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-950 dark:text-emerald-200"
              : riskScore <= 69
              ? "bg-amber-500/10 border-amber-500/25 text-amber-950 dark:text-amber-200"
              : "bg-red-500/10 border-red-500/25 text-red-950 dark:text-red-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl p-3 bg-background/80 backdrop-blur-md shadow-sm">
              {riskScore <= 39 ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              ) : riskScore <= 69 ? (
                <AlertCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              ) : (
                <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/60 border border-border/50">
                  Assessment Complete
                </span>
                <span className="text-xs font-mono font-bold">
                  Probability: {(apiData.probability * 100).toFixed(1)}%
                </span>
              </div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl mt-0.5">
                {riskScore <= 39
                  ? "Low Risk Profile Confirmed (0–39 Band)"
                  : riskScore <= 69
                  ? "Moderate Risk Profile Detected (40–69 Band)"
                  : "High Risk Profile Detected (70–100 Band)"}
              </h2>
              <p className="text-xs leading-relaxed opacity-90 mt-0.5 max-w-2xl">
                {riskScore <= 39
                  ? "Your calculated IHD risk score is within the lower clinical screening band. Maintain healthy habits and routine checkups."
                  : riskScore <= 69
                  ? "Your calculated IHD risk score falls in the moderate tier. Structured lifestyle modifications and physician follow-up are advised."
                  : "Your calculated IHD risk score indicates elevated risk. Prompt formal clinical evaluation by a cardiologist is strongly recommended."}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-background/80 border-current shadow-sm shrink-0"
          >
            {riskLevel}
          </Badge>
        </motion.div>

        {/* 5 Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1.5 bg-muted/70 backdrop-blur-md rounded-2xl gap-1 border border-border">
            <TabsTrigger value="risk" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm">
              <Heart className="h-4 w-4 mr-2" /> Risk Overview
            </TabsTrigger>
            <TabsTrigger value="shap" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm">
              <Sparkles className="h-4 w-4 mr-2 text-primary" /> SHAP Drivers
            </TabsTrigger>
            <TabsTrigger value="prevention" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm">
              <Shield className="h-4 w-4 mr-2" /> Prevention Workspace
            </TabsTrigger>
            <TabsTrigger value="models" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm">
              <Layers className="h-4 w-4 mr-2" /> 5-Model Consensus
            </TabsTrigger>
            <TabsTrigger value="clinical" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm col-span-2 sm:col-span-1">
              <Activity className="h-4 w-4 mr-2" /> Clinical Biomarkers
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Risk Overview */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Circular Gauge Card */}
              <div className="lg:col-span-5 card-elevated p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cardiovascular Risk Score
                </span>
                <RiskGauge score={riskScore} size="lg" />
                <div className="space-y-1 text-center">
                  <p className="text-xs font-semibold text-foreground">
                    XGBoost Primary Probability: <strong className="text-primary font-mono">{(apiData.probability * 100).toFixed(1)}%</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Benchmarked against 303 UCI Cleveland clinical profiles.
                  </p>
                </div>
              </div>

              {/* Strongest Drivers Preview */}
              <div className="lg:col-span-7 card-elevated p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" /> Strongest Risk Drivers
                    </h3>
                    <p className="text-xs text-muted-foreground">Biomarkers with the highest game-theoretic influence.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("shap")}
                    className="text-xs text-primary font-bold gap-1 h-8"
                  >
                    View All SHAP <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {shapDrivers.slice(0, 4).map((d) => (
                    <div key={d.feature} className="rounded-2xl border border-border/80 bg-card/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{d.label}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              d.direction === "risk"
                                ? "bg-red-500/10 text-red-600 border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            }`}
                          >
                            {d.direction === "risk" ? "Risk Contributor" : "Protective Factor"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{d.explanation}</p>
                      </div>
                      <div className="text-right sm:shrink-0 font-mono text-xs font-bold">
                        <span className={d.direction === "risk" ? "text-red-500" : "text-emerald-500"}>
                          {d.shap > 0 ? `+${d.shap.toFixed(3)}` : d.shap.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: CONCEPT 4 - Explainable AI SHAP Risk Drivers */}
          <TabsContent value="shap" className="space-y-6">
            <div className="card-elevated p-6 sm:p-8 space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Localized SHAP Explainability Breakdown
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  SHAP (SHapley Additive exPlanations) uses cooperative game theory to quantify how much each biomarker pushed your predicted risk above (red) or below (green) the population baseline.
                </p>
              </div>

              {/* Horizontal Contribution Waterfall / Diverging Bar Display */}
              <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground border-b border-border/40 pb-2">
                  <span>Biomarker Feature</span>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-500">◀ Lower Predicted Risk (Protective)</span>
                    <span className="text-red-500">Higher Predicted Risk (Risk) ▶</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {shapDrivers.map((d) => {
                    const isRisk = d.direction === "risk";
                    const barWidth = Math.min(100, Math.max(10, Math.abs(d.shap) * 140));

                    return (
                      <div key={d.feature} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">{d.label}</span>
                          <span className="font-mono text-muted-foreground text-[11px]">
                            Patient Value: <strong className="text-foreground">{d.value ?? "-"}</strong> • Impact:{" "}
                            <strong className={isRisk ? "text-red-500" : "text-emerald-500"}>
                              {d.shap > 0 ? `+${d.shap.toFixed(4)}` : d.shap.toFixed(4)}
                            </strong>
                          </span>
                        </div>

                        {/* Centered Diverging Bar */}
                        <div className="grid grid-cols-2 gap-1 h-3 rounded-full bg-muted/40 p-0.5">
                          {/* Left (Protective) half */}
                          <div className="flex justify-end">
                            {!isRisk && (
                              <div
                                className="h-full rounded-full bg-emerald-500 shadow-glow-emerald"
                                style={{ width: `${barWidth}%` }}
                              />
                            )}
                          </div>
                          {/* Right (Risk) half */}
                          <div className="flex justify-start">
                            {isRisk && (
                              <div
                                className="h-full rounded-full bg-red-500 shadow-glow-red"
                                style={{ width: `${barWidth}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Driver Actionable Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {shapDrivers.map((d) => (
                  <div
                    key={d.feature}
                    className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-sm font-bold text-foreground">
                          {d.label}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            d.direction === "risk"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          }`}
                        >
                          {d.direction === "risk" ? (
                            <span className="flex items-center gap-1">
                              <ArrowUpRight className="h-3 w-3" /> Risk Contributor
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ArrowDownRight className="h-3 w-3" /> Protective Factor
                            </span>
                          )}
                        </Badge>
                      </div>

                      <div className="text-[11px] font-mono text-muted-foreground">
                        Your Value: <strong className="text-foreground">{d.value ?? "—"}</strong>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {d.explanation}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/50 text-[11px] text-foreground bg-primary/5 p-2.5 rounded-xl border border-primary/10">
                      <strong className="text-primary">Suggested Takeaway:</strong> {d.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: CONCEPT 5 - Prevention Plan Workspace */}
          <TabsContent value="prevention" className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> 4-Tier Personalized Prevention Workspace
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Actionable, evidence-based cardiovascular prevention goals. Check off completed items to track your personal prevention routine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {preventionModules.map((module) => {
                const Icon = module.icon;

                return (
                  <div key={module.id} className="card-elevated p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center font-bold ${module.bg}`}>
                            <Icon className={`h-5 w-5 ${module.color}`} />
                          </div>
                          <div>
                            <h4 className="font-heading text-sm font-bold text-foreground">{module.title}</h4>
                            <p className="text-[11px] text-muted-foreground">{module.sub}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-bold ${module.priorityColor}`}>
                          {module.priority}
                        </Badge>
                      </div>

                      {/* Rationale & Frequency */}
                      <div className="rounded-xl bg-background/60 p-3 border border-border/60 text-xs space-y-1">
                        <div><strong className="text-foreground">Clinical Reason:</strong> <span className="text-muted-foreground">{module.reason}</span></div>
                        <div><strong className="text-primary">Suggested Frequency:</strong> <span className="text-muted-foreground">{module.frequency}</span></div>
                      </div>

                      {/* Checkable Action Items */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Action Items Checklist
                        </span>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          {module.items.map((item, idx) => {
                            const habitId = `${module.id}-${idx}`;
                            const isDone = completedHabits[habitId];

                            return (
                              <li
                                key={idx}
                                onClick={() => toggleHabit(habitId)}
                                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                                  isDone
                                    ? "bg-primary/10 border-primary/30 text-foreground line-through opacity-70"
                                    : "bg-card/70 border-border/80 hover:border-primary/40 hover:bg-card text-foreground"
                                }`}
                              >
                                {isDone ? (
                                  <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                )}
                                <span className="font-medium leading-relaxed">{item}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 4: 5-Model Consensus */}
          <TabsContent value="models" className="space-y-6">
            <div className="card-elevated p-6 sm:p-8 space-y-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" /> Multi-Model Architecture Consensus
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Comparative probability outputs computed across the 5 machine learning architectures. XGBoost is enforced as the primary clinical engine.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="py-3 px-4 font-bold text-foreground">Model Architecture</th>
                      <th className="py-3 px-4 font-bold text-foreground">Role</th>
                      <th className="py-3 px-4 font-bold text-foreground text-center">Benchmark Accuracy</th>
                      <th className="py-3 px-4 font-bold text-foreground text-center">Inference Probability</th>
                      <th className="py-3 px-4 font-bold text-foreground text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {modelResults.map((m) => (
                      <tr key={m.name} className={m.key === "xgb" ? "bg-primary/5 font-semibold" : ""}>
                        <td className="py-3.5 px-4 font-bold text-foreground">{m.name}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{m.status}</td>
                        <td className="py-3.5 px-4 text-center">{m.accuracy}</td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          {m.prob !== null ? `${(m.prob * 100).toFixed(1)}%` : <span className="text-muted-foreground">N/A</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {m.error ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                              Unavailable
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                              Active
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: Clinical Biomarkers */}
          <TabsContent value="clinical" className="space-y-6">
            <div className="card-elevated p-6 sm:p-8 space-y-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Submitted Clinical Biomarkers (13 Parameters)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Reference physiological values evaluated in this assessment session.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featureFields.map((f) => {
                  const val = patientData[f.name];
                  const opt = f.options?.find((o) => o.value === val);
                  const displayVal = opt ? opt.label : val || "—";

                  return (
                    <div key={f.name} className="rounded-2xl border border-border/80 p-3.5 bg-card/50 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground">{f.label} ({f.name})</div>
                      <div className="text-sm font-bold text-foreground font-mono">{displayVal}</div>
                      <div className="text-[10px] text-muted-foreground">{f.unit || "Categorical"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Persistent Trust & Safety Banner */}
        <TrustSafetyBanner className="mt-8" />
      </div>
    </main>
  );
}
