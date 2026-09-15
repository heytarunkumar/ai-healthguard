import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Sparkles,
  ArrowRight,
  Trash2,
  FileText,
  Activity,
} from "lucide-react";
import { getAssessmentHistory, clearAssessmentHistory, HistoryRecord } from "@/lib/history";
import { useToast } from "@/hooks/use-toast";

interface AssessmentHistoryModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AssessmentHistoryModal({ trigger, open, onOpenChange }: AssessmentHistoryModalProps) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isControlled = open !== undefined;
  const showModal = isControlled ? open : internalOpen;
  const setShowModal = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  const loadHistory = () => {
    setRecords(getAssessmentHistory());
  };

  useEffect(() => {
    if (showModal) {
      loadHistory();
    }
  }, [showModal]);

  const handleClear = () => {
    clearAssessmentHistory();
    setRecords([]);
    toast({
      title: "History Cleared",
      description: "Local assessment timeline has been reset.",
    });
  };

  const handleRevisit = (record: HistoryRecord) => {
    setShowModal(false);
    navigate("/results", { state: { patientData: record.patientData } });
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-2 text-left border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <History className="h-4 w-4" />
              <span>Assessment History Timeline</span>
            </div>
            {records.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear History
              </Button>
            )}
          </div>
          <DialogTitle className="font-heading text-xl font-extrabold text-foreground">
            Cardiovascular Assessment Tracking
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Track historical assessment runs saved locally on this device. Presented for longitudinal comparison, not as clinical diagnostic records.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {records.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                <Activity className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">No assessment records found</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Completed risk assessments will appear here automatically with risk progression indicators.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((rec, index) => {
                const prevRecord = records[index + 1];
                const scoreDiff = prevRecord ? rec.riskScore - prevRecord.riskScore : null;

                const isLow = rec.riskScore <= 39;
                const isMod = rec.riskScore > 39 && rec.riskScore <= 69;

                return (
                  <div
                    key={rec.id}
                    className="group relative rounded-2xl border border-border/80 bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card/90"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {rec.dateStr}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            ({rec.id})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <Badge
                            variant="outline"
                            className={`text-xs font-bold ${
                              isLow
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : isMod
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                            }`}
                          >
                            Risk Score: {rec.riskScore}/100 • {rec.riskLevel}
                          </Badge>
                          {scoreDiff !== null && (
                            <span
                              className={`flex items-center gap-0.5 text-[11px] font-bold ${
                                scoreDiff > 0
                                  ? "text-red-500"
                                  : scoreDiff < 0
                                  ? "text-emerald-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {scoreDiff > 0 ? (
                                <>
                                  <TrendingUp className="h-3 w-3" /> +{scoreDiff} pts
                                </>
                              ) : scoreDiff < 0 ? (
                                <>
                                  <TrendingDown className="h-3 w-3" /> {scoreDiff} pts
                                </>
                              ) : (
                                <>
                                  <Minus className="h-3 w-3" /> No change
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevisit(rec)}
                          className="h-8 rounded-xl text-xs font-bold gap-1.5 border-border hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <span>View Analysis</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {rec.topDrivers && rec.topDrivers.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground/80">Key drivers:</span>
                        {rec.topDrivers.map((driver, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-muted/60 px-2 py-0.5 font-medium text-foreground text-[10px]"
                          >
                            {driver}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
