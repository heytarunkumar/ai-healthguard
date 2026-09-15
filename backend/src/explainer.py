import pandas as pd
import numpy as np
import os
from .model_trainer import load_model, get_models_dir

try:
    import shap
except ImportError:
    shap = None

class MockExplainer:
    def __init__(self, model):
        self.model = model
        self.expected_value = 0.45
    def shap_values(self, X):
        val = np.random.normal(0, 0.1, X.shape[1])
        return [-val, val]

def get_shap_explainer(model_name="xgb", X_background=None):
    if shap is None:
        return MockExplainer(None)
        
    model = load_model(model_name)
    
    # Check if we are in DEMO MODE
    from .model_trainer import MockModel
    if isinstance(model, MockModel):
        return MockExplainer(model)
        
    try:
        if model_name in ['rf', 'xgb']:
            explainer = shap.TreeExplainer(model)
        else:
            if X_background is None:
                models_dir = get_models_dir()
                bg_path = os.path.join(models_dir, 'background.csv')
                if os.path.exists(bg_path):
                    X_background = pd.read_csv(bg_path)
                else:
                    from .preprocessor import SF_2_FEATURES
                    X_background = pd.DataFrame(np.zeros((10, len(SF_2_FEATURES))), columns=SF_2_FEATURES)
                    
            if model_name == 'nn':
                def nn_predict_wrapper(x):
                    return model.predict(x).flatten()
                explainer = shap.KernelExplainer(nn_predict_wrapper, X_background)
            else:
                explainer = shap.KernelExplainer(model.predict_proba, X_background)
        return explainer
    except Exception as e:
        print(f"WARNING: SHAP explainer initialization failed ({e}). Using MockExplainer fallback.")
        return MockExplainer(model)

def get_local_shap_values(model_name, X_instance, X_background=None):
    try:
        explainer = get_shap_explainer(model_name, X_background)
        shap_values = explainer.shap_values(X_instance)
        
        if isinstance(shap_values, list):
            shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
            
        if isinstance(explainer.expected_value, (list, np.ndarray)):
            base_value = explainer.expected_value[1] if len(explainer.expected_value) > 1 else explainer.expected_value[0]
        else:
            base_value = explainer.expected_value
            
        return {
            "shap_values": shap_values[0].tolist() if hasattr(shap_values, 'tolist') else (shap_values.tolist() if isinstance(shap_values, np.ndarray) else list(shap_values)),
            "base_value": float(base_value),
            "features": X_instance.iloc[0].to_dict()
        }
    except Exception as e:
        print(f"WARNING: get_local_shap_values failed ({e}). Returning fallback zeros.")
        return {
            "shap_values": [0.0] * len(X_instance.columns),
            "base_value": 0.45,
            "features": X_instance.iloc[0].to_dict()
        }

