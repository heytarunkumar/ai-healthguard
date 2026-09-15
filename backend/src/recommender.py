def generate_recommendations(shap_dict, risk_score, raw_data=None):
    """
    Generates personalized recommendations based on SHAP feature importances
    and the overall risk score.
    shap_dict format: {"shap_values": [list], "features": {dict}}
    raw_data: Optional dictionary of original patient clinical values.
    """
    recommendations = {
        "lifestyle": [],
        "diet": [],
        "activity": [],
        "medical": []
    }
    
    # Check top negative contributors (factors increasing risk)
    # Match SHAP value index to SF-2 feature names
    from .preprocessor import SF_2_FEATURES
    
    shap_values = shap_dict.get("shap_values", [])
    features_dict = shap_dict.get("features", {})
    feature_names = list(features_dict.keys()) if features_dict else SF_2_FEATURES
    
    # Sort features by SHAP value (descending to find top risk increasers)
    shap_pairs = list(zip(feature_names, shap_values))
    shap_pairs.sort(key=lambda x: x[1] if isinstance(x[1], (int, float)) else 0, reverse=True)
    
    top_risk_factors = [f[0] for f in shap_pairs if isinstance(f[1], (int, float)) and f[1] > 0][:3]
    
    # Use raw_data if available for threshold checks (more accurate than scaled values)
    ref_vals = raw_data if raw_data is not None else shap_dict["features"]
    
    if "chol" in top_risk_factors and float(ref_vals.get("chol", 0)) > 200:
        recommendations["diet"].append("Reduce intake of saturated fats and trans fats to lower cholesterol.")
        recommendations["medical"].append("Consider discussing lipid-lowering medication (like statins) with your doctor.")
        
    if "trestbps" in top_risk_factors and float(ref_vals.get("trestbps", 0)) > 130:
        recommendations["lifestyle"].append("Monitor your blood pressure daily.")
        recommendations["diet"].append("Adopt a low-sodium line diet (DASH diet) to help control blood pressure.")
        
    if "thalach" in top_risk_factors:
        recommendations["activity"].append("Your maximum heart rate indicates potential fitness concerns. Incorporate mild cardiovascular exercises gradually.")
        
    if "oldpeak" in top_risk_factors or "slope" in top_risk_factors or "ca" in top_risk_factors:
        recommendations["medical"].append("Your clinical ECG/angiogram indicators (ST depression/vessels) strongly suggest Ischemic risks. Seek specialist review.")
        
    if "cp" in top_risk_factors:
        recommendations["medical"].append("Your chest pain type is a major contributing risk factor. Do not ignore chest discomfort.")
        
    if risk_score > 70:
        recommendations["medical"].append("URGENT: Your IHD risk is High. Consult a cardiologist promptly.")

    # Fill defaults if empty
    if not recommendations["lifestyle"]:
        recommendations["lifestyle"].append("Maintain a balanced sleep schedule and manage daily stress levels.")
    if not recommendations["diet"]:
        recommendations["diet"].append("Maintain a balanced diet rich in vegetables, fruits, and lean proteins.")
    if not recommendations["activity"]:
        recommendations["activity"].append("Aim for at least 30 minutes of moderate physical activity most days of the week.")
    if not recommendations["medical"]:
        recommendations["medical"].append("Continue with your routine annual health check-ups.")

    return recommendations
