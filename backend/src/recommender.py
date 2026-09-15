def generate_recommendations(shap_dict, risk_score, raw_data=None):
    """
    Generates personalized, deterministic prevention guidance based on SHAP feature importances,
    raw clinical indicators, and the overall risk score.
    Follows clinical decision support guidelines: non-prescriptive, evidence-based lifestyle/dietary/referral advice.
    """
    recommendations = {
        "lifestyle": [],
        "diet": [],
        "activity": [],
        "medical": []
    }
    
    from .schemas import SF_2_FEATURES
    
    shap_values = shap_dict.get("shap_values", [])
    features_dict = shap_dict.get("features", {})
    feature_names = list(features_dict.keys()) if features_dict else SF_2_FEATURES
    
    # Sort features by SHAP value (descending to identify top risk increasers)
    shap_pairs = list(zip(feature_names, shap_values))
    shap_pairs.sort(key=lambda x: x[1] if isinstance(x[1], (int, float)) else 0, reverse=True)
    
    top_risk_factors = [f[0] for f in shap_pairs if isinstance(f[1], (int, float)) and f[1] > 0][:4]
    ref_vals = raw_data if raw_data is not None else features_dict
    
    # 1. Cholesterol Guidance
    chol_val = float(ref_vals.get("chol", 0))
    if ("chol" in top_risk_factors or chol_val > 200):
        recommendations["diet"].append("Reduce dietary intake of saturated and trans fats to support healthy lipid metabolism.")
        recommendations["medical"].append("Consult your physician for a comprehensive lipid panel evaluation and cardiovascular risk review.")
        
    # 2. Blood Pressure Guidance
    bp_val = float(ref_vals.get("trestbps", 0))
    if ("trestbps" in top_risk_factors or bp_val > 130):
        recommendations["lifestyle"].append("Perform regular resting blood pressure tracking (target systolic < 120 mmHg under physician guidance).")
        recommendations["diet"].append("Adopt a low-sodium, cardiovascular-supportive dietary pattern (such as the DASH protocol).")
        
    # 3. Heart Rate & Exercise Capacity
    if "thalach" in top_risk_factors or float(ref_vals.get("thalach", 150)) < 120:
        recommendations["activity"].append("Target structured, moderate-intensity aerobic physical activity (such as brisk walking) adapted to heart rate tolerance.")
        
    # 4. ECG & Ischemia Indicators
    oldpeak_val = float(ref_vals.get("oldpeak", 0))
    if ("oldpeak" in top_risk_factors or "slope" in top_risk_factors or "ca" in top_risk_factors or oldpeak_val > 1.5):
        recommendations["medical"].append("Clinical electrocardiographic and fluoroscopy indicators suggest potential ischemic patterns. Clinical specialist review is recommended.")
        
    # 5. Chest Pain
    cp_val = float(ref_vals.get("cp", 0))
    if ("cp" in top_risk_factors or cp_val == 3):
        recommendations["medical"].append("Report any chest tightness, shortness of breath, or exertional discomfort promptly to your healthcare provider.")
        
    # 6. Risk Tier Medical Alerts (Table 7)
    if risk_score >= 70:
        recommendations["medical"].insert(0, "URGENT CLINICAL ALERT: High IHD risk score. Prompt cardiology specialist consultation and formal diagnostic workup recommended.")
    elif risk_score >= 40:
        recommendations["medical"].insert(0, "MODERATE RISK: Schedule a clinical evaluation with your primary care physician within 1–3 months.")

    # Standard Defaults to ensure all 4 categories are comprehensive
    if not recommendations["lifestyle"]:
        recommendations["lifestyle"].append("Maintain consistent sleep hygiene (7–8 hours daily) and practice structured stress reduction.")
    if len(recommendations["lifestyle"]) < 2:
        recommendations["lifestyle"].append("Avoid all forms of active and passive tobacco exposure.")

    if not recommendations["diet"]:
        recommendations["diet"].append("Emphasize a whole-food Mediterranean or DASH dietary pattern rich in vegetables, legumes, and lean proteins.")
    if len(recommendations["diet"]) < 2:
        recommendations["diet"].append("Incorporate foods rich in soluble fiber and omega-3 fatty acids.")

    if not recommendations["activity"]:
        recommendations["activity"].append("Aim for at least 150 minutes of moderate-intensity physical activity weekly, as clinically appropriate.")
    if len(recommendations["activity"]) < 2:
        recommendations["activity"].append("Incorporate light resistance training and reduce prolonged uninterrupted sitting.")

    if not recommendations["medical"]:
        recommendations["medical"].append("Continue routine preventive annual health examinations and biometric tracking.")

    return recommendations
