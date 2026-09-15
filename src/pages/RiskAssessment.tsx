import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { useNavigate } from "react-router-dom";
import { Heart, Info, Sparkles, RotateCcw, ArrowRight, ShieldAlert, CheckCircle2, Stethoscope, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { featureFields, samplePresets } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function RiskAssessment() {
  const [formData, setFormData] = useState<Record<string, string>>({
    age: "52", sex: "1", cp: "3", trestbps: "140", chol: "268",
    fbs: "0", restecg: "1", thalach: "134", exang: "1",
    oldpeak: "2.4", slope: "1", ca: "2", thal: "3",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sampleLoadedMsg, setSampleLoadedMsg] = useState<string>("A 52-year-old male test case has been filled in.");
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
    const preset = samplePresets.find(p => p.id === presetId);
    if (!preset) return;
    setFormData(preset.data);
    setErrors({});
    setSampleLoadedMsg(`Loaded: ${preset.label}`);
    toast({
      title: "Sample Data Loaded",
      description: preset.label,
    });
  };

  const clearForm = () => {
    setFormData({});
    setErrors({});
    setSampleLoadedMsg("");
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

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8" id="main-content">
      <div className="mx-auto max-w-4xl">
        {/* Header matching Fig. 3 */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm"
          >
            <Heart className="h-7 w-7 text-primary fill-primary/10" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            IHD Risk Assessment
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your clinical parameters below. Hover over <Info className="inline h-3.5 w-3.5 text-primary" /> icons for reference ranges.
          </p>
        </div>

        {/* Preset & Action Bar (Fig. 3) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mr-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Load Sample Data:
            </span>
            {samplePresets.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleLoadPreset(preset.id)}
                className="h-8 rounded-lg text-xs font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                {preset.id === "high_risk" ? "High Risk (52y M)" : preset.id === "healthy" ? "Healthy (38y F)" : "Moderate Risk (58y M)"}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearForm}
            className="h-8 rounded-lg text-xs text-muted-foreground hover:text-destructive gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>

        {/* Form Container (Fig. 3) */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={field.name} className="text-xs font-semibold text-foreground">
                      {field.label}
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
                            <Info className="h-3.5 w-3.5 cursor-help" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[260px] rounded-xl p-3 text-xs shadow-md">
                          <p className="leading-relaxed">{field.tooltip}</p>
                          {field.type === "number" && (
                            <p className="mt-1.5 font-bold text-primary text-[10px]">
                              Range: {field.min}–{field.max} {field.unit}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {field.unit && (
                    <span className="text-[11px] font-medium text-muted-foreground">{field.unit}</span>
                  )}
                </div>

                {field.type === "number" ? (
                  <div className="relative">
                    <Input
                      id={field.name}
                      type="number"
                      step={field.step || 1}
                      placeholder={`${field.min || 0} ${field.unit || ""}`}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`h-11 rounded-xl border bg-background px-3.5 text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 ${
                        errors[field.name] ? "border-destructive focus:border-destructive" : "border-input hover:border-primary/40 focus:border-primary"
                      }`}
                    />
                  </div>
                ) : (
                  <Select
                    value={formData[field.name] || ""}
                    onValueChange={(v) => handleChange(field.name, v)}
                  >
                    <SelectTrigger
                      id={field.name}
                      className={`h-11 rounded-xl border bg-background px-3.5 text-sm font-medium transition-all ${
                        errors[field.name] ? "border-destructive" : "border-input hover:border-primary/40 focus:border-primary"
                      }`}
                    >
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border shadow-lg">
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium py-2">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {errors[field.name] && (
                  <p className="text-[11px] font-semibold text-destructive">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button & Notification Banner (Fig. 3) */}
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              {sampleLoadedMsg ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {sampleLoadedMsg}
                </span>
              ) : (
                <span>All 13 parameters required for SF-2 model computation.</span>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-all hover:scale-[1.02] gap-2"
            >
              <Heart className="h-4 w-4 fill-primary-foreground" /> Predict IHD Risk
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          AI-HealthGuard inference executes via 5 machine learning models in under 3 seconds. For clinical screening and research support only.
        </p>
      </div>
    </main>
  );
}
