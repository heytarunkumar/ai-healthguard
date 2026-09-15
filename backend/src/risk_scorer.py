def calculate_risk_score(probability):
    """
    Converts a probability [0.0 - 1.0] to a Risk Score [0 - 100].
    Based on Table 7 (Project Report):
    - Low Risk: 0 - 39 (Green)
    - Moderate Risk: 40 - 69 (Amber)
    - High Risk: 70 - 100 (Red)
    """
    score = int(round(probability * 100))
    score = max(0, min(100, score))
    
    if score <= 39:
        level = "LOW RISK"
    elif score <= 69:
        level = "MODERATE RISK"
    else:
        level = "HIGH RISK"
        
    return score, level
