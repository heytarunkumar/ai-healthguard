import { useState, useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  Info,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
  Activity,
  Sliders,
  User,
  Flame,
  Zap,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { featureFields, samplePresets } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { EcgWave } from "@/components/EcgWave";
import { TrustSafetyBanner } from "@/components/TrustSafetyBanner";

// Detailed clinical rationales for "Why do we ask this?"
const clinicalRationales: Record<string, { why: string; impact: string }> = {
  age: {
    why: "Cardiovascular arterial elasticity declines with age. Risk increases after age 45 for men and age 55 for women.",
    impact: "Non-modifiable baseline risk factor that weighs into composite cardiovascular aging index.",
  },
  sex: {
    why: "Biological sex influences plaque deposition morphology, hormonal protection, and microvascular symptom presentation.",
    impact: "Calibrates baseline epidemiological incidence rates across male and female sub-cohorts.",
  },
  cp: {
    why: "Chest pain classification categorizes whether discomfort is classical exertional ischemia, atypical, non-anginal, or asymptomatic.",
    impact: "Strongest predictor of acute ischemic events. Asymptomatic ischemia represents silent heart disease.",
  },
  trestbps: {
    why: "Elevated resting blood pressure strains the arterial walls, promoting endothelial damage and ventricular hypertrophy.",
    impact: "Hypertension (≥ 130 mmHg) accelerates arterial plaque buildup.",
  },
  chol: {
    why: "Excess circulating low-density lipoprotein (LDL) cholesterol penetrates the vascular endothelium, forming coronary atheroma.",
    impact: "High serum cholesterol (≥ 200 mg/dL) directly elevates atherogenic risk.",
  },
  fbs: {
    why: "Fasting blood sugar above 120 mg/dL serves as an indicator of insulin resistance, diabetes mellitus, or impaired glucose tolerance.",
    impact: "Diabetes triples coronary artery disease risk due to systemic microvascular inflammation.",
  },
  restecg: {
    why: "Resting 12-lead electrocardiogram detects baseline electrical conduction anomalies, ST-T wave inversions, or left ventricular hypertrophy.",
    impact: "Signals underlying myocardial strain or silent previous subendocardial injury.",
  },
  thalach: {
    why: "Maximum heart rate achieved during graded treadmill exertion reflects chronotropic competence and coronary reserve.",
    impact: "Higher exercise tolerance (higher thalach) is strongly protective against adverse cardiac events.",
  },
  exang: {
    why: "Angina provoked specifically by physical exertion occurs when oxygen demand outstrips myocardial oxygen supply.",
    impact: "Direct clinical symptom indicating hemodynamically significant coronary arterial narrowing.",
  },
  oldpeak: {
    why: "ST-segment depression measured during peak exercise relative to baseline rest indicates ischemic hypoxia of the subendocardium.",
    impact: "One of the top 3 strongest SHAP feature drivers for high-grade stenosis.",
  },
  slope: {
    why: "The trajectory of the ST-segment during recovery (upsloping, flat, or downsloping) reflects myocardial repolarization kinetics.",
    impact: "Flat and downsloping recovery morphology strongly correlates with multivessel coronary disease.",
  },
  ca: {
    why: "Fluoroscopic angiography visualizes the number of major coronary vessels with luminal calcification or obstructive narrowing (0–3).",
    impact: "Direct anatomic marker of multivessel ischemic burden.",
  },
  thal: {
    why: "Nuclear thallium myocardial perfusion scintigraphy identifies fixed scar tissue versus reversible exercise-induced ischemia.",
    impact: "Reversible defect (3) indicates viable heart tissue at imminent risk of ischemic infarction.",
  },
};

const STAGES = [
  { id: 1, title: "Demographics", sub: "Age & biological sex", fields: ["age", "sex"] },
  { id: 2, title: "Symptoms", sub: "Chest pain & angina", fields: ["cp", "exang"] },
  { id: 3, title: "Vitals & Metabolic", sub: "BP, cholesterol & sugar", fields: ["trestbps", "chol", "fbs"] },
  { id: 4, title: "Electrocardiography", sub: "Resting ECG & ST segment", fields: ["restecg", "oldpeak", "slope"] },
  { id: 5, title: "Cardiac Stress & Anatomy", sub: "Max HR, vessels & thal", fields: ["thalach", "ca", "thal"] },
  { id: 6, title: "Clinical Review", sub: "Verify 13 parameters", fields: [] },
];

export default function RiskAssessment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const stateData = (location.state?.formData || location.state?.patientData) as Record<string, string> | undefined;

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [formData, setFormData] = useState<Record<string, string>>(
    stateData || {
      age: "52",
      sex: "1",
      cp: "3",
      trestbps: "140",
      chol: "268",
      fbs: "0",
      restecg: "1",
      thalach: "134",
      exang: "1",
      oldpeak: "2.4",
      slope: "1",
      ca: "2",
      thal: "3",
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activePreset, setActivePreset] = useState<string>(stateData ? "" : "high_risk");
  const [openWhy, setOpenWhy] = useState<Record<string, boolean>>({});

  useSEO({
    title: "Conversational Assessment Wizard | AI-HealthGuard",
    description: "Multi-stage guided cardiovascular risk assessment wizard with inline clinical explanations and real-time biomarker validation.",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleWhy = (name: string) => {
    setOpenWhy((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = samplePresets.find((p) => p.id === presetId);
    if (!preset) return;
    setFormData(preset.data);
    setErrors({});
    setActivePreset(presetId);
    toast({
      title: "Sample Profile Loaded",
      description: preset.label,
    });
  };

  const clearForm = () => {
    setFormData({
      age: "", sex: "", cp: "", trestbps: "", chol: "", fbs: "",
      restecg: "", thalach: "", exang: "", oldpeak: "", slope: "", ca: "", thal: "",
    });
    setErrors({});
    setActivePreset("");
    setCurrentStage(1);
    toast({ title: "Form Cleared", description: "All parameters have been reset." });
  };

  const validateStage = (stageIdx: number): boolean => {
    if (stageIdx === 6) return true; // Review stage
    const currentFields = STAGES[stageIdx - 1].fields;
    const newErrors: Record<string, string> = {};
    let isValid = true;

    currentFields.forEach((fieldName) => {
      const field = featureFields.find((f) => f.name === fieldName);
      if (!field) return;
      const val = formData[fieldName];

      if (val === undefined || val === "") {
        newErrors[fieldName] = "Required";
        isValid = false;
      } else if (field.type === "number") {
        const num = parseFloat(val);
        if (isNaN(num)) {
          newErrors[fieldName] = "Numeric required";
          isValid = false;
        } else if (field.min !== undefined && num < field.min) {
          newErrors[fieldName] = `Minimum: ${field.min}`;
          isValid = false;
        } else if (field.max !== undefined && num > field.max) {
          newErrors[fieldName] = `Maximum: ${field.max}`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    featureFields.forEach((field) => {
      const val = formData[field.name];
      if (val === undefined || val === "") {
        newErrors[field.name] = "Required";
        isValid = false;
      } else if (field.type === "number") {
        const num = parseFloat(val);
        if (isNaN(num)) {
          newErrors[field.name] = "Numeric required";
          isValid = false;
        } else if (field.min !== undefined && num < field.min) {
          newErrors[field.name] = `Min: ${field.min}`;
          isValid = false;
        } else if (field.max !== undefined && num > field.max) {
          newErrors[field.name] = `Max: ${field.max}`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStage(currentStage)) {
      if (currentStage < STAGES.length) {
        setCurrentStage((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast({
        title: "Please complete this stage",
        description: "One or more values need your attention before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePrev = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast({
        title: "Incomplete Biomarkers",
        description: "Please check the highlighted fields before calculating.",
        variant: "destructive",
      });
      return;
    }

    navigate("/results", { state: { patientData: formData } });
  };

  // Calculate filled parameters count
  const filledCount = featureFields.filter(
    (f) => formData[f.name] !== undefined && formData[f.name] !== ""
  ).length;

  const currentStageMeta = STAGES[currentStage - 1];

  return (
    <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture px-4 py-10 sm:px-6 lg:px-8" id="main-content">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-glow"
          >
            <Heart className="h-7 w-7 text-primary fill-primary/10" />
          </motion.div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Conversational Assessment Wizard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Guided 6-stage cardiovascular evaluation. Enter the 13 clinical biomarkers with transparent explanations for why each biomarker is requested.
          </p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border transition-colors ${
                filledCount === 13
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 shadow-glow-emerald"
                  : "bg-muted/60 text-muted-foreground border-border"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
              {filledCount}/13 Biomarkers Configured
            </span>
          </div>
        </div>

        {/* Preset Sample Selector Bar */}
        <div className="card-elevated p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mr-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Load Sample Profiles:
            </span>
            {samplePresets.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/60 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {preset.label.split(" (")[0]}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearForm}
            className="text-xs font-semibold text-muted-foreground hover:text-destructive gap-1.5 h-8"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Form
          </Button>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div className="card-elevated p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-primary uppercase tracking-wider">
              Stage {currentStage} of {STAGES.length}: {currentStageMeta.title}
            </span>
            <span className="text-muted-foreground font-mono">
              {Math.round(((currentStage) / STAGES.length) * 100)}% Complete
            </span>
          </div>

          {/* Stepper Pill Track */}
          <div className="grid grid-cols-6 gap-2">
            {STAGES.map((s) => {
              const isCompleted = s.id < currentStage;
              const isCurrent = s.id === currentStage;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id < currentStage) {
                      setCurrentStage(s.id);
                    } else if (s.id > currentStage) {
                      let canAdvance = true;
                      for (let st = 1; st < s.id; st++) {
                        if (!validateStage(st)) {
                          canAdvance = false;
                          setCurrentStage(st);
                          toast({
                            title: `Incomplete Stage ${st}`,
                            description: "Please complete required biomarkers before advancing.",
                            variant: "destructive",
                          });
                          break;
                        }
                      }
                      if (canAdvance) {
                        setCurrentStage(s.id);
                      }
                    }
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 shadow-glow-emerald"
                      : isCurrent
                      ? "bg-primary shadow-glow"
                      : "bg-muted/60"
                  }`}
                  title={`Stage ${s.id}: ${s.title}`}
                />
              );
            })}
          </div>

          {/* Stepper Stage Title Badges */}
          <div className="hidden sm:grid grid-cols-6 gap-2 pt-1 text-center">
            {STAGES.map((s) => (
              <span
                key={s.id}
                className={`text-[11px] font-bold truncate ${
                  s.id === currentStage
                    ? "text-primary font-extrabold"
                    : s.id < currentStage
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground/70"
                }`}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Active Stage Content Card */}
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <TooltipProvider delayDuration={150}>
            <AnimatePresence mode="wait">
              {currentStage <= 5 ? (
                <motion.div
                  key={currentStage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="card-elevated p-6 sm:p-8 space-y-6"
                >
                  <div className="border-b border-border pb-4">
                    <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Stage {currentStage}: {currentStageMeta.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {currentStageMeta.sub}
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {currentStageMeta.fields.map((fieldName) => {
                      const field = featureFields.find((f) => f.name === fieldName);
                      if (!field) return null;
                      const rationale = clinicalRationales[fieldName];
                      const isWhyOpen = openWhy[fieldName];

                      return (
                        <div
                          key={field.name}
                          className={`rounded-2xl border p-4 space-y-3 transition-all ${
                            errors[field.name]
                              ? "border-destructive/80 bg-destructive/5"
                              : "border-border/80 bg-card/60 hover:border-primary/40 focus-within:border-primary"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor={field.name}
                              className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer"
                            >
                              {field.label}
                            </Label>
                            {field.unit && (
                              <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                                {field.unit}
                              </span>
                            )}
                          </div>

                          {field.type === "select" ? (
                            <Select
                              value={formData[field.name] || ""}
                              onValueChange={(val) => handleChange(field.name, val)}
                            >
                              <SelectTrigger
                                id={field.name}
                                className="h-11 rounded-xl bg-background/90 border-border text-xs font-semibold focus:ring-0"
                              >
                                <SelectValue placeholder="Select diagnostic option..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {field.options?.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-xs py-2">
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={field.name}
                              type="number"
                              step="any"
                              value={formData[field.name] || ""}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              placeholder={field.placeholder || `Range: ${field.min ?? 0} – ${field.max ?? 500}`}
                              className="h-11 rounded-xl bg-background/90 border-border text-xs font-semibold font-mono focus-visible:ring-0"
                            />
                          )}

                          {errors[field.name] && (
                            <p className="text-[10px] font-bold text-destructive animate-pulse">
                              {errors[field.name]}
                            </p>
                          )}

                          {/* "Why do we ask this?" Educational Card */}
                          {rationale && (
                            <div className="pt-1 border-t border-border/40">
                              <button
                                type="button"
                                onClick={() => toggleWhy(fieldName)}
                                className="flex items-center justify-between w-full text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                              >
                                <span className="flex items-center gap-1">
                                  <HelpCircle className="h-3 w-3" /> Why do we ask this?
                                </span>
                                {isWhyOpen ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>

                              <AnimatePresence>
                                {isWhyOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="mt-2 space-y-1 rounded-xl bg-primary/5 p-2.5 border border-primary/15 text-[11px] text-muted-foreground leading-relaxed overflow-hidden"
                                  >
                                    <p><strong className="text-foreground">Clinical Purpose:</strong> {rationale.why}</p>
                                    <p><strong className="text-primary">ML Impact:</strong> {rationale.impact}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* STAGE 6: FINAL CLINICAL REVIEW */
                <motion.div
                  key="review"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="card-elevated p-6 sm:p-8 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                    <div>
                      <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-emerald-500" />
                        Stage 6: Final Clinical Review & Confirmation
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Verify all 13 patient biomarkers before executing XGBoost inference and SHAP attribution.
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold">
                      {filledCount}/13 Complete
                    </Badge>
                  </div>

                  {/* Grouped summary tables */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {featureFields.map((f) => {
                      const val = formData[f.name];
                      const opt = f.options?.find((o) => o.value === val);
                      const displayVal = opt ? opt.label : val || "Not set";

                      return (
                        <div
                          key={f.name}
                          className="rounded-2xl border border-border/80 bg-card/60 p-3.5 space-y-1 flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              {f.label} ({f.name})
                            </span>
                            <div className="font-heading text-xs font-bold text-foreground truncate mt-0.5">
                              {displayVal}
                            </div>
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            {f.unit ? `Unit: ${f.unit}` : "Categorical"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TooltipProvider>

          {/* Navigation Action Controls */}
          <div className="card-elevated p-5 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStage === 1}
              className="h-12 rounded-xl px-5 text-xs font-bold gap-2 border-border"
            >
              <ArrowLeft className="h-4 w-4" /> Previous Stage
            </Button>

            {currentStage < STAGES.length ? (
              <Button
                type="button"
                onClick={handleNext}
                className="btn-cta-glow h-12 rounded-xl px-7 text-xs font-bold gap-2 shadow-glow"
              >
                <span>Continue to Stage {currentStage + 1}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="btn-cta-glow h-12 rounded-xl px-8 text-xs font-bold gap-2 shadow-glow"
              >
                <Sparkles className="h-4 w-4" /> Calculate Risk & SHAP Drivers <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Persistent Trust & Safety Banner */}
        <TrustSafetyBanner className="mt-8" />
      </div>
    </main>
  );
}
