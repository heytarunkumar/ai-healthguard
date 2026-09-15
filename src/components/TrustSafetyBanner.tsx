import { ShieldAlert, Info, AlertTriangle, Stethoscope } from "lucide-react";

export function TrustSafetyBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-primary/20 bg-card/60 p-4 sm:p-5 backdrop-blur-md shadow-sm space-y-3 ${className}`}
      role="region"
      aria-label="Clinical safety and trust disclosure"
    >
      <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-primary">
        <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
        <span>Clinical Trust & Safety Framework</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 text-xs text-muted-foreground leading-relaxed">
        <div className="flex items-start gap-2 rounded-xl bg-background/50 p-2.5 border border-border/50">
          <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground font-semibold">Risk Estimation Only:</strong> This AI system estimates statistical risk for Ischemic Heart Disease and does not provide clinical medical diagnosis.
          </span>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-background/50 p-2.5 border border-border/50">
          <Stethoscope className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground font-semibold">Specialist Review:</strong> All prediction outputs and SHAP attributions should be discussed with a certified cardiologist or licensed physician.
          </span>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-background/50 p-2.5 border border-border/50">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground font-semibold">Emergency Notice:</strong> If you or someone around you experiences acute chest pressure or shortness of breath, seek emergency medical services immediately.
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground/80 border-t border-border/40">
        <span>🔒 Zero Data Retention: Assessments process client-side / ephemeral inference without saving PII on remote servers.</span>
        <span>💊 Non-Prescriptive Policy: Recommendations provide lifestyle and clinical guidance without prescribing medications.</span>
      </div>
    </div>
  );
}
