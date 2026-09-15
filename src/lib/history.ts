export interface HistoryRecord {
  id: string;
  timestamp: string;
  dateStr: string;
  riskScore: number;
  riskLevel: string;
  probability: number;
  primaryModel: string;
  patientData: Record<string, string>;
  topDrivers?: string[];
}

const STORAGE_KEY = "aihealthguard_assessment_history";

export function getAssessmentHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryRecord[];
  } catch (err) {
    console.error("Failed to read assessment history from localStorage:", err);
    return [];
  }
}

export function saveAssessmentRecord(record: Omit<HistoryRecord, "id" | "timestamp" | "dateStr">): HistoryRecord {
  try {
    const history = getAssessmentHistory();
    const newRecord: HistoryRecord = {
      ...record,
      id: `AHG-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      dateStr: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Keep up to 20 recent records
    const updated = [newRecord, ...history.filter((h) => h.id !== newRecord.id)].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRecord;
  } catch (err) {
    console.error("Failed to save assessment record:", err);
    return {
      ...record,
      id: `AHG-LOCAL`,
      timestamp: new Date().toISOString(),
      dateStr: "Today",
    };
  }
}

export function clearAssessmentHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear assessment history:", err);
  }
}
