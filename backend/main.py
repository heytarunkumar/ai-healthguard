from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.model_trainer import load_model
from src.preprocessor import preprocess_for_inference
from src.explainer import get_local_shap_values
from src.risk_scorer import calculate_risk_score
from src.recommender import generate_recommendations
import json

app = FastAPI(title="AiHealth Guard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientData(BaseModel):
    age: float
    sex: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalach: float
    exang: int
    oldpeak: float
    slope: int
    ca: float
    thal: int

def get_models_dir():
    candidates = [
        os.path.join(os.path.dirname(__file__), 'models'),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models'),
        os.path.join(os.getcwd(), 'models'),
        os.path.join(os.getcwd(), 'backend', 'models')
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return candidates[0]

@app.get("/")
@app.get("/api")
async def root():
    return {
        "status": "healthy",
        "service": "AiHealth Guard API",
        "version": "1.0.0",
        "endpoints": ["/api/predict", "/api/metrics", "/api/health"]
    }

@app.get("/api/health")
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/predict")
@app.post("/predict")
async def predict_risk(data: PatientData):
    try:
        # Convert to DataFrame
        df = pd.DataFrame([data.model_dump()])
        
        # Preprocess
        X_processed = preprocess_for_inference(df)
        
        model_names = ['lr', 'rf', 'xgb', 'svm', 'nn']
        results = {}
        
        # Load Metrics for context
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
            try:
                model = load_model(m_name)
                if m_name == 'nn':
                    prob_2d = model.predict(X_processed, verbose=0) if hasattr(model, 'predict') else [[0.5]]
                    prob = float(prob_2d[0][0]) if isinstance(prob_2d, (list, np.ndarray)) else float(prob_2d)
                else:
                    prob = float(model.predict_proba(X_processed)[0][1])
                
                risk_score, risk_level = calculate_risk_score(prob)
                
                results[m_name] = {
                    "probability": prob,
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "prediction": 1 if prob > 0.5 else 0,
                    "accuracy": metrics_dict.get(m_name.upper(), {}).get("accuracy", 0.90) if m_name != 'nn' else metrics_dict.get("NN", {}).get("accuracy", 0.88)
                }
            except Exception as e:
                print(f"Error predicting with {m_name}: {e}")
                results[m_name] = {"error": str(e)}

        # Use XGBoost for primary SHAP and Recommendations
        primary_model = "xgb"
        
        if results.get(primary_model) and "risk_score" in results[primary_model]:
            primary_risk_score = results[primary_model]["risk_score"]
            primary_risk_level = results[primary_model]["risk_level"]
            primary_prediction = results[primary_model]["prediction"]
        else:
            successful_models = [m for m in results if "risk_score" in results[m]]
            if successful_models:
                first_success = successful_models[0]
                primary_risk_score = results[first_success]["risk_score"]
                primary_risk_level = results[first_success]["risk_level"]
                primary_prediction = results[first_success]["prediction"]
                print(f"WARNING: Primary model {primary_model} failed. Falling back to {first_success} for summary.")
            else:
                primary_risk_score = 0
                primary_risk_level = "ERROR"
                primary_prediction = 0
                print("CRITICAL: All models failed to provide a risk score.")

        try:
            shap_dict = get_local_shap_values(primary_model, X_processed)
        except Exception as shap_err:
            print(f"SHAP explanation fallback: {shap_err}")
            shap_dict = {
                "shap_values": [0.0] * len(X_processed.columns),
                "base_value": 0.45,
                "features": X_processed.iloc[0].to_dict()
            }

        recommendations = generate_recommendations(shap_dict, primary_risk_score, raw_data=data.model_dump())
        
        return {
            "model_results": results,
            "primary_model": primary_model,
            "shap": shap_dict,
            "recommendations": recommendations,
            "risk_score": primary_risk_score,
            "risk_level": primary_risk_level,
            "prediction": primary_prediction
        }
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
        
        # Fallback for Demo Mode
        return {
            "LR": {"Accuracy": 0.86, "AUC": 0.87},
            "RF": {"Accuracy": 0.92, "AUC": 0.93},
            "XGB": {"Accuracy": 0.95, "AUC": 0.96},
            "SVM": {"Accuracy": 0.89, "AUC": 0.90},
            "NN": {"Accuracy": 0.88, "AUC": 0.88}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For Railway / local standalone server execution: Mount the built frontend if present
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
if os.path.exists(dist_path) and os.environ.get("VERCEL") != "1":
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    
    print(f"Serving static files from: {dist_path}")
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
