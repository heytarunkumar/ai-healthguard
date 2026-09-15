export const featureFields = [
  { name: "age", label: "Age", type: "number" as const, min: 20, max: 100, unit: "years", tooltip: "Patient age in years (Range: 29–77). Risk increases after age 45 (men) / 55 (women)." },
  { name: "sex", label: "Sex", type: "select" as const, options: [{ value: "1", label: "Male" }, { value: "0", label: "Female" }], tooltip: "Patient biological sex (0=Female, 1=Male)." },
  { name: "cp", label: "Chest Pain Type", type: "select" as const, options: [
    { value: "0", label: "0 - Typical Angina" },
    { value: "1", label: "1 - Atypical Angina" },
    { value: "2", label: "2 - Non-Anginal Pain" },
    { value: "3", label: "3 - Asymptomatic" }
  ], tooltip: "Chest pain classification. Asymptomatic (3) is strongly correlated with silent ischemia." },
  { name: "trestbps", label: "Resting Blood Pressure", type: "number" as const, min: 80, max: 220, unit: "mmHg", tooltip: "Resting blood pressure at admission in mmHg (Range: 94–200). Normal < 120." },
  { name: "chol", label: "Serum Cholesterol", type: "number" as const, min: 100, max: 600, unit: "mg/dL", tooltip: "Serum cholesterol level in mg/dL (Range: 126–564). Normal < 200 mg/dL." },
  { name: "fbs", label: "Fasting Blood Sugar > 120", type: "select" as const, options: [{ value: "1", label: "True (> 120 mg/dL)" }, { value: "0", label: "False (≤ 120 mg/dL)" }], tooltip: "Fasting blood sugar > 120 mg/dL indicates metabolic risk / diabetes proxy." },
  { name: "restecg", label: "Resting ECG Results", type: "select" as const, options: [
    { value: "0", label: "0 - Normal" },
    { value: "1", label: "1 - ST-T Wave Abnormality" },
    { value: "2", label: "2 - Left Ventricular Hypertrophy" }
  ], tooltip: "Resting electrocardiographic results. 1 = ST-T wave inversion/depression, 2 = LV hypertrophy." },
  { name: "thalach", label: "Max Heart Rate Achieved", type: "number" as const, min: 60, max: 230, unit: "bpm", tooltip: "Maximum heart rate achieved during exercise stress testing in bpm (Range: 71–202)." },
  { name: "exang", label: "Exercise-Induced Angina", type: "select" as const, options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }], tooltip: "Angina induced by physical exertion (0=No, 1=Yes)." },
  { name: "oldpeak", label: "ST Depression (Oldpeak)", type: "number" as const, min: 0, max: 7, step: 0.1, unit: "", tooltip: "ST depression induced by exercise relative to rest (Range: 0.0–6.2). Higher indicates ischemic load." },
  { name: "slope", label: "Slope of Peak ST Segment", type: "select" as const, options: [
    { value: "0", label: "0 - Upsloping" },
    { value: "1", label: "1 - Flat" },
    { value: "2", label: "2 - Downsloping" }
  ], tooltip: "Slope of the peak exercise ST segment. Downsloping (2) & Flat (1) correlate with IHD." },
  { name: "ca", label: "Major Vessels Colored", type: "select" as const, options: [
    { value: "0", label: "0 Vessels" },
    { value: "1", label: "1 Vessel" },
    { value: "2", label: "2 Vessels" },
    { value: "3", label: "3 Vessels" }
  ], tooltip: "Number of major vessels (0–3) colored by fluoroscopy. Higher number indicates vessel blockage." },
  { name: "thal", label: "Thalassemia Type", type: "select" as const, options: [
    { value: "1", label: "1 - Normal" },
    { value: "2", label: "2 - Fixed Defect" },
    { value: "3", label: "3 - Reversible Defect" }
  ], tooltip: "Thallium stress test results. 3 = Reversible defect (indicates severe ischemic vulnerability)." },
];

export const samplePatient: Record<string, string> = {
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
};

export const samplePresets = [
  {
    id: "high_risk",
    label: "52-Year-Old Male High-Risk Case (Report Benchmark)",
    data: {
      age: "52", sex: "1", cp: "3", trestbps: "140", chol: "268",
      fbs: "0", restecg: "1", thalach: "134", exang: "1",
      oldpeak: "2.4", slope: "1", ca: "2", thal: "3",
    }
  },
  {
    id: "healthy",
    label: "38-Year-Old Female Normal/Healthy Profile",
    data: {
      age: "38", sex: "0", cp: "0", trestbps: "115", chol: "185",
      fbs: "0", restecg: "0", thalach: "172", exang: "0",
      oldpeak: "0.2", slope: "0", ca: "0", thal: "1",
    }
  },
  {
    id: "moderate_risk",
    label: "58-Year-Old Male Moderate-Risk Profile",
    data: {
      age: "58", sex: "1", cp: "1", trestbps: "132", chol: "228",
      fbs: "1", restecg: "0", thalach: "148", exang: "0",
      oldpeak: "1.2", slope: "1", ca: "1", thal: "2",
    }
  }
];

