/**
 * AI-HealthGuard API Client Abstraction
 * Handles communication with the FastAPI backend, supporting both unified
 * and decoupled deployments via VITE_API_URL.
 */

export interface PatientInput {
  age: number | string;
  sex: number | string;
  cp: number | string;
  trestbps: number | string;
  chol: number | string;
  fbs: number | string;
  restecg: number | string;
  thalach: number | string;
  exang: number | string;
  oldpeak: number | string;
  slope: number | string;
  ca: number | string;
  thal: number | string;
}

export interface ModelMetric {
  model: string;
  Accuracy: number;
  Precision: number;
  Recall: number;
  F1_Score: number;
  ROC_AUC: number;
}

export interface ModelPrediction {
  probability: number | null;
  risk_score: number | null;
  risk_level: string | null;
  prediction: number | null;
  accuracy?: number;
  error?: string;
}

export interface ShapResult {
  available: boolean;
  shap_values: number[];
  base_value: number;
  features: Record<string, number>;
  warning?: string;
  error?: string;
}

export interface Recommendations {
  lifestyle: string[];
  diet: string[];
  activity: string[];
  medical: string[];
}

export interface PredictionResponse {
  model_results: Record<string, ModelPrediction>;
  primary_model: string;
  risk_score: number;
  risk_level: "LOW RISK" | "MODERATE RISK" | "HIGH RISK" | string;
  prediction: number;
  probability: number;
  shap: ShapResult;
  recommendations: Recommendations;
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  primary_model: string;
  primary_model_ready: boolean;
  artifacts: Record<string, boolean>;
}

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }
  return "";
};

/**
 * Executes Ischemic Heart Disease risk inference against the XGBoost primary model.
 * Does NOT fabricate mock data if the API fails.
 */
export async function predictRisk(patientData: Record<string, string | number>): Promise<PredictionResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/predict`;

  const numericData: Record<string, number> = {};
  for (const [key, value] of Object.entries(patientData)) {
    const parsed = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(parsed)) {
      throw new Error(`Invalid numerical value for parameter: ${key}`);
    }
    numericData[key] = parsed;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(numericData),
  });

  if (!response.ok) {
    let errorDetail = "API prediction request failed";
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === "string" 
          ? errJson.detail 
          : JSON.stringify(errJson.detail);
      }
    } catch {
      errorDetail = `Server responded with status ${response.status} (${response.statusText})`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Fetches cross-validated benchmark and evaluation metrics for all 5 architectures.
 */
export async function getModelMetrics(): Promise<ModelMetric[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/metrics`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to retrieve model metrics: status ${response.status}`);
  }

  return response.json();
}

/**
 * Checks backend and model-artifact health status.
 */
export async function getHealthStatus(): Promise<HealthResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/health`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response.json();
}
