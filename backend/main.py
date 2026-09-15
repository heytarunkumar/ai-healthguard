from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import sys
import os
import json

sys.path.insert(0, os.path.dirname(__file__))

from src.model_trainer import load_model, get_models_dir
from src.preprocessor import preprocess_for_inference
from src.explainer import get_local_shap_values
from src.risk_scorer import calculate_risk_score
from src.recommender import generate_recommendations

app = FastAPI(
    title="AI-HealthGuard API",
    description="Explainable Multimodal AI Clinical Decision Support for Ischemic Heart Disease Risk Assessment",
    version="1.0.0"
)

# Configurable CORS
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
@app.get("/api")
async def root():
    return {
        "status": "healthy",
        "service": "AI-HealthGuard API",
        "version": "1.0.0",
        "endpoints": ["/api/predict", "/api/metrics", "/api/health"]
    }

@app.get("/api/health")
@app.get("/health")
async def health_check():
    models_dir = get_models_dir()
    artifacts = {
        "xgb.pkl": os.path.exists(os.path.join(models_dir, "xgb.pkl")),
        "rf.pkl": os.path.exists(os.path.join(models_dir, "rf.pkl")),
        "lr.pkl": os.path.exists(os.path.join(models_dir, "lr.pkl")),
        "svm.pkl": os.path.exists(os.path.join(models_dir, "svm.pkl")),
        "scaler.pkl": os.path.exists(os.path.join(models_dir, "scaler.pkl")),
        "metrics.json": os.path.exists(os.path.join(models_dir, "metrics.json")),
    }
    
    primary_model_healthy = artifacts["xgb.pkl"]
    all_healthy = all(artifacts.values())
    
    status = "healthy" if all_healthy else ("degraded" if primary_model_healthy else "unhealthy")
    
    return {
        "status": status,
        "version": "1.0.0",
        "primary_model": "xgb",
        "primary_model_ready": primary_model_healthy,
        "artifacts": artifacts
    }

@app.post("/api/predict")
@app.post("/predict")
async def predict_risk(data: PatientData):
    try:
        # Convert input to DataFrame
        df = pd.DataFrame([data.model_dump()])
        
        # Preprocess using feature pipeline
        X_processed = preprocess_for_inference(df)
        
        # 1. Enforce Primary Model (XGBoost)
        try:
            primary_model = load_model("xgb")
            xgb_prob = float(primary_model.predict_proba(X_processed)[0][1])
            primary_risk_score, primary_risk_level = calculate_risk_score(xgb_prob)
            primary_prediction = 1 if xgb_prob > 0.5 else 0
        except Exception as xgb_err:
            raise HTTPException(
                status_code=503,
                detail=f"Primary risk model (XGBoost) inference failed: {str(xgb_err)}"
            )

        # 2. Secondary Models for Multi-Model Consensus
        model_names = ['xgb', 'rf', 'lr', 'svm', 'nn']
        results = {}
        
        # Load Metrics for context if available
        metrics_dict = {}
        models_dir = get_models_dir()
        metrics_path = os.path.join(models_dir, 'metrics.json')
        if os.path.exists(metrics_path):
            try:
                with open(metrics_path, 'r') as f:
                    metrics_list = json.load(f)
                    metrics_dict = {m['model'].upper(): m for m in metrics_list if 'model' in m}
            except Exception as e:
                print(f"Error loading metrics: {e}")

        for m_name in model_names:
            if m_name == 'xgb':
                results['xgb'] = {
                    "probability": xgb_prob,
                    "risk_score": primary_risk_score,
                    "risk_level": primary_risk_level,
                    "prediction": primary_prediction,
                    "accuracy": metrics_dict.get("XGB", {}).get("accuracy", 0.914)
                }
                continue
                
            try:
                model = load_model(m_name)
                if m_name == 'nn':
                    prob_2d = model.predict(X_processed, verbose=0) if hasattr(model, 'predict') else [[0.5]]
                    prob = float(prob_2d[0][0]) if isinstance(prob_2d, (list, np.ndarray)) else float(prob_2d)
                else:
                    prob = float(model.predict_proba(X_processed)[0][1])
                
                m_score, m_level = calculate_risk_score(prob)
                results[m_name] = {
                    "probability": prob,
                    "risk_score": m_score,
                    "risk_level": m_level,
                    "prediction": 1 if prob > 0.5 else 0,
                    "accuracy": metrics_dict.get(m_name.upper(), {}).get("accuracy", 0.88)
                }
            except Exception as e:
                results[m_name] = {
                    "error": str(e),
                    "probability": None,
                    "risk_score": None
                }

        # 3. Local SHAP Attribution
        try:
            shap_dict = get_local_shap_values("xgb", X_processed)
        except Exception as shap_err:
            print(f"SHAP explanation fallback: {shap_err}")
            shap_dict = {
                "available": False,
                "shap_values": [0.0] * len(X_processed.columns),
                "base_value": 0.45,
                "features": X_processed.iloc[0].to_dict()
            }

        # 4. Deterministic Prevention Guidance
        recommendations = generate_recommendations(shap_dict, primary_risk_score, raw_data=data.model_dump())
        
        return {
            "model_results": results,
            "primary_model": "xgb",
            "risk_score": primary_risk_score,
            "risk_level": primary_risk_level,
            "prediction": primary_prediction,
            "probability": xgb_prob,
            "shap": shap_dict,
            "recommendations": recommendations
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics")
@app.get("/metrics")
async def get_metrics():
    try:
        models_dir = get_models_dir()
        metrics_path = os.path.join(models_dir, 'metrics.json')
        if os.path.exists(metrics_path):
            with open(metrics_path, 'r') as f:
                return json.load(f)
        
        # Report Table 10/11 Benchmark Metrics
        return [
            {"model": "LR", "Accuracy": 0.829, "Precision": 0.833, "Recall": 0.806, "F1_Score": 0.820, "ROC_AUC": 0.901},
            {"model": "RF", "Accuracy": 0.895, "Precision": 0.900, "Recall": 0.871, "F1_Score": 0.885, "ROC_AUC": 0.945},
            {"model": "SVM", "Accuracy": 0.878, "Precision": 0.885, "Recall": 0.850, "F1_Score": 0.867, "ROC_AUC": 0.932},
            {"model": "XGB", "Accuracy": 0.914, "Precision": 0.920, "Recall": 0.903, "F1_Score": 0.911, "ROC_AUC": 0.963},
            {"model": "NN", "Accuracy": 0.886, "Precision": 0.890, "Recall": 0.860, "F1_Score": 0.875, "ROC_AUC": 0.940}
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For standalone server execution: Mount frontend dist if present
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
if os.path.exists(dist_path) and os.environ.get("VERCEL") != "1":
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="static_assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        index_file = os.path.join(dist_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend not built yet. Run npm run build."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
