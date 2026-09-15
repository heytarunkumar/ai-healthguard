import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Info,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
  Activity,
  Sliders,
  User,
  Flame,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { motion } from "framer-motion";
import { EcgWave } from "@/components/EcgWave";

export default function RiskAssessment() {
  const [formData, setFormData] = useState<Record<string, string>>({
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activePreset, setActivePreset] = useState<string>("sample-high");
  const navigate = useNavigate();
  const { toast } = useToast();

  useSEO({
    title: "IHD Risk Assessment | AI-HealthGuard",
    description: "Enter your 13 clinical biomarkers to compute Ischemic Heart Disease probability, SHAP risk drivers, and personalized prevention guidance.",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
    setFormData({});
    setErrors({});
    setActivePreset("");
    toast({ title: "Form Cleared", description: "All input fields have been reset." });
  };

  const validateAll = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast({
        title: "Incomplete Parameters",
        description: "Please check the highlighted fields before calculating.",
        variant: "destructive",
      });
      return;
    }

    navigate("/results", { state: { patientData: formData } });
  };

  // 3 Clinical Categories for grouping the 13 biomarkers
  const demographicFields = featureFields.filter((f) =>
    ["age", "sex", "trestbps", "chol", "fbs"].includes(f.name)
  );
  const stressFields = featureFields.filter((f) =>
    ["cp", "thalach", "exang", "oldpeak", "slope"].includes(f.name)
  );
  const biomarkerFields = featureFields.filter((f) =>
    ["restecg", "ca", "thal"].includes(f.name)
  );

  // Calculate filled parameters count
  const filledCount = featureFields.filter(
    (f) => formData[f.name] !== undefined && formData[f.name] !== ""
  ).length;

  return (
    <main className="min-h-screen bg-background bg-aurora-mesh bg-grid-texture px-4 py-12 sm:px-6 lg:px-8" id="main-content">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-glow"
          >
            <Heart className="h-7 w-7 text-primary fill-primary/10" />
          </motion.div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            IHD Risk Assessment
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Enter the patient's 13 clinical biomarkers to run real-time XGBoost inference, calculate localized SHAP attributions, and generate customized prevention recommendations.
          </p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
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

        {/* Preset Sample Bar */}
        <div className="card-elevated p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mr-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Quick Sample Cases:
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
                  {preset.label}
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
            <RotateCcw className="h-3.5 w-3.5" /> Clear All
          </Button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <TooltipProvider delayDuration={150}>
            {/* Category 1: Demographics & Baseline Vitals */}
            <div className="card-elevated p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-foreground">
                    1. Demographics & Baseline Vitals
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Age, biological sex, resting blood pressure, cholesterol, and fasting blood sugar.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {demographicFields.map((field) => (
                  <InputField
                    key={field.name}
                    field={field}
                    value={formData[field.name] || ""}
                    error={errors[field.name]}
                    onChange={(val) => handleChange(field.name, val)}
                  />
                ))}
              </div>
            </div>

            {/* Category 2: Cardiac Stress & Functional Testing */}
            <div className="card-elevated p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Flame className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-foreground">
                    2. Cardiac Stress & Functional Testing
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Chest pain symptomatic classification, peak heart rate, exertional angina, ST depression & slope.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stressFields.map((field) => (
                  <InputField
                    key={field.name}
                    field={field}
                    value={formData[field.name] || ""}
                    error={errors[field.name]}
                    onChange={(val) => handleChange(field.name, val)}
                  />
                ))}
              </div>
            </div>

            {/* Category 3: Diagnostic Biomarkers & Fluoroscopy */}
            <div className="card-elevated p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-foreground">
                    3. Electrocardiography & Fluoroscopy
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Resting ECG evaluation, fluoroscopy major vessel count, and thalassemia blood flow defect.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {biomarkerFields.map((field) => (
                  <InputField
                    key={field.name}
                    field={field}
                    value={formData[field.name] || ""}
                    error={errors[field.name]}
                    onChange={(val) => handleChange(field.name, val)}
                  />
                ))}
              </div>
            </div>
          </TooltipProvider>

          {/* Submit Action Bar */}
          <div className="card-elevated p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              <strong className="text-foreground">Clinical Validation Notice:</strong> Inputs are evaluated against physiological ranges matching the UCI Cleveland Benchmark (SF-2 Subset).
            </div>
            <Button
              type="submit"
              size="lg"
              className="btn-cta-glow h-13 w-full sm:w-auto rounded-2xl px-8 font-bold text-sm gap-2 shadow-glow"
            >
              <Sparkles className="h-4 w-4" /> Calculate Risk & SHAP Drivers <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <EcgWave className="max-w-4xl mx-auto" />
      </div>
    </main>
  );
}

// Subcomponent for responsive, accessible input cards with tooltips
function InputField({
  field,
  value,
  error,
  onChange,
}: {
  field: any;
  value: string;
  error?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-3.5 transition-all duration-200 bg-card/60 backdrop-blur-sm ${
        error
          ? "border-destructive/80 bg-destructive/5"
          : "border-border/80 hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <Label
          htmlFor={field.name}
          className="text-xs font-bold text-foreground flex items-center gap-1 cursor-pointer"
        >
          {field.label}
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
                <Info className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs p-2.5 rounded-xl">
              <p className="font-bold text-primary mb-1">{field.label} ({field.name})</p>
              <p>{field.tooltip || field.description || "Clinical biomarker reference value."}</p>
              {field.unit && <p className="mt-1 text-[10px] text-muted-foreground">Unit: {field.unit}</p>}
            </TooltipContent>
          </Tooltip>
        </Label>
        {field.unit && (
          <span className="text-[10px] font-mono font-semibold text-muted-foreground">
            {field.unit}
          </span>
        )}
      </div>

      {field.type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            id={field.name}
            className="h-10 rounded-xl bg-background/80 border-border text-xs font-semibold focus:ring-0"
          >
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {field.options?.map((opt: any) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `e.g. ${field.min ?? ""}`}
          className="h-10 rounded-xl bg-background/80 border-border text-xs font-semibold font-mono focus-visible:ring-0"
        />
      )}

      {error && (
        <p className="mt-1 text-[10px] font-bold text-destructive animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
}
