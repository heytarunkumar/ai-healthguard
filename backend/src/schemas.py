from pydantic import BaseModel, Field

# 13 Clinical biomarkers as defined in Table 4 of the AI-HealthGuard project report
SF_2_FEATURES = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
    'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

class PatientData(BaseModel):
    age: float = Field(..., ge=18.0, le=120.0, description="Age in years (18-120)")
    sex: int = Field(..., ge=0, le=1, description="Sex (0: Female, 1: Male)")
    cp: int = Field(..., ge=0, le=3, description="Chest pain type (0: Typical Angina, 1: Atypical Angina, 2: Non-Anginal Pain, 3: Asymptomatic)")
    trestbps: float = Field(..., ge=50.0, le=250.0, description="Resting blood pressure in mm Hg (50-250)")
    chol: float = Field(..., ge=50.0, le=600.0, description="Serum cholesterol in mg/dl (50-600)")
    fbs: int = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 mg/dl (0: False, 1: True)")
    restecg: int = Field(..., ge=0, le=2, description="Resting ECG results (0: Normal, 1: ST-T wave abnormality, 2: LVH)")
    thalach: float = Field(..., ge=40.0, le=250.0, description="Maximum heart rate achieved in bpm (40-250)")
    exang: int = Field(..., ge=0, le=1, description="Exercise-induced angina (0: No, 1: Yes)")
    oldpeak: float = Field(..., ge=0.0, le=10.0, description="ST depression induced by exercise relative to rest (0.0-10.0)")
    slope: int = Field(..., ge=0, le=2, description="Slope of peak exercise ST segment (0: Upsloping, 1: Flat, 2: Downsloping)")
    ca: float = Field(..., ge=0.0, le=4.0, description="Number of major vessels (0-4) colored by fluoroscopy")
    thal: int = Field(..., ge=0, le=3, description="Thalassemia (0: Normal/null, 1: Fixed defect, 2: Normal, 3: Reversible defect)")