export const mockShapValues = [
  { feature: "ca", label: "Major Vessels (ca)", value: 2, shap: 0.48, direction: "risk" as const },
  { feature: "cp", label: "Chest Pain Type (cp)", value: 3, shap: 0.41, direction: "risk" as const },
  { feature: "thal", label: "Thalassemia (thal)", value: 3, shap: 0.37, direction: "risk" as const },
  { feature: "oldpeak", label: "ST Depression (oldpeak)", value: 2.4, shap: 0.31, direction: "risk" as const },
  { feature: "chol", label: "Serum Cholesterol (chol)", value: 268, shap: 0.22, direction: "risk" as const },
  { feature: "trestbps", label: "Resting BP (trestbps)", value: 140, shap: 0.16, direction: "risk" as const },
  { feature: "exang", label: "Exercise Angina (exang)", value: 1, shap: 0.14, direction: "risk" as const },
  { feature: "age", label: "Patient Age (age)", value: 52, shap: 0.08, direction: "risk" as const },
  { feature: "thalach", label: "Max Heart Rate (thalach)", value: 134, shap: -0.28, direction: "protective" as const },
  { feature: "slope", label: "ST Slope (slope)", value: 1, shap: -0.05, direction: "protective" as const },
];

export const modelComparison = [
  {
    model: "XGBoost (Primary ★)",
    type: "Ensemble (Gradient Boosting)",
    accuracy: 91.4,
    auc: 0.94,
    f1: 0.91,
    precision: 0.92,
    recall: 0.91,
    cv5: "90.2% ± 3.2%",
    cv10: "89.8% ± 4.1%",
    status: "Primary (Star Model)",
    targetMet: true
  },
  {
    model: "Random Forest",
    type: "Ensemble (Bagging)",
    accuracy: 89.5,
    auc: 0.92,
    f1: 0.89,
    precision: 0.90,
    recall: 0.89,
    cv5: "88.3% ± 3.6%",
    cv10: "87.9% ± 4.7%",
    status: "Ensemble Validator",
    targetMet: true
  },
  {
    model: "Neural Network",
    type: "Deep Learning (MLP)",
    accuracy: 88.6,
    auc: 0.91,
    f1: 0.88,
    precision: 0.89,
    recall: 0.88,
    cv5: "87.1% ± 5.3%",
    cv10: "86.8% ± 6.4%",
    status: "Deep Benchmark",
    targetMet: true
  },
  {
    model: "SVM (RBF Kernel)",
    type: "Kernel-Based",
    accuracy: 87.8,
    auc: 0.89,
    f1: 0.87,
    precision: 0.88,
    recall: 0.87,
    cv5: "86.7% ± 4.2%",
    cv10: "86.4% ± 5.1%",
    status: "Non-Linear Baseline",
    targetMet: true
  },
  {
    model: "Logistic Regression",
    type: "Linear Baseline",
    accuracy: 82.9,
    auc: 0.84,
    f1: 0.83,
    precision: 0.82,
    recall: 0.84,
    cv5: "81.2% ± 4.1%",
    cv10: "81.8% ± 5.3%",
    status: "Linear Bound",
    targetMet: true
  },
];

export const recommendations = {
  lifestyle: [
    "Maintain a balanced sleep schedule (7–8 hours) and manage daily stress levels.",
    "Perform daily home blood pressure monitoring (target < 120/80 mmHg).",
    "Eliminate active and passive tobacco exposure completely.",
    "Limit alcohol consumption and practice relaxation techniques (meditation/yoga).",
  ],
  diet: [
    "Adopt a low-sodium DASH (Dietary Approaches to Stop Hypertension) diet.",
    "Reduce intake of saturated fats and trans fats to lower circulating LDL cholesterol.",
    "Increase dietary soluble fiber from oats, legumes, and fresh vegetables.",
    "Incorporate omega-3 fatty acid rich foods (fish, walnuts, flaxseeds) 2–3 times weekly.",
  ],
  activity: [
    "Aim for at least 150 minutes of moderate-intensity aerobic physical activity per week.",
    "Incorporate mild cardiovascular exercises gradually based on maximum heart rate limits.",
    "Avoid prolonged sedentary periods — stand and walk for 5 minutes every hour.",
    "Engage in light resistance training 2 days per week after clinical clearance.",
  ],
  medical: [
    "Your clinical ECG/angiogram indicators (ST depression/vessels) strongly suggest Ischemic risks. Seek specialist review.",
    "Discuss lipid-lowering therapy (statin evaluation) with your physician if LDL remains elevated.",
    "Schedule a comprehensive 12-lead ECG and echocardiography consultation.",
    "URGENT: If IHD Risk Score is High (≥ 70), consult a cardiologist promptly for formal diagnostic angiography.",
  ],
};
