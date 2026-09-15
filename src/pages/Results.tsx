import { useState, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskGauge } from "@/components/RiskGauge";
import { featureFields, recommendations as defaultRecommendations, modelComparison } from "@/lib/mockData";
import { useSEO } from "@/hooks/useSEO";
import { useToast } from "@/hooks/use-toast";
import { predictRisk, PredictionResponse } from "@/lib/api";
import jsPDF from "jspdf";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const patientData = location.state?.patientData as Record<string, string> | undefined;

  useSEO({
    title: "IHD Risk Assessment Results | AI-HealthGuard",
    description: "Machine-learning risk assessment with SHAP explainability, 5-model consensus, and 4-tier personalized cardiovascular prevention planning.",
  });

  const [activeTab, setActiveTab] = useState("risk");
  const sessionId = useMemo(() => `AI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, []);

  // API Query for Real Inference & SHAP using src/lib/api.ts abstraction
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
          return {
            feature: feat,
            label: fieldMeta ? `${fieldMeta.label} (${feat})` : feat,
            value: apiData.shap.features[feat],
            shap: val,
            direction: val >= 0 ? ("risk" as const) : ("protective" as const),
          };
        })
        .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
        .slice(0, 10);
    }
    return [];
  }, [apiData]);

  // 4 Categories of Recommendations
  const recommendationsData = useMemo(() => {
    return {
      lifestyle: apiData?.recommendations?.lifestyle || defaultRecommendations.lifestyle,
      diet: apiData?.recommendations?.diet || defaultRecommendations.diet,
      activity: apiData?.recommendations?.activity || defaultRecommendations.activity,
      medical: apiData?.recommendations?.medical || defaultRecommendations.medical,
    };
  }, [apiData]);

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
          status: "Primary Model (Enforced)",
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
          status: "Deep Learning",
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

  // PDF Export Function
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const primaryColor = [37, 99, 235]; // Blue
      const darkColor = [15, 23, 42]; // Slate-900

      // Header Banner
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("AI-HealthGuard | Clinical Risk Assessment Report", 14, 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("GL Bajaj Group of Institutions, Mathura | Dept. of Computer Science & Engineering", 14, 21);
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

      // Section: Top SHAP Risk Drivers
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
      } else {
        doc.text("SHAP feature attributions not available for this run.", 18, y + 5);
        y += 6;
      }

      // Section: 4-Tier Personalized Prevention Plan
      y += 6;
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("2. 4-Category Personalized Prevention Plan", 14, y);

      const catList = [
        { name: "Dietary Guidance", items: recommendationsData.diet.slice(0, 2) },
        { name: "Physical Activity Strategy", items: recommendationsData.activity.slice(0, 2) },
        { name: "Lifestyle Modifications", items: recommendationsData.lifestyle.slice(0, 2) },
        { name: "Medical Interventions & Referrals", items: recommendationsData.medical.slice(0, 2) },
      ];

      y += 6;
      catList.forEach((cat) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`• ${cat.name}`, 16, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        cat.items.forEach((item: string) => {
          const splitText = doc.splitTextToSize(`- ${item}`, 175);
          doc.text(splitText, 20, y);
          y += splitText.length * 4;
        });
        y += 2;
      });

      // Academic & Clinical Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Disclaimer: AI-HealthGuard is an AI-powered clinical decision support research tool developed at GL Bajaj Group of Institutions.", 14, 285);
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
      <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center" id="main-content">
        <Heart className="mb-4 h-16 w-16 text-muted-foreground/40 animate-pulse" />
        <h2 className="text-2xl font-bold text-foreground">No Assessment Active</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Please input clinical parameters to calculate IHD risk, localized SHAP drivers, and prevention plans.
        </p>
        <Link to="/assess" className="mt-6">
          <Button size="lg" className="rounded-xl font-bold">
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

  // Error State - No Fake Data Fallback
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
            <ArrowLeft className="h-4 w-4" /> Edit Parameters
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture px-4 py-10 sm:px-6 lg:px-8" id="main-content">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Session ID: {sessionId}</span>
              <span>•</span>
              <span className="text-primary font-bold">XGBoost Primary (SF-2 Top-10)</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              IHD Risk Assessment Results
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-border hover:bg-primary hover:text-primary-foreground font-semibold gap-2 transition-all shadow-sm"
            >
              <Download className="h-4 w-4" /> PDF Report
            </Button>
            <Link to="/assess">
              <Button
                size="sm"
                className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" /> New Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-4 rounded-2xl p-5 border shadow-sm ${
            riskScore <= 39
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
              : riskScore <= 69
              ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
              : "bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-200"
          }`}
        >
          <div className="mt-0.5 rounded-lg p-2 bg-background/50 backdrop-blur-sm">
            {riskScore <= 39 ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : riskScore <= 69 ? (
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              {riskScore <= 39
                ? "Low Risk Profile Confirmed (0–39 Band)"
                : riskScore <= 69
                ? "Moderate Risk Profile Detected (40–69 Band)"
                : "High Risk Profile Detected (70–100 Band)"}
            </h3>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed opacity-90">
              {riskScore <= 39
                ? "Your calculated IHD risk score is within the lower clinical screening band. Maintain healthy cardiovascular habits and routine annual checkups."
                : riskScore <= 69
                ? "Your calculated IHD risk score falls in the moderate tier. Structured lifestyle modifications and primary care follow-up are advised."
                : "Your calculated IHD risk score indicates elevated risk. Prompt formal clinical evaluation by a cardiologist is strongly recommended."}
            </p>
          </div>
        </motion.div>

        {/* 5 Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1.5 bg-muted/60 rounded-2xl gap-1">
            <TabsTrigger value="risk" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm">
              <Heart className="h-4 w-4 mr-2" /> Risk Overview
            </TabsTrigger>
            <TabsTrigger value="shap" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm">
              <Sparkles className="h-4 w-4 mr-2 text-primary" /> SHAP Drivers
            </TabsTrigger>
            <TabsTrigger value="prevention" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm">
              <Shield className="h-4 w-4 mr-2" /> Prevention Plan
            </TabsTrigger>
            <TabsTrigger value="models" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm">
              <Layers className="h-4 w-4 mr-2" /> 5-Model Consensus
            </TabsTrigger>
            <TabsTrigger value="clinical" className="rounded-xl py-2.5 font-bold text-xs sm:text-sm col-span-2 sm:col-span-1">
              <Activity className="h-4 w-4 mr-2" /> Clinical Details
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Risk Overview */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center">
                <RiskGauge score={riskScore} size="lg" />
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Badge
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      riskScore <= 39
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : riskScore <= 69
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                  >
                    {riskLevel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Threshold: 70+</span>
                </div>
                <p className="mt-4 text-xs text-muted-foreground max-w-xs">
                  XGBoost probability estimate: <strong className="text-foreground">{(apiData.probability * 100).toFixed(1)}%</strong>
                </p>
              </div>

              <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Key Biomarker Influence
                </h3>
                <div className="space-y-3">
                  {shapDrivers.slice(0, 4).map((d) => (
                    <div key={d.feature} className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-foreground">{d.label}</div>
                        <div className="text-[11px] text-muted-foreground">Value: {d.value ?? "-"}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs font-bold ${
                          d.direction === "risk"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}
                      >
                        {d.shap > 0 ? `+${d.shap.toFixed(3)}` : d.shap.toFixed(3)} {d.direction === "risk" ? "Risk" : "Protective"}
                      </Badge>
                    </div>
                  ))}
                  {shapDrivers.length === 0 && (
                    <p className="text-xs text-muted-foreground">Local feature attribution calculated for this profile.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: SHAP Drivers */}
          <TabsContent value="shap" className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Local SHAP Attribution Summary
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Game-theoretic feature attributions quantifying how each biomarker pushes risk higher (red) or lower (green) relative to the baseline.
                </p>
              </div>

              <div className="space-y-4">
                {shapDrivers.map((d) => (
                  <div key={d.feature} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{d.label}</span>
                      <span className="font-mono text-muted-foreground">
                        val={d.value} | SHAP: {d.shap > 0 ? `+${d.shap.toFixed(4)}` : d.shap.toFixed(4)}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          d.direction === "risk" ? "bg-red-500" : "bg-emerald-500 ml-auto"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, Math.abs(d.shap) * 120))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Prevention Plan */}
          <TabsContent value="prevention" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lifestyle */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Lifestyle Guidance</h4>
                    <p className="text-xs text-muted-foreground">Habits, stress & biometric monitoring</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  {recommendationsData.lifestyle.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Diet */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <Apple className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Cardiovascular Nutrition</h4>
                    <p className="text-xs text-muted-foreground">DASH/Mediterranean dietary principles</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  {recommendationsData.diet.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Physical Activity */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Physical Activity</h4>
                    <p className="text-xs text-muted-foreground">Heart-rate adapted exercise prescription</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  {recommendationsData.activity.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinical & Physician Review */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Physician Review & Clinical Follow-up</h4>
                    <p className="text-xs text-muted-foreground">Diagnostic workup recommendations</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  {recommendationsData.medical.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="font-medium text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: 5-Model Consensus */}
          <TabsContent value="models" className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" /> Multi-Model Architecture Consensus
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Individual probability estimates generated across the 5 machine learning models. XGBoost serves as the primary risk decision engine.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="py-3 px-4 font-bold text-foreground">Model</th>
                      <th className="py-3 px-4 font-bold text-foreground">Role</th>
                      <th className="py-3 px-4 font-bold text-foreground text-center">Benchmark Accuracy</th>
                      <th className="py-3 px-4 font-bold text-foreground text-center">Calculated Probability</th>
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

          {/* TAB 5: Clinical Details */}
          <TabsContent value="clinical" className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Submitted Clinical Biomarkers
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Reference values entered for this assessment session.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featureFields.map((f) => {
                  const val = patientData[f.name];
                  return (
                    <div key={f.name} className="rounded-2xl border border-border p-3.5 bg-muted/10 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground">{f.label} ({f.name})</div>
                      <div className="text-sm font-bold text-foreground font-mono">{val ?? "—"}</div>
                      <div className="text-[10px] text-muted-foreground">{f.unit || "Categorical indicator"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
